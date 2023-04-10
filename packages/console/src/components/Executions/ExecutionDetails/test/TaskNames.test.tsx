import * as React from 'react';
import { render } from '@testing-library/react';
import { dTypes } from 'models/Graph/types';
import { NodeExecutionDetailsContextProvider } from 'components/Executions/contextProvider/NodeExecutionDetails';
import { QueryClient, QueryClientProvider } from 'react-query';
import { WorkflowNodeExecutionsContext } from 'components/Executions/contexts';
import { mockWorkflowId } from 'mocks/data/fixtures/types';
import { createTestQueryClient } from 'test/utils';
import { dateToTimestamp } from 'common/utils';
import { createMockWorkflow } from 'models/__mocks__/workflowData';
import { TaskNames } from '../Timeline/TaskNames';

const onToggle = jest.fn();
const onAction = jest.fn();

jest.mock('models/Workflow/api', () => {
  const originalModule = jest.requireActual('models/Workflow/api');
  return {
    __esModule: true,
    ...originalModule,
    getWorkflow: jest.fn().mockResolvedValue({}),
  };
});

const node1 = {
  id: 'n1',
  scopedId: 'n1',
  type: dTypes.staticNode,
  name: 'node1',
  nodes: [],
  edges: [],
};

const node2 = {
  id: 'n2',
  scopedId: 'n2',
  type: dTypes.gateNode,
  name: 'node2',
  nodes: [],
  edges: [],
};

describe('ExecutionDetails > Timeline > TaskNames', () => {
  let queryClient: QueryClient;
  beforeEach(() => {
    queryClient = createTestQueryClient();
  });

  const renderComponent = props => {
    const nodeExecutionsById = props.nodes.reduce(
      (accumulator, currentValue) => {
        accumulator[currentValue.id] = {
          closure: {
            createdAt: dateToTimestamp(new Date()),
            outputUri: '',
            phase: 1,
          },
          metadata: currentValue.metadata,
          id: {
            executionId: {
              domain: 'development',
              name: 'MyWorkflow',
              project: 'flytetest',
            },
            nodeId: currentValue.id,
          },
          inputUri: '',
          scopedId: currentValue.scopedId,
        };
        return accumulator;
      },
      {},
    );
    return render(
      <QueryClientProvider client={queryClient}>
        <NodeExecutionDetailsContextProvider workflowId={mockWorkflowId}>
          <WorkflowNodeExecutionsContext.Provider
            value={{
              nodeExecutionsById,
              setCurrentNodeExecutionsById: () => {},
            }}
          >
            <TaskNames {...props} />
          </WorkflowNodeExecutionsContext.Provider>
        </NodeExecutionDetailsContextProvider>
      </QueryClientProvider>,
    );
  };

  it('should render task names list', () => {
    const nodes = [node1, node2];
    const { getAllByTestId } = renderComponent({ nodes, onToggle });
    expect(getAllByTestId('task-name-item').length).toEqual(nodes.length);
  });

  it('should render task names list with resume buttons if onAction prop is passed', () => {
    const nodes = [node1, node2];
    const { getAllByTestId, getAllByTitle } = renderComponent({
      nodes,
      onToggle,
      onAction,
    });
    expect(getAllByTestId('task-name-item').length).toEqual(nodes.length);
    expect(getAllByTitle('Resume').length).toEqual(nodes.length);
  });

  it('should render task names list with expanders if nodes contain nested nodes list', () => {
    const nestedNodes = [
      {
        id: 't1',
        scopedId: 'n1',
        type: dTypes.task,
        name: 'task1',
        nodes: [],
        edges: [],
      },
    ];
    const nodes = [
      { ...node1, metadata: { isParentNode: true }, nodes: nestedNodes },
      { ...node2, metadata: { isParentNode: true }, nodes: nestedNodes },
    ];
    const { getAllByTestId, getAllByTitle } = renderComponent({
      nodes,
      onToggle,
    });
    expect(getAllByTestId('task-name-item').length).toEqual(nodes.length);
    expect(getAllByTitle('Expand row').length).toEqual(nodes.length);
  });
});
