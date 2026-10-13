import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { NodeExecutionsTable } from '../NodeExecutionsTable';
import { ExecutionContext, WorkflowNodeExecutionsContext } from '../../contexts';
import { dNode, dTypes } from '../../../../models/Graph/types';
import { Execution, NodeExecution } from '../../../../models/Execution/types';
import { NodeExecutionPhase } from '../../../../models/Execution/enums';
import { ExecutionFiltersState } from '../../filters/useExecutionFiltersState';

jest.mock('../../ExecutionFilters', () => ({ ExecutionFilters: () => null }));
jest.mock('../../ExecutionDetails/useExecutionNodeViewsStatePoll', () => ({
  ...jest.requireActual('../../ExecutionDetails/useExecutionNodeViewsStatePoll'),
  useExecutionNodeViewsStatePoll: () => ({ nodeExecutionsQuery: { isFetching: true } }),
}));
jest.mock('../../contextProvider/NodeExecutionDetails/NodeExecutionDynamicProvider', () => ({
  NodeExecutionDynamicProvider: ({ children }: React.PropsWithChildren<{}>) => children,
  useNodeExecutionDynamicContext: () => ({ componentProps: {} }),
}));
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
const executionId = { project: 'test-project', domain: 'development', name: 'run-123' };
const filterState = { appliedFilters: [] } as unknown as ExecutionFiltersState;
const executions = {
  parent: {
    metadata: { isParentNode: true },
    closure: { phase: NodeExecutionPhase.SUCCEEDED },
  } as NodeExecution,
};
const toggleNode = jest.fn();
const measure = jest.fn();
const originalMeasure = Object.getOwnPropertyDescriptor(performance, 'measure');
const Table = ({ node }: { node: dNode }) => (
  <WorkflowNodeExecutionsContext.Provider
    value={{
      visibleNodes: [node],
      nodeExecutionsById: executions,
      toggleNode,
      setCurrentNodeExecutionsById: () => {},
      dagData: { mergedDag: node, dagError: null },
    }}
  >
    <ExecutionContext.Provider value={{ execution: { id: executionId } as Execution }}>
      <NodeExecutionsTable filterState={filterState} />
    </ExecutionContext.Provider>
  </WorkflowNodeExecutionsContext.Provider>
);

beforeEach(() =>
  Object.defineProperty(performance, 'measure', { configurable: true, value: measure }),
);
afterEach(() => jest.restoreAllMocks());
afterAll(() => {
  if (originalMeasure) Object.defineProperty(performance, 'measure', originalMeasure);
  else delete (performance as any).measure;
});

test('times an actual Nodes-tab expand click until child rows commit, once', () => {
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
    detail: { scopedId: 'parent', executionId },
  });
  rerender(<Table node={{ ...expandedParent, name: 'Updated parent' }} />);
  expect(measure).toHaveBeenCalledTimes(1);
});

test('does not time initial expanded rows or collapse, but times a later expansion', () => {
  const { rerender } = render(<Table node={expandedParent} />);
  fireEvent.click(screen.getByTitle('Collapse row'));
  rerender(<Table node={parent} />);
  expect(measure).not.toHaveBeenCalled();
  fireEvent.click(screen.getByTitle('Expand row'));
  rerender(<Table node={expandedParent} />);
  expect(measure).toHaveBeenCalledTimes(1);
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
