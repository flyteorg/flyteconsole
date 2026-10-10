import React, { PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react';
import { dNode, dTypes } from '../../../../../models/Graph/types';
import { NodeExecution } from '../../../../../models/Execution/types';
import { NodeExecutionPhase } from '../../../../../models/Execution/enums';
import { CompiledWorkflowClosure } from '../../../../../models/Workflow/types';
import { createMockWorkflowClosure } from '../../../../../models/__mocks__/workflowData';
import { transformerWorkflowToDag } from '../../../../WorkflowGraph/transformerWorkflowToDag';
import { NodeExecutionDetailsContext } from '../NodeExecutionDetailsContextProvider';
import {
  WorkflowNodeExecutionsProvider,
  useNodeExecutionsById,
} from '../WorkflowNodeExecutionsProvider';

jest.mock('../../../../WorkflowGraph/transformerWorkflowToDag', () => ({
  transformerWorkflowToDag: jest.fn(),
}));

const mockTransformer = transformerWorkflowToDag as jest.MockedFunction<
  typeof transformerWorkflowToDag
>;

const makeNode = (scopedId: string, nodes: dNode[] = []): dNode => ({
  id: scopedId,
  scopedId,
  type: dTypes.task,
  name: scopedId,
  nodes,
  edges: [],
});

const makeExecution = (scopedId: string): NodeExecution => ({
  id: {
    nodeId: scopedId,
    executionId: { project: 'project', domain: 'domain', name: 'execution' },
  },
  scopedId,
  inputUri: 'inputs',
  metadata: { isParentNode: true, specNodeId: scopedId },
  closure: { phase: NodeExecutionPhase.RUNNING, outputUri: 'outputs' },
});

describe('WorkflowNodeExecutionsProvider', () => {
  let closure: CompiledWorkflowClosure;
  let dag: dNode;

  beforeEach(() => {
    closure = { primary: {} } as CompiledWorkflowClosure;
    dag = makeNode('start-node', [
      makeNode('n1', [makeNode('n1-0-n1', [makeNode('n1-0-n1-0-n1')])]),
      makeNode('n2'),
      makeNode('end-node'),
    ]);
    mockTransformer.mockReturnValue({ dag, staticExecutionIdsMap: {} });
  });

  const renderProvider = (initialNodeExecutions?: NodeExecution[]) => {
    const wrapper = ({ children }: PropsWithChildren<{}>) => (
      <NodeExecutionDetailsContext.Provider
        value={{
          workflowId: {
            project: 'project',
            domain: 'domain',
            name: 'workflow',
            version: 'version',
          },
          compiledWorkflowClosure: closure,
          getNodeExecutionDetails: jest.fn(),
          updateWorkflow: jest.fn(),
        }}
      >
        <WorkflowNodeExecutionsProvider initialNodeExecutions={initialNodeExecutions}>
          {children}
        </WorkflowNodeExecutionsProvider>
      </NodeExecutionDetailsContext.Provider>
    );
    return renderHook(() => useNodeExecutionsById(), { wrapper });
  };

  // Reference identity (toBe) and transformer call counts verify reuse directly, without a
  // timing benchmark. Equal contents (toEqual) alone would also pass for expensive deep clones.
  it('expands nested nodes without rebuilding the compiled graph or mutating it', () => {
    const { result } = renderProvider();
    expect(result.current.visibleNodes.map((node) => node.scopedId)).toEqual(['n1', 'n2']);
    const sibling = result.current.visibleNodes[1];

    act(() => result.current.toggleNode(result.current.visibleNodes[0]));
    act(() => result.current.toggleNode(result.current.visibleNodes[0].nodes[0]));

    expect(result.current.visibleNodes[0].expanded).toBe(true);
    expect(result.current.visibleNodes[0].nodes[0].expanded).toBe(true);
    expect(result.current.visibleNodes[1]).toBe(sibling);
    expect(dag.nodes[0].expanded).toBeUndefined();
    expect(dag.nodes[0].nodes[0].expanded).toBeUndefined();
    expect(mockTransformer).toHaveBeenCalledTimes(1);

    act(() => result.current.toggleNode(result.current.visibleNodes[0]));
    expect(result.current.visibleNodes[0].expanded).toBe(false);
    expect(result.current.visibleNodes[0].nodes[0].expanded).toBe(true);
    expect(mockTransformer).toHaveBeenCalledTimes(1);
  });

  it('incorporates newly loaded workflow nodes while preserving expansion state', () => {
    const { result, rerender } = renderProvider();
    act(() => result.current.toggleNode(result.current.visibleNodes[0]));

    // Loading a dynamic definition supplies a new closure object and must invalidate the graph.
    closure = { ...closure };
    const newDag = makeNode('start-node', [makeNode('n1', [makeNode('dynamic-child')])]);
    mockTransformer.mockReturnValue({ dag: newDag, staticExecutionIdsMap: {} });
    rerender();

    expect(result.current.visibleNodes[0].expanded).toBe(true);
    expect(result.current.visibleNodes[0].nodes[0].scopedId).toBe('dynamic-child');
    expect(mockTransformer).toHaveBeenCalledTimes(2);
  });

  it('produces the same graph metadata as passing flags to the workflow transformer', () => {
    const actualTransformer = jest.requireActual(
      '../../../../WorkflowGraph/transformerWorkflowToDag',
    ).transformerWorkflowToDag as typeof transformerWorkflowToDag;
    closure = createMockWorkflowClosure().compiledWorkflow!;
    mockTransformer.mockImplementation(actualTransformer);
    const { result } = renderProvider();
    const node = result.current.visibleNodes[0];
    act(() =>
      result.current.setCurrentNodeExecutionsById({
        [node.scopedId]: makeExecution(node.scopedId),
      }),
    );
    act(() => result.current.toggleNode(node));

    // Separating compilation from the metadata overlay must preserve the transformer's output.
    const expected = actualTransformer(closure, {
      [node.scopedId]: { expanded: true, isParentNode: true },
    });
    expect(result.current.dagData.mergedDag).toEqual(expected.dag);
    expect(mockTransformer).toHaveBeenCalledTimes(1);
  });

  it('preserves references for unchanged polling results and unrelated executions', () => {
    const first = makeExecution('n1');
    const second = makeExecution('n2');
    const { result } = renderProvider([first, second]);
    const before = result.current;

    // Simulate a fresh response object with unchanged values; identity alone cannot detect this.
    act(() => result.current.setCurrentNodeExecutionsById({ n1: { ...first } }));
    expect(result.current.nodeExecutionsById).toBe(before.nodeExecutionsById);
    expect(result.current.visibleNodes).toBe(before.visibleNodes);
    expect(result.current.setCurrentNodeExecutionsById).toBe(before.setCurrentNodeExecutionsById);

    act(() =>
      result.current.setCurrentNodeExecutionsById({
        n1: { ...first, closure: { ...first.closure, phase: NodeExecutionPhase.SUCCEEDED } },
      }),
    );
    expect(result.current.nodeExecutionsById.n1.closure.phase).toBe(NodeExecutionPhase.SUCCEEDED);
    expect(result.current.nodeExecutionsById.n2).toBe(before.nodeExecutionsById.n2);
    expect(before.nodeExecutionsById.n1.closure.phase).toBe(NodeExecutionPhase.RUNNING);
    expect(first.closure.phase).toBe(NodeExecutionPhase.RUNNING);
    expect(result.current.visibleNodes).toBe(before.visibleNodes);
    expect(mockTransformer).toHaveBeenCalledTimes(1);
  });

  it('merges partial execution responses without dropping existing fields', () => {
    const first = makeExecution('n1');
    const { result } = renderProvider([first]);
    const partial = {
      scopedId: 'n1',
      closure: { phase: NodeExecutionPhase.SUCCEEDED },
    } as NodeExecution;

    act(() => result.current.setCurrentNodeExecutionsById({ n1: partial }));
    expect(result.current.nodeExecutionsById.n1).toEqual({
      ...first,
      closure: { ...first.closure, phase: NodeExecutionPhase.SUCCEEDED },
    });
    const merged = result.current.nodeExecutionsById;
    // The partial object still differs from the complete record. Only the post-merge comparison
    // can recognize that repeating this response adds nothing and preserve the map's reference.
    act(() => result.current.setCurrentNodeExecutionsById({ n1: partial }));
    expect(result.current.nodeExecutionsById).toBe(merged);
  });

  it('handles a workflow that has not loaded yet and graph transformation errors', () => {
    closure = undefined as unknown as CompiledWorkflowClosure;
    const { result, rerender } = renderProvider();
    expect(result.current.visibleNodes).toEqual([]);
    expect(mockTransformer).not.toHaveBeenCalled();

    closure = { primary: {} } as CompiledWorkflowClosure;
    const error = new Error('Invalid workflow');
    mockTransformer.mockReturnValue({ dag: {} as dNode, staticExecutionIdsMap: {}, error });
    rerender();
    expect(result.current.dagData.dagError).toBe(error);
    expect(result.current.visibleNodes).toEqual([]);
  });
});
