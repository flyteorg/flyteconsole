import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider as QueryClientProviderImport,
  QueryClientProviderProps,
} from 'react-query';
import { mockWorkflowId } from '../../../../mocks/data/fixtures/types';
import { dTypes } from '../../../../models/Graph/types';
import { WorkflowNodeExecutionsContext } from '../../../Executions/contexts';
import { NodeExecutionPhase } from '../../../../models/Execution/enums';
import { dateToTimestamp } from '../../../../common/utils';
import { createTestQueryClient } from '../../../../test/utils';
import { PausedTasksComponent } from '../PausedTasksComponent';
import { NodeExecutionDetailsContext } from '../../../Executions/contextProvider/NodeExecutionDetails/NodeExecutionDetailsContextProvider';

const pausedNodes = [
  {
    id: 'n1',
    scopedId: 'n1',
    type: dTypes.gateNode,
    name: 'node1',
    nodes: [],
    edges: [],
  },
  {
    id: 'n2',
    scopedId: 'n2',
    type: dTypes.gateNode,
    name: 'node2',
    nodes: [],
    edges: [],
  },
];

const nodeExecutionsById = {
  n1: {
    closure: {
      createdAt: dateToTimestamp(new Date()),
      outputUri: '',
      phase: NodeExecutionPhase.UNDEFINED,
    },
    id: {
      executionId: { domain: 'domain', name: 'name', project: 'project' },
      nodeId: 'n1',
    },
    inputUri: '',
    scopedId: 'n1',
  },
};

const compiledWorkflowClosure = {
  primary: {
    connections: {
      downstream: {},
      upstream: {},
    },
    template: {
      id: {
        project: '',
        domain: '',
        name: '',
        version: '',
      },
      nodes: [
        {
          id: 'n1',
          scopedId: 'n1',
          type: dTypes.gateNode,
          name: 'node1',
          nodes: [],
          edges: [],
        },
      ],
    },
  },
  tasks: [],
};

const QueryClientProvider: React.FC<React.PropsWithChildren<QueryClientProviderProps>> =
  QueryClientProviderImport;

jest.mock('../../../../components/Launch/LaunchForm/LaunchFormDialog', () => ({
  LaunchFormDialog: jest.fn(({ children }) => (
    <div data-testid="launch-form-dialog">{children}</div>
  )),
}));

jest.mock('../../../../components/Executions/ExecutionDetails/Timeline/NodeExecutionName', () => ({
  NodeExecutionName: jest.fn(({ children }) => <div data-testid="task-names">{children}</div>),
}));

/**
 * TODO: silence errors
 */
describe('flytegraph > ReactFlow > PausedTasksComponent', () => {
  let queryClient: QueryClient;
  beforeEach(() => {
    queryClient = createTestQueryClient();
    window.IntersectionObserver = jest.fn().mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
  });

  const renderComponent = (props) =>
    render(
      <QueryClientProvider client={queryClient}>
        <NodeExecutionDetailsContext.Provider
          value={{
            getNodeExecutionDetails: jest.fn(),
            workflowId: mockWorkflowId,
            compiledWorkflowClosure,
            updateWorkflow: jest.fn(),
          }}
        >
          <WorkflowNodeExecutionsContext.Provider
            value={{
              nodeExecutionsById,
              dagData: {
                dagError: null,
                mergedDag: {} as any,
              },
              visibleNodes: props.nodes,
              setCurrentNodeExecutionsById: () => {},
              toggleNode: () => {},
            }}
          >
            <PausedTasksComponent {...props} />
          </WorkflowNodeExecutionsContext.Provider>
        </NodeExecutionDetailsContext.Provider>
        ,
      </QueryClientProvider>,
    );

  it('should render just the Paused Tasks button, if initialIsVisible was not passed', () => {
    const { queryByTitle, queryByTestId } = renderComponent({ pausedNodes });
    expect(queryByTitle('Paused Tasks')).toBeInTheDocument();
    expect(queryByTestId('paused-tasks-table')).not.toBeInTheDocument();
  });

  it('should render just the Paused Tasks button, if initialIsVisible is false', () => {
    const { queryByTitle, queryByTestId } = renderComponent({
      pausedNodes,
      initialIsVisible: false,
    });
    expect(queryByTitle('Paused Tasks')).toBeInTheDocument();
    expect(queryByTestId('paused-tasks-table')).not.toBeInTheDocument();
  });

  it('should render Paused Tasks table, if initialIsVisible is true', () => {
    const { queryByTitle, queryByTestId, queryAllByTestId } = renderComponent({
      pausedNodes,
      initialIsVisible: true,
    });
    expect(queryByTitle('Paused Tasks')).toBeInTheDocument();
    expect(queryByTestId('paused-tasks-table')).toBeInTheDocument();
    expect(queryAllByTestId('task-name-item').length).toEqual(pausedNodes.length);
  });

  it('should render Paused Tasks table on button click, and hide it, when clicked again', async () => {
    const { getByRole, queryByTitle, queryByTestId } = renderComponent({
      pausedNodes,
    });
    expect(queryByTitle('Paused Tasks')).toBeInTheDocument();
    expect(queryByTestId('paused-tasks-table')).not.toBeInTheDocument();

    const button = getByRole('button');
    await fireEvent.click(button);

    expect(queryByTestId('paused-tasks-table')).toBeInTheDocument();

    await fireEvent.click(button);

    expect(queryByTestId('paused-tasks-table')).not.toBeInTheDocument();
  });

  it('should render LaunchFormDialog on resume button click', async () => {
    const { getByRole, queryByTitle, queryByTestId, getByTestId } = renderComponent({
      pausedNodes,
    });
    expect(queryByTitle('Paused Tasks')).toBeInTheDocument();
    expect(queryByTestId('paused-tasks-table')).not.toBeInTheDocument();

    const button = getByRole('button');
    await fireEvent.click(button);

    expect(queryByTestId('paused-tasks-table')).toBeInTheDocument();
    expect(queryByTestId(`resume-gate-node-${pausedNodes[0].id}`)).toBeInTheDocument();

    const resumeButton = getByTestId(`resume-gate-node-${pausedNodes[0].id}`);
    await fireEvent.click(resumeButton);

    expect(queryByTestId('launch-form-dialog')).toBeInTheDocument();
  });
});
