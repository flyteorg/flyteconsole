import { render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router';
import Admin from '@clients/common/flyteidl/admin';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { SortDirection } from '@clients/common/types/adminEntityTypes';
import { basicPythonWorkflow } from '../../../mocks/data/fixtures/basicPythonWorkflow';
import { oneFailedTaskWorkflow } from '../../../mocks/data/fixtures/oneFailedTaskWorkflow';
import { insertFixture } from '../../../mocks/data/insertFixture';
import { mockServer } from '../../../mocks/server';
import { sortQueryKeys } from '../../../models/AdminEntity/constants';
import { DomainIdentifierScope, UserProfile } from '../../../models/Common/types';
import { executionSortFields } from '../../../models/Execution/constants';
import { Execution } from '../../../models/Execution/types';
import { createTestQueryClient } from '../../../test/utils';
import { useUserProfile } from '../../hooks/useUserProfile';
import { FetchableData } from '../../hooks/types';
import { loadedFetchable } from '../../hooks/__mocks__/fetchableData';
import { getProjectAttributes, getProjectDomainAttributes } from '../../../models/Project/api';
import * as LocalCache from '../../../basics/LocalCache';
import { LocalCacheProvider } from '../../../basics/LocalCache/ContextProvider';
import { ListProjectExecutions } from '../ListProjectExecutions';

declare module 'react-query/types/react/QueryClientProvider' {
  interface QueryClientProviderProps {
    children?: React.ReactNode;
  }
}

jest.mock('../../../queries/workflowQueries');
jest.mock('../../../components/hooks/useUserProfile');
// jest.mock('../../../components/Executions/Tables/WorkflowExecutionsTable');

jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}));

jest.mock('../../../models/Project/api', () => ({
  getProjectAttributes: jest.fn().mockResolvedValue(() => {
    const projectAttributesMock: Admin.ProjectAttributesGetResponse = {
      attributes: {
        matchingAttributes: {
          workflowExecutionConfig: {
            maxParallelism: 1,
            securityContext: { runAs: { k8sServiceAccount: 'default' } },
            rawOutputDataConfig: {
              outputLocationPrefix: 'cliOutputLocationPrefixFromProjectAttributes',
            },
            annotations: {
              values: {
                cliAnnotationKey: 'cliAnnotationValueFromProjectAttributes',
              },
            },
            labels: {
              values: { cliLabelKey: 'cliLabelValueFromProjectAttributes' },
            },
          },
        },
      },
    };
    return projectAttributesMock;
  }),
  getProjectDomainAttributes: jest.fn().mockResolvedValue(() => {
    const projectDomainAttributesMock: Admin.ProjectDomainAttributesDeleteResponse = {
      attributes: {
        matchingAttributes: {
          workflowExecutionConfig: {
            maxParallelism: 5,
            securityContext: { runAs: { k8sServiceAccount: 'default' } },
            annotations: {
              values: { cliAnnotationKey: 'cliAnnotationValue' },
            },
            labels: { values: { cliLabelKey: 'cliLabelValue' } },
          },
        },
      },
    };
    return projectDomainAttributesMock;
  }),
}));

describe('ProjectDashboard', () => {
  const mockUseUserProfile = useUserProfile as jest.Mock<FetchableData<UserProfile | null>>;

  let basicPythonFixture: ReturnType<typeof basicPythonWorkflow.generate>;
  let failedTaskFixture: ReturnType<typeof oneFailedTaskWorkflow.generate>;
  let executions1: Execution[];
  let executions2: Execution[];
  let scope: DomainIdentifierScope;
  let queryClient: QueryClient;

  const sampleUserProfile: UserProfile = {
    subject: 'subject',
  } as UserProfile;

  const defaultQueryParams1 = {
    [sortQueryKeys.direction]: SortDirection[SortDirection.DESCENDING],
    [sortQueryKeys.key]: executionSortFields.createdAt,
  };

  const defaultQueryParams2 = {
    filters: 'eq(user,subject)',
    [sortQueryKeys.direction]: SortDirection[SortDirection.DESCENDING],
    [sortQueryKeys.key]: executionSortFields.createdAt,
  };

  jest.spyOn(LocalCache, 'useLocalCache');

  beforeEach(() => {
    mockUseUserProfile.mockReturnValue(loadedFetchable(null, jest.fn()));
    basicPythonFixture = basicPythonWorkflow.generate();
    failedTaskFixture = oneFailedTaskWorkflow.generate();
    insertFixture(mockServer, basicPythonFixture);
    insertFixture(mockServer, failedTaskFixture);

    executions1 = [
      basicPythonFixture.workflowExecutions.top.data,
      failedTaskFixture.workflowExecutions.top.data,
    ];
    executions2 = [];
    const { domain, project } = executions1[0].id;
    scope = { domain, project };
    mockServer.insertWorkflowExecutionList(scope, executions1, defaultQueryParams1);
    mockServer.insertWorkflowExecutionList(scope, executions2, defaultQueryParams2);
  });

  const renderView = () => {
    queryClient = createTestQueryClient();
    return render(
      <ThemeProvider theme={muiTheme}>
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <LocalCacheProvider>
              <ListProjectExecutions projectId={scope.project} domainId={scope.domain} />
            </LocalCacheProvider>
          </QueryClientProvider>
        </MemoryRouter>
      </ThemeProvider>,
    );
  };

  it('should display domain attributes section when config was provided', async () => {
    mockUseUserProfile.mockReturnValue(loadedFetchable(sampleUserProfile, jest.fn()));
    const { getByText } = renderView();
    expect(getProjectDomainAttributes).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(getProjectAttributes).not.toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(getByText('Domain Settings')).toBeInTheDocument();
    });
  });

  it('should not show loading spinner', async () => {
    mockUseUserProfile.mockReturnValue(loadedFetchable(sampleUserProfile, jest.fn()));
    const { queryByTestId } = renderView();
    await waitFor(() => expect(queryByTestId(/loading-spinner/i)).toBeFalsy());
  });

  it('should display WorkflowExecutionsTable and BarChart ', async () => {
    mockUseUserProfile.mockReturnValue(loadedFetchable(sampleUserProfile, jest.fn()));
    const { queryByTestId } = renderView();
    await waitFor(() => {});
    expect(queryByTestId('workflow-table')).toBeDefined();
  });

  it('should display checkboxes if user login', async () => {
    mockUseUserProfile.mockReturnValue(loadedFetchable(sampleUserProfile, jest.fn()));
    const { getAllByRole } = renderView();

    await waitFor(() => {});
    expect(mockUseUserProfile).toHaveBeenCalled();

    // There are 2 checkboxes on a page: 1 - onlyMyExecutions, 2 - show archived, both unchecked by default
    const checkboxes = getAllByRole(/checkbox/i) as HTMLInputElement[];
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toBeTruthy();
    expect(checkboxes[1]).toBeTruthy();
  });

  /** user doesn't have its own workflow */
  it('should not display workflow if the user does not have one when filtered onlyMyExecutions', async () => {
    mockUseUserProfile.mockReturnValue(loadedFetchable(sampleUserProfile, jest.fn()));
    const { getAllByRole } = renderView();
    await waitFor(() => {});
    expect(mockUseUserProfile).toHaveBeenCalled();

    // There are 2 checkboxes on a page: 1 - onlyMyExecutions, 2 - show archived, both unchecked by default
    const checkboxes = getAllByRole(/checkbox/i) as HTMLInputElement[];
    expect(checkboxes[0]).toBeTruthy();
    expect(checkboxes[0]?.checked).toEqual(false);
  });
});
