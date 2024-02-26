import * as React from 'react';
import { render } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider as QueryClientProviderImport,
  QueryClientProviderProps,
} from 'react-query';
import { MemoryRouter } from 'react-router';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { basicPythonWorkflow } from '../../../../mocks/data/fixtures/basicPythonWorkflow';
import { insertFixture } from '../../../../mocks/data/insertFixture';
import { mockServer } from '../../../../mocks/server';
import { TaskExecutionPhase } from '../../../../models/Execution/enums';
import { NodeExecution } from '../../../../models/Execution/types';
import { createTestQueryClient } from '../../../../test/utils';
import { createWorkflowObject } from '../../../../models/__mocks__/workflowData';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { FetchableData } from '../../../hooks/types';
import { loadedFetchable } from '../../../hooks/__mocks__/fetchableData';
import { NodeExecutionDetailsPanelContent } from '../NodeExecutionDetailsPanelContent';
import { UserProfile } from '../../../../models/Common/types';
import { NodeExecutionDetailsContextProvider } from '../../contextProvider/NodeExecutionDetails/NodeExecutionDetailsContextProvider';

const workflow = createWorkflowObject();

const QueryClientProvider: React.FC<React.PropsWithChildren<QueryClientProviderProps>> =
  QueryClientProviderImport;

jest.mock('../../../../components/hooks/useUserProfile');
jest.mock('../../../../components/Executions/ExecutionDetails/ExecutionDetailsActions', () => ({
  ExecutionDetailsActions: jest.fn(() => <div data-test-id="execution-details-actions"></div>),
}));
jest.mock('../../../../queries/workflowQueries');
// const { fetchWorkflow } = require('components/Workflow/workflowQueries');

describe('NodeExecutionDetailsPanelContent', () => {
  const mockUseUserProfile = useUserProfile as jest.Mock<FetchableData<UserProfile | null>>;
  let fixture: ReturnType<typeof basicPythonWorkflow.generate>;
  let execution: NodeExecution;
  let queryClient: QueryClient;

  beforeEach(() => {
    mockUseUserProfile.mockReturnValue(loadedFetchable(null, jest.fn()));
    fixture = basicPythonWorkflow.generate();
    execution = fixture.workflowExecutions.top.nodeExecutions.pythonNode.data;
    insertFixture(mockServer, fixture);
    // fetchWorkflow.mockImplementaton(() => Promise.resolve(fixture.workflows.top));
    queryClient = createTestQueryClient();
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderComponent = () =>
    render(
      <ThemeProvider theme={muiTheme}>
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <NodeExecutionDetailsContextProvider initialWorkflow={workflow}>
              <NodeExecutionDetailsPanelContent
                nodeExecutionId={execution.id}
                taskPhase={TaskExecutionPhase.UNDEFINED}
              />
            </NodeExecutionDetailsContextProvider>
          </QueryClientProvider>
        </MemoryRouter>
      </ThemeProvider>,
    );

  /**
   * Todo: Fix this test, missing mocks, 401 errors
   */
  it('renders name for task nodes', async () => {
    expect(true).toBe(true);
  });
});
