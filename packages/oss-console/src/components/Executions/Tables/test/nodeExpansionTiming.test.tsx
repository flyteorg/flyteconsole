import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { mockAllIsIntersecting, mockIsIntersecting } from 'react-intersection-observer/test-utils';
import Core from '@clients/common/flyteidl/core';
import { NodeExecutionsTable } from '../NodeExecutionsTable';
import { ExecutionContext, WorkflowNodeExecutionsContext } from '../../contexts';
import { dNode, dTypes } from '../../../../models/Graph/types';
import { Execution, ExecutionData, NodeExecution } from '../../../../models/Execution/types';
import { NodeExecutionPhase } from '../../../../models/Execution/enums';
import { ExecutionFiltersState } from '../../filters/useExecutionFiltersState';
import { useNodeExecutionChildrenQuery } from '../../../hooks/useNodeExecutionChildrenQuery';
import { useNodeExecutionDataQuery } from '../../../hooks/useNodeExecutionDataQuery';
import { NodeExecutionDetailsContext } from '../../contextProvider/NodeExecutionDetails/NodeExecutionDetailsContextProvider';

jest.mock('../../ExecutionFilters', () => ({ ExecutionFilters: () => null }));
jest.mock('../../ExecutionDetails/useExecutionNodeViewsStatePoll', () => ({
  ...jest.requireActual('../../ExecutionDetails/useExecutionNodeViewsStatePoll'),
  useExecutionNodeViewsStatePoll: () => ({ nodeExecutionsQuery: { isFetching: true } }),
}));
jest.mock('../../../hooks/useNodeExecutionChildrenQuery');
jest.mock('../../../hooks/useNodeExecutionDataQuery');
jest.mock('../nodeExecutionColumns', () => ({
  generateColumns: () => [{ key: 'name', cellRenderer: ({ node }: { node: dNode }) => node.name }],
}));

const child: dNode = {
  id: 'child',
  scopedId: 'parent-child',
  name: 'Child task',
  type: dTypes.task,
  nodes: [],
  edges: [],
};
const parent: dNode = {
  id: 'parent',
  scopedId: 'parent',
  name: 'Parent workflow',
  type: dTypes.subworkflow,
  nodes: [child],
  edges: [],
};
const expandedParent = { ...parent, expanded: true };
// API responses use protobuf instances, whose prototypes differ from plain objects.
const executionId = Core.WorkflowExecutionIdentifier.create({
  project: 'test-project',
  domain: 'development',
  name: 'run-123',
});
const workflowName = 'workflows.example.parent';
const workflowExecution = {
  id: executionId,
  closure: { workflowId: { name: workflowName } },
  spec: { launchPlan: { name: 'a-different-launch-plan-name' } },
} as Execution;
const filterState = { appliedFilters: [] } as unknown as ExecutionFiltersState;
const childExecution = {
  id: { nodeId: child.scopedId, executionId },
  scopedId: child.scopedId,
  closure: { phase: NodeExecutionPhase.SUCCEEDED },
} as NodeExecution;
const executions: Record<string, NodeExecution> = {
  parent: {
    id: { nodeId: parent.id, executionId },
    scopedId: parent.scopedId,
    metadata: { isParentNode: true },
    closure: { phase: NodeExecutionPhase.SUCCEEDED },
  } as NodeExecution,
  [child.scopedId]: childExecution,
};
let childrenQueries: Record<string, Partial<ReturnType<typeof useNodeExecutionChildrenQuery>>>;
let dataQueries: Record<string, Partial<ReturnType<typeof useNodeExecutionDataQuery>>>;
const updateWorkflow = jest.fn();
const setCurrentNodeExecutionsById = jest.fn();
const toggleNode = jest.fn();
const measure = jest.fn();
const originalMeasure = Object.getOwnPropertyDescriptor(performance, 'measure');
const Table = ({
  node,
  nodeExecutionsById = executions,
  execution = workflowExecution,
  filters = filterState,
}: {
  node: dNode;
  nodeExecutionsById?: Record<string, NodeExecution>;
  execution?: Execution;
  filters?: ExecutionFiltersState;
}) => (
  <WorkflowNodeExecutionsContext.Provider
    value={{
      visibleNodes: [node],
      nodeExecutionsById,
      toggleNode,
      setCurrentNodeExecutionsById,
      dagData: { mergedDag: node, dagError: null },
    }}
  >
    <ExecutionContext.Provider value={{ execution }}>
      <NodeExecutionDetailsContext.Provider
        value={{
          workflowId: execution.closure?.workflowId,
          updateWorkflow,
          getNodeExecutionDetails: jest.fn(),
        }}
      >
        <NodeExecutionsTable filterState={filters} />
      </NodeExecutionDetailsContext.Provider>
    </ExecutionContext.Provider>
  </WorkflowNodeExecutionsContext.Provider>
);

// Keep the real table and child loader; only the network hooks are mocked.
// Tests can deliver a response first, then apply it to the rendered row separately.
const renderExpansion = (props: Partial<React.ComponentProps<typeof Table>> = {}) => {
  const view = render(<Table node={parent} {...props} />);
  fireEvent.click(screen.getByTitle('Expand row'));
  const update = (changes: Partial<React.ComponentProps<typeof Table>> = {}) =>
    view.rerender(<Table node={expandedParent} {...props} {...changes} />);
  update();
  return update;
};

beforeEach(() => {
  measure.mockReset();
  Object.defineProperty(performance, 'measure', { configurable: true, value: measure });
  childrenQueries = { parent: { isSuccess: true, data: [childExecution] } };
  dataQueries = {};
  (useNodeExecutionChildrenQuery as jest.Mock).mockImplementation(
    ({ nodeExecution }) => childrenQueries[nodeExecution?.id.nodeId] ?? {},
  );
  (useNodeExecutionDataQuery as jest.Mock).mockImplementation(
    ({ id }) => dataQueries[id?.nodeId] ?? {},
  );
});
afterEach(() => jest.restoreAllMocks());
afterAll(() => {
  if (originalMeasure) Object.defineProperty(performance, 'measure', originalMeasure);
  else delete (performance as any).measure;
});

test('records both timings once for a Nodes-tab expand click with cached children', () => {
  const now = jest.spyOn(performance, 'now').mockReturnValue(100);
  const { rerender } = render(<Table node={parent} />);
  expect(screen.queryByText('Child task')).not.toBeInTheDocument();
  expect(measure).not.toHaveBeenCalled();
  fireEvent.click(screen.getByTitle('Expand row'));
  expect(toggleNode).toHaveBeenCalledWith(expect.objectContaining(parent));
  expect(measure).not.toHaveBeenCalled();

  now.mockReturnValue(350);
  measure.mockImplementationOnce(() => expect(screen.getByText('Child task')).toBeInTheDocument());
  rerender(<Table node={expandedParent} />);
  expect(measure).toHaveBeenCalledWith('flyteconsole.node.expand', {
    start: 100,
    end: 350,
    detail: { scopedId: 'parent', executionId, workflowName },
  });
  expect(measure).toHaveBeenCalledWith('flyteconsole.node.expand.children_loaded', {
    start: 100,
    end: 350,
    detail: { scopedId: 'parent', executionId, workflowName },
  });
  rerender(<Table node={{ ...expandedParent, name: 'Updated parent' }} />);
  expect(measure).toHaveBeenCalledTimes(2);
});

test('does not time initial expanded rows or collapse, but times a later expansion', () => {
  const { rerender } = render(<Table node={expandedParent} />);
  fireEvent.click(screen.getByTitle('Collapse row'));
  rerender(<Table node={parent} />);
  expect(measure).not.toHaveBeenCalled();
  fireEvent.click(screen.getByTitle('Expand row'));
  rerender(<Table node={expandedParent} />);
  expect(measure).toHaveBeenCalledTimes(2);
});

test('an unsupported timing API does not prevent child rows rendering', () => {
  const { rerender } = render(<Table node={parent} />);
  fireEvent.click(screen.getByTitle('Expand row'));
  measure.mockImplementationOnce(() => {
    throw new Error('unsupported');
  });
  expect(() => rerender(<Table node={expandedParent} />)).not.toThrow();
  expect(screen.getByText('Child task')).toBeInTheDocument();
});

test('waits for the child response to be committed to the row context', () => {
  const now = jest.spyOn(performance, 'now').mockReturnValue(100);
  childrenQueries.parent = { isSuccess: false };
  const parentOnly = { parent: executions.parent };
  const update = renderExpansion({ nodeExecutionsById: parentOnly });
  expect(screen.getByText('Child task')).toBeInTheDocument();
  expect(measure).toHaveBeenCalledTimes(1);

  now.mockReturnValue(500);
  childrenQueries.parent = { isSuccess: true, data: [childExecution] };
  update();
  expect(setCurrentNodeExecutionsById).toHaveBeenCalledWith({ [child.scopedId]: childExecution });
  expect(measure).toHaveBeenCalledTimes(1);

  now.mockReturnValue(550);
  update({ nodeExecutionsById: executions });
  expect(measure).toHaveBeenLastCalledWith('flyteconsole.node.expand.children_loaded', {
    start: 100,
    end: 550,
    detail: { scopedId: 'parent', executionId, workflowName },
  });
});

test('waits for a newly revealed dynamic child to load and render its workflow definition', () => {
  const now = jest.spyOn(performance, 'now').mockReturnValue(100);
  const dynamicExecution = {
    ...childExecution,
    metadata: { isParentNode: true, isDynamic: true },
  };
  const nodeExecutionsById = { ...executions, [child.scopedId]: dynamicExecution };
  childrenQueries[child.scopedId] = { isSuccess: false };
  const update = renderExpansion({ nodeExecutionsById });
  expect(measure).toHaveBeenCalledTimes(1);

  childrenQueries[child.scopedId] = { isSuccess: true, data: [] };
  update();
  expect(measure).toHaveBeenCalledTimes(1);

  const dynamicWorkflowId = { ...executionId, name: 'dynamic-child', version: 'v1' };
  dataQueries[child.scopedId] = {
    isSuccess: true,
    data: { dynamicWorkflow: { id: dynamicWorkflowId } } as ExecutionData,
  };
  update();
  expect(updateWorkflow).toHaveBeenCalledWith(child.scopedId, dataQueries[child.scopedId].data);
  expect(measure).toHaveBeenCalledTimes(1);

  now.mockReturnValue(900);
  const loadedChild = {
    ...child,
    value: { workflowNode: { subWorkflowRef: dynamicWorkflowId } },
  } as dNode;
  update({ node: { ...expandedParent, nodes: [loadedChild] } });
  expect(measure).toHaveBeenLastCalledWith('flyteconsole.node.expand.children_loaded', {
    start: 100,
    end: 900,
    detail: { scopedId: 'parent', executionId, workflowName },
  });
  expect(measure).toHaveBeenCalledTimes(2);
});

test.each([
  {
    name: 'an empty child response',
    query: { isSuccess: true, data: [] },
    nodeExecutionsById: { parent: executions.parent },
  },
  {
    name: 'background polling',
    query: { isSuccess: true, isFetching: true, data: [childExecution] },
    nodeExecutionsById: executions,
  },
])('does not wait for $name', ({ query, nodeExecutionsById }) => {
  childrenQueries.parent = query;
  renderExpansion({ nodeExecutionsById });
  expect(measure).toHaveBeenCalledTimes(2);
});

test.each([
  { name: 'collapse', changes: { node: parent } },
  {
    name: 'navigation',
    changes: { execution: { ...workflowExecution, id: { ...executionId, name: 'run-456' } } },
  },
  {
    name: 'filter changes',
    changes: {
      filters: {
        ...filterState,
        appliedFilters: [{ key: 'duration', operation: 'lt', value: 3600 }],
      } as ExecutionFiltersState,
    },
  },
])('cancels child loading timing on $name', ({ changes }) => {
  childrenQueries.parent = { isSuccess: false };
  const update = renderExpansion();
  update(changes);
  childrenQueries.parent = { isSuccess: true, data: [childExecution] };
  update(changes);
  expect(measure).toHaveBeenCalledTimes(1);
});

test('waits through a failed request until a retry succeeds', () => {
  childrenQueries.parent = { isSuccess: false };
  const update = renderExpansion();
  childrenQueries.parent = { isError: true };
  update();
  expect(measure).toHaveBeenCalledTimes(1);
  childrenQueries.parent = { isSuccess: true, data: [childExecution] };
  update();
  expect(measure).toHaveBeenCalledTimes(2);
});

test('waits for visibility to be known, then excludes children below the viewport', () => {
  const nodeExecutionsById = {
    ...executions,
    [child.scopedId]: { ...childExecution, metadata: { isParentNode: true, isDynamic: true } },
  };
  renderExpansion({ nodeExecutionsById });
  expect(measure).toHaveBeenCalledTimes(1);
  mockAllIsIntersecting(true);
  expect(measure).toHaveBeenCalledTimes(1);

  mockIsIntersecting(screen.getByText('Child task').closest('tr')!, false);
  expect(measure).toHaveBeenCalledTimes(2);
});

test('preserves timing when filters are recreated with the same values', () => {
  childrenQueries.parent = { isSuccess: false };
  const update = renderExpansion();
  update({ filters: { ...filterState, appliedFilters: [] } });
  expect(measure).toHaveBeenCalledTimes(1);
  childrenQueries.parent = { isSuccess: true, data: [childExecution] };
  update({ filters: { ...filterState, appliedFilters: [] } });
  expect(measure).toHaveBeenCalledTimes(2);
});
