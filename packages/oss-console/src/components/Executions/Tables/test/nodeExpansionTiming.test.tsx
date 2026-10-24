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
import { ExecutionFilters } from '../../ExecutionFilters';

jest.mock('../../ExecutionFilters', () => ({ ExecutionFilters: jest.fn(() => null) }));
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
const executionFor = (node: dNode, metadata: NodeExecution['metadata'] = {}) =>
  ({
    id: { nodeId: node.scopedId, executionId },
    scopedId: node.scopedId,
    metadata,
    closure: { phase: NodeExecutionPhase.SUCCEEDED },
  } as NodeExecution);
const childExecution = executionFor(child);
const executions: Record<string, NodeExecution> = {
  parent: executionFor(parent, { isParentNode: true }),
  [child.scopedId]: childExecution,
};
const dynamicExecutions = {
  ...executions,
  [child.scopedId]: executionFor(child, { isParentNode: true, isDynamic: true }),
};
let childrenQueries: Record<string, Partial<ReturnType<typeof useNodeExecutionChildrenQuery>>>;
let dataQueries: Record<string, Partial<ReturnType<typeof useNodeExecutionDataQuery>>>;
const updateWorkflow = jest.fn();
const setCurrentNodeExecutionsById = jest.fn();
const toggleNode = jest.fn();
const measure = jest.fn();
const originalMeasure = Object.getOwnPropertyDescriptor(performance, 'measure');
const Table = ({
  node = parent,
  nodeExecutionsById = executions,
  execution = workflowExecution,
  filters = filterState,
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

// Keep the real table and loader; responses and their application to rows are controlled separately.
const renderExpansion = (props: Partial<React.ComponentProps<typeof Table>> = {}) => {
  let current = { node: parent, ...props };
  const view = render(<Table {...current} />);
  fireEvent.click(screen.getByTitle('Expand row'));
  const update = (changes: Partial<React.ComponentProps<typeof Table>> = {}) => {
    current = { ...current, ...changes };
    view.rerender(<Table {...current} />);
  };
  update({ node: { ...current.node, expanded: true } });
  return update;
};

const expectTiming = (name: string, start: number, end: number, scopedId = parent.scopedId) =>
  expect(measure).toHaveBeenCalledWith(`flyteconsole.node.${name}`, {
    start,
    end,
    detail: { scopedId, executionId, workflowName },
  });

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

  // A render can happen before the expanded node reaches the table.
  rerender(<Table node={parent} filters={{ ...filterState, appliedFilters: [] }} />);
  expect(measure).not.toHaveBeenCalled();

  now.mockReturnValue(350);
  measure.mockImplementationOnce(() => expect(screen.getByText('Child task')).toBeInTheDocument());
  rerender(<Table node={expandedParent} />);
  expectTiming('expand', 100, 350);
  expectTiming('expand.children_loaded', 100, 350);
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

test('waits through retries and equivalent filter updates until the response reaches the rows', () => {
  const now = jest.spyOn(performance, 'now').mockReturnValue(100);
  childrenQueries.parent = { isSuccess: false };
  const parentOnly = { parent: executions.parent };
  const update = renderExpansion({ nodeExecutionsById: parentOnly });
  expect(screen.getByText('Child task')).toBeInTheDocument();
  expect(measure).toHaveBeenCalledTimes(1);

  childrenQueries.parent = { isError: true };
  update({ filters: { ...filterState, appliedFilters: [] } });
  expect(measure).toHaveBeenCalledTimes(1);

  now.mockReturnValue(500);
  childrenQueries.parent = { isSuccess: true, data: [childExecution] };
  update();
  expect(setCurrentNodeExecutionsById).toHaveBeenCalledWith({ [child.scopedId]: childExecution });
  expect(measure).toHaveBeenCalledTimes(1);

  now.mockReturnValue(550);
  update({ nodeExecutionsById: executions });
  expectTiming('expand.children_loaded', 100, 550);
  expect(measure).toHaveBeenCalledTimes(2);
});

test('waits for a newly revealed dynamic child to load and render its workflow definition', () => {
  const now = jest.spyOn(performance, 'now').mockReturnValue(100);
  childrenQueries[child.scopedId] = { isSuccess: false };
  const update = renderExpansion({ nodeExecutionsById: dynamicExecutions });
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
  expectTiming('expand.children_loaded', 100, 900);
  expect(measure).toHaveBeenCalledTimes(2);
});

test.each([
  { name: 'an empty child response', data: [], isFetching: false },
  { name: 'background polling', data: [childExecution], isFetching: true },
])('does not wait for $name', ({ data, isFetching }) => {
  childrenQueries.parent = { isSuccess: true, data, isFetching };
  renderExpansion({ nodeExecutionsById: data.length ? executions : { parent: executions.parent } });
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
])('cancels child loading timing on $name', ({ name, changes }) => {
  childrenQueries.parent = { isSuccess: false };
  const update = renderExpansion();
  if (name === 'collapse') {
    fireEvent.click(screen.getByTitle('Collapse row'));
  }
  update(changes);
  childrenQueries.parent = { isSuccess: true, data: [childExecution] };
  update(changes);
  expect(measure).toHaveBeenCalledTimes(1);
});

test('waits for visibility to be known, then excludes children below the viewport', () => {
  renderExpansion({ nodeExecutionsById: dynamicExecutions });
  expect(measure).toHaveBeenCalledTimes(1);
  mockAllIsIntersecting(true);
  expect(measure).toHaveBeenCalledTimes(1);

  mockIsIntersecting(screen.getByText('Child task').closest('tr')!, false);
  expect(measure).toHaveBeenCalledTimes(2);
});

test('does not rerender the table for readiness reports without an active expansion', () => {
  childrenQueries.parent = { isSuccess: false };
  render(<Table node={parent} />);
  (ExecutionFilters as jest.Mock).mockClear();

  // Visibility changes rerender the provider and change its readiness report.
  mockAllIsIntersecting(false);
  mockAllIsIntersecting(true);

  expect(ExecutionFilters).not.toHaveBeenCalled();
  expect(measure).not.toHaveBeenCalled();
});

test('a second expansion replaces the pending child-loading measurement', () => {
  const now = jest.spyOn(performance, 'now').mockReturnValue(100);
  const grandchild = { ...child, id: 'grandchild', scopedId: 'parent-child-grandchild' };
  const nestedChild = { ...child, type: dTypes.subworkflow, nodes: [grandchild] };
  const nestedParent = { ...parent, nodes: [nestedChild] };
  const grandchildExecution = executionFor(grandchild);
  const nodeExecutionsById = {
    ...executions,
    [child.scopedId]: executionFor(child, { isParentNode: true }),
    [grandchild.scopedId]: grandchildExecution,
  };
  childrenQueries.parent = { isSuccess: false };
  childrenQueries[child.scopedId] = { isSuccess: false };
  const update = renderExpansion({ node: nestedParent, nodeExecutionsById });
  expect(measure).toHaveBeenCalledTimes(1);

  now.mockReturnValue(250);
  fireEvent.click(screen.getByTitle('Expand row'));
  update({ node: { ...expandedParent, nodes: [{ ...nestedChild, expanded: true }] } });
  expect(measure).toHaveBeenCalledTimes(2);

  now.mockReturnValue(600);
  childrenQueries[child.scopedId] = { isSuccess: true, data: [grandchildExecution] };
  update();
  expectTiming('expand.children_loaded', 250, 600, child.scopedId);
  expect(measure).toHaveBeenCalledTimes(3);

  // Finishing the first expansion's request must not emit its cancelled timing.
  childrenQueries.parent = { isSuccess: true, data: [nodeExecutionsById[child.scopedId]] };
  update();
  expect(measure).toHaveBeenCalledTimes(3);
});
