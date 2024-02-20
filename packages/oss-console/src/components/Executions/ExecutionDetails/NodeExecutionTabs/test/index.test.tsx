import { render } from '@testing-library/react';
import * as React from 'react';
import { MemoryRouter } from 'react-router';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { createTestQueryClient } from '@clients/oss-console/test/utils';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useTabState } from '../../../../hooks/useTabState';
import { extractTaskTemplates } from '../../../../hooks/utils';
import { TaskExecutionPhase } from '../../../../../models/Execution/enums';
import { createMockNodeExecutions } from '../../../../../models/Execution/__mocks__/mockNodeExecutionsData';
import { TaskType } from '../../../../../models/Task/constants';
import { createMockWorkflow } from '../../../../../models/__mocks__/workflowData';
import { mockExecution as mockTaskExecution } from '../../../../../models/Execution/__mocks__/mockTaskExecutionsData';
import { NodeExecutionTabs, NodeExecutionTabsProps } from '../index';

const getMockNodeExecution = () => createMockNodeExecutions(1).executions[0];
const nodeExecution = getMockNodeExecution();
const workflow = createMockWorkflow('SampleWorkflow');
const taskTemplate = {
  ...extractTaskTemplates(workflow)[0],
  type: TaskType.ARRAY,
};
const phase = TaskExecutionPhase.SUCCEEDED;

jest.mock('../../../../../components/hooks/useTabState');
jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  prism: {},
}));

describe('NodeExecutionTabs', () => {
  let queryClient: QueryClient;
  beforeEach(() => {
    queryClient = createTestQueryClient();
  });
  const mockUseTabState = useTabState as jest.Mock<any>;
  mockUseTabState.mockReturnValue({ onChange: jest.fn(), value: 'executions' });

  const renderView = ({
    nodeExecution,
    phase,
    taskTemplate,
    onTaskSelected,
    selectedTaskExecution,
  }: NodeExecutionTabsProps) => {
    return render(
      <ThemeProvider theme={muiTheme}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <NodeExecutionTabs
              nodeExecution={nodeExecution}
              selectedTaskExecution={selectedTaskExecution}
              phase={phase}
              taskTemplate={taskTemplate}
              onTaskSelected={onTaskSelected}
            />
          </MemoryRouter>
        </QueryClientProvider>
      </ThemeProvider>,
    );
  };
  describe('with map tasks', () => {
    it('should display proper tab name when it was provided and shouldShow is TRUE', () => {
      const { queryByText, queryAllByRole } = renderView({
        nodeExecution,
        selectedTaskExecution: { ...mockTaskExecution, taskIndex: 0 },
        phase,
        taskTemplate,
        onTaskSelected: jest.fn(),
      });

      expect(queryAllByRole('tab')).toHaveLength(4);
      expect(queryByText('Executions')).toBeInTheDocument();
    });

    it('should display proper tab name when it was provided and shouldShow is FALSE', () => {
      const { queryByText, queryAllByRole } = renderView({
        nodeExecution,
        selectedTaskExecution: undefined,
        phase,
        taskTemplate,
        onTaskSelected: jest.fn(),
      });

      expect(queryAllByRole('tab')).toHaveLength(4);
      expect(queryByText('Map Execution')).toBeInTheDocument();
    });
  });

  describe('without map tasks', () => {
    it('should display proper tab name when mapTask was not provided', () => {
      const { queryAllByRole, queryByText } = renderView({
        nodeExecution,
        selectedTaskExecution: undefined,
        onTaskSelected: jest.fn(),
      });

      expect(queryAllByRole('tab')).toHaveLength(3);
      expect(queryByText('Executions')).toBeInTheDocument();
    });
  });
});
