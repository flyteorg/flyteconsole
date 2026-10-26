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
const loadedExecutions: Record<string, NodeExecution> = {
  parent: executionFor(parent, { isParentNode: true }),
  [child.scopedId]: childExecution,
};
const executionsWithDynamicChild = {
  ...loadedExecutions,
  [child.scopedId]: executionFor(child, { isParentNode: true, isDynamic: true }),
};
// These are API results. loadedExecutions is the separate data already applied to the table.
let childQueryResults: Record<string, Partial<ReturnType<typeof useNodeExecutionChildrenQuery>>>;
let workflowQueryResults: Record<string, Partial<ReturnType<typeof useNodeExecutionDataQuery>>>;
const updateWorkflow = jest.fn();
const setCurrentNodeExecutionsById = jest.fn();
const toggleNode = jest.fn();
const measure = jest.fn();
const originalMeasure = Object.getOwnPropertyDescriptor(performance, 'measure');
const TestTable = ({
  node = parent,
  nodeExecutionsById = loadedExecutions,
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

// Keep the real table and row providers. Since toggleNode is mocked, supply the expanded
// tree ourselves. The returned function lets each test apply later API and table updates.
const expandParent = (props: Partial<React.ComponentProps<typeof TestTable>> = {}) => {
  let tableProps = { node: parent, ...props };
  const view = render(<TestTable {...tableProps} />);
  fireEvent.click(screen.getByTitle('Expand row'));
  const rerenderTable = (changes: Partial<React.ComponentProps<typeof TestTable>> = {}) => {
    tableProps = { ...tableProps, ...changes };
    view.rerender(<TestTable {...tableProps} />);
  };
  rerenderTable({ node: { ...tableProps.node, expanded: true } });
  return rerenderTable;
};

// Assert that rows committed, but no child-readiness measurement has been emitted.
const expectOnlyRowTiming = () => {
  expect(measure).toHaveBeenCalledTimes(1);
  expect(measure).toHaveBeenCalledWith('flyteconsole.node.expand', expect.any(Object));
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
  childQueryResults = { parent: { isSuccess: true, data: [childExecution] } };
  workflowQueryResults = {};
  (useNodeExecutionChildrenQuery as jest.Mock).mockImplementation(
    ({ nodeExecution }) => childQueryResults[nodeExecution?.id.nodeId] ?? {},
  );
  (useNodeExecutionDataQuery as jest.Mock).mockImplementation(
    ({ id }) => workflowQueryResults[id?.nodeId] ?? {},
  );
});
afterEach(() => jest.restoreAllMocks());
afterAll(() => {
  if (originalMeasure) Object.defineProperty(performance, 'measure', originalMeasure);
  else delete (performance as any).measure;
});

test('records both timings once for a Nodes-tab expand click with cached children', () => {
  const now = jest.spyOn(performance, 'now').mockReturnValue(100);
  const { rerender } = render(<TestTable node={parent} />);
  expect(screen.queryByText('Child task')).not.toBeInTheDocument();
  expect(measure).not.toHaveBeenCalled();
  fireEvent.click(screen.getByTitle('Expand row'));
  expect(toggleNode).toHaveBeenCalledWith(expect.objectContaining(parent));
  expect(measure).not.toHaveBeenCalled();

  // A render can happen before the expanded node reaches the table.
  rerender(<TestTable node={parent} filters={{ ...filterState, appliedFilters: [] }} />);
  expect(measure).not.toHaveBeenCalled();

  now.mockReturnValue(350);
  measure.mockImplementationOnce(() => expect(screen.getByText('Child task')).toBeInTheDocument());
  rerender(<TestTable node={expandedParent} />);
  expectTiming('expand', 100, 350);
  expectTiming('expand.children_loaded', 100, 350);
  rerender(<TestTable node={{ ...expandedParent, name: 'Updated parent' }} />);
  expect(measure).toHaveBeenCalledTimes(2);
});

test('does not time initial expanded rows or collapse, but times a later expansion', () => {
  const { rerender } = render(<TestTable node={expandedParent} />);
  fireEvent.click(screen.getByTitle('Collapse row'));
  rerender(<TestTable node={parent} />);
  expect(measure).not.toHaveBeenCalled();
  fireEvent.click(screen.getByTitle('Expand row'));
  rerender(<TestTable node={expandedParent} />);
  expect(measure).toHaveBeenCalledTimes(2);
});

test('an unsupported timing API does not prevent child rows rendering', () => {
  const { rerender } = render(<TestTable node={parent} />);
  fireEvent.click(screen.getByTitle('Expand row'));
  measure.mockImplementationOnce(() => {
    throw new Error('unsupported');
  });
  expect(() => rerender(<TestTable node={expandedParent} />)).not.toThrow();
  expect(screen.getByText('Child task')).toBeInTheDocument();
});

test('waits for the child response to be applied to the table before recording readiness', () => {
  const now = jest.spyOn(performance, 'now').mockReturnValue(100);
  childQueryResults.parent = { isSuccess: false };
  const parentOnly = { parent: loadedExecutions.parent };
  const rerenderTable = expandParent({ nodeExecutionsById: parentOnly });
  expect(screen.getByText('Child task')).toBeInTheDocument();
  expectOnlyRowTiming();

  // The response arrives, but the shared table data still contains only the parent.
  now.mockReturnValue(500);
  childQueryResults.parent = { isSuccess: true, data: [childExecution] };
  rerenderTable();
  expect(setCurrentNodeExecutionsById).toHaveBeenCalledWith({ [child.scopedId]: childExecution });
  expectOnlyRowTiming();

  // Applying the child record completes readiness, using the original click time.
  now.mockReturnValue(550);
  rerenderTable({ nodeExecutionsById: loadedExecutions });
  expectTiming('expand.children_loaded', 100, 550);
  expect(measure).toHaveBeenCalledTimes(2);
});

test('keeps the original timer through a failed request and unchanged filters', () => {
  const now = jest.spyOn(performance, 'now').mockReturnValue(100);
  childQueryResults.parent = { isSuccess: false };
  const parentOnly = { parent: loadedExecutions.parent };
  const rerenderTable = expandParent({ nodeExecutionsById: parentOnly });
  expectOnlyRowTiming();

  // Recreating the same filters while a request fails must not cancel or restart the timer.
  now.mockReturnValue(300);
  childQueryResults.parent = { isError: true };
  rerenderTable({ filters: { ...filterState, appliedFilters: [] } });
  expectOnlyRowTiming();

  // The retry succeeds, but its data still needs to reach the table.
  now.mockReturnValue(500);
  childQueryResults.parent = { isSuccess: true, data: [childExecution] };
  rerenderTable();
  expectOnlyRowTiming();

  // Applying the response finishes the original timer, including the failed request's wait.
  now.mockReturnValue(550);
  rerenderTable({ nodeExecutionsById: loadedExecutions });
  expectTiming('expand.children_loaded', 100, 550);
  expect(measure).toHaveBeenCalledTimes(2);
});

test('waits for a dynamic child workflow definition to be applied to the graph', () => {
  const now = jest.spyOn(performance, 'now').mockReturnValue(100);
  childQueryResults[child.scopedId] = { isSuccess: false };
  const rerenderTable = expandParent({ nodeExecutionsById: executionsWithDynamicChild });
  expectOnlyRowTiming();

  // Child execution loading has finished, but the workflow definition is still missing.
  childQueryResults[child.scopedId] = { isSuccess: true, data: [] };
  rerenderTable();
  expectOnlyRowTiming();

  // Downloading the definition asks the provider to apply it; that alone is not readiness.
  const dynamicWorkflowId = { ...executionId, name: 'dynamic-child', version: 'v1' };
  workflowQueryResults[child.scopedId] = {
    isSuccess: true,
    data: { dynamicWorkflow: { id: dynamicWorkflowId } } as ExecutionData,
  };
  rerenderTable();
  expect(updateWorkflow).toHaveBeenCalledWith(
    child.scopedId,
    workflowQueryResults[child.scopedId].data,
  );
  expectOnlyRowTiming();

  // The row's graph now references the downloaded definition.
  now.mockReturnValue(900);
  const loadedChild = {
    ...child,
    value: { workflowNode: { subWorkflowRef: dynamicWorkflowId } },
  } as dNode;
  rerenderTable({ node: { ...expandedParent, nodes: [loadedChild] } });
  expectTiming('expand.children_loaded', 100, 900);
  expect(measure).toHaveBeenCalledTimes(2);
});

test('a successful empty child response counts as ready', () => {
  childQueryResults.parent = { isSuccess: true, data: [], isFetching: false };
  expandParent({ nodeExecutionsById: { parent: loadedExecutions.parent } });
  expect(measure).toHaveBeenCalledTimes(2);
});

test('background polling does not delay readiness when child data is already loaded', () => {
  childQueryResults.parent = { isSuccess: true, data: [childExecution], isFetching: true };
  expandParent();
  expect(measure).toHaveBeenCalledTimes(2);
});

test('collapsing the parent cancels its pending child-loading measurement', () => {
  childQueryResults.parent = { isSuccess: false };
  const rerenderTable = expandParent();
  fireEvent.click(screen.getByTitle('Collapse row'));
  rerenderTable({ node: parent });

  // A response arriving after collapse must not finish the cancelled measurement.
  childQueryResults.parent = { isSuccess: true, data: [childExecution] };
  rerenderTable();
  expectOnlyRowTiming();
});

test.each([
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
  childQueryResults.parent = { isSuccess: false };
  const rerenderTable = expandParent();
  rerenderTable(changes);

  // The old response arrives after the user has moved to a different view.
  childQueryResults.parent = { isSuccess: true, data: [childExecution] };
  rerenderTable();
  expectOnlyRowTiming();
});

test('waits for visibility to be known, then excludes children below the viewport', () => {
  expandParent({ nodeExecutionsById: executionsWithDynamicChild });
  expectOnlyRowTiming();

  // A visible dynamic child is still loading, so it must hold the timer open.
  mockAllIsIntersecting(true);
  expectOnlyRowTiming();

  // Once confirmed offscreen, it no longer blocks the timer: fetching is visibility-driven.
  mockIsIntersecting(screen.getByText('Child task').closest('tr')!, false);
  expect(measure).toHaveBeenCalledTimes(2);
});

test('does not rerender the table for readiness reports without an active expansion', () => {
  childQueryResults.parent = { isSuccess: false };
  render(<TestTable node={parent} />);

  // The table renders ExecutionFilters on each render. Its mock lets us detect table
  // renders separately from row-provider renders, which visibility changes should cause.
  const renderFilters = ExecutionFilters as jest.Mock;
  expect(renderFilters).toHaveBeenCalled();
  renderFilters.mockClear();

  // Visibility changes rerender the provider and change its readiness report.
  mockAllIsIntersecting(false);
  mockAllIsIntersecting(true);

  expect(renderFilters).not.toHaveBeenCalled();
  expect(measure).not.toHaveBeenCalled();
});

test('a second expansion replaces the pending child-loading measurement', () => {
  const now = jest.spyOn(performance, 'now').mockReturnValue(100);
  const grandchild = { ...child, id: 'grandchild', scopedId: 'parent-child-grandchild' };
  const nestedChild = { ...child, type: dTypes.subworkflow, nodes: [grandchild] };
  const nestedParent = { ...parent, nodes: [nestedChild] };
  const grandchildExecution = executionFor(grandchild);
  const nodeExecutionsById = {
    ...loadedExecutions,
    [child.scopedId]: executionFor(child, { isParentNode: true }),
    [grandchild.scopedId]: grandchildExecution,
  };
  childQueryResults.parent = { isSuccess: false };
  childQueryResults[child.scopedId] = { isSuccess: false };
  const rerenderTable = expandParent({ node: nestedParent, nodeExecutionsById });
  expectOnlyRowTiming();

  // Click the child before the parent's loading timer finishes. Timing now belongs to the child.
  now.mockReturnValue(250);
  fireEvent.click(screen.getByTitle('Expand row'));
  rerenderTable({ node: { ...expandedParent, nodes: [{ ...nestedChild, expanded: true }] } });
  expect(measure).toHaveBeenCalledTimes(2); // One row-commit measurement per click.

  // The child's loading measurement must use its own click time, not the parent's.
  now.mockReturnValue(600);
  childQueryResults[child.scopedId] = { isSuccess: true, data: [grandchildExecution] };
  rerenderTable();
  expectTiming('expand.children_loaded', 250, 600, child.scopedId);
  expect(measure).toHaveBeenCalledTimes(3);

  // Finishing the first expansion's request must not emit its cancelled timing.
  childQueryResults.parent = { isSuccess: true, data: [nodeExecutionsById[child.scopedId]] };
  rerenderTable();
  expect(measure).toHaveBeenCalledTimes(3);
});
