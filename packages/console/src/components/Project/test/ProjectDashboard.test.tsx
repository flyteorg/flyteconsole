import { render, waitFor, fireEvent } from '@testing-library/react';
import { basicPythonWorkflow } from 'mocks/data/fixtures/basicPythonWorkflow';
import { oneFailedTaskWorkflow } from 'mocks/data/fixtures/oneFailedTaskWorkflow';
import { insertFixture } from 'mocks/data/insertFixture';
import { unexpectedError } from 'mocks/errors';
import { mockServer } from 'mocks/server';
import { sortQueryKeys } from 'models/AdminEntity/constants';
import { SortDirection } from 'models/AdminEntity/types';
import { DomainIdentifierScope, UserProfile } from 'models/Common/types';
import { executionSortFields } from 'models/Execution/constants';
import { Execution } from 'models/Execution/types';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router';
import {
  createTestQueryClient,
  disableQueryLogger,
  enableQueryLogger,
} from 'test/utils';
import { useUserProfile } from 'components/hooks/useUserProfile';
import { FetchableData } from 'components/hooks/types';
import { loadedFetchable } from 'components/hooks/__mocks__/fetchableData';
import {
  getProjectAttributes,
  getProjectDomainAttributes,
} from 'models/Project/api';
import { Admin } from '@flyteorg/flyteidl-types';
import * as LocalCache from 'basics/LocalCache';
import { LocalCacheProvider } from 'basics/LocalCache/ContextProvider';
import { ProjectDashboard } from '../ProjectDashboard';
import { failedToLoadExecutionsString } from '../constants';

jest.mock('components/hooks/useUserProfile');
jest.mock('components/Executions/Tables/WorkflowExecutionsTable');
jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}));

jest.mock('models/Project/api', () => ({
  getProjectAttributes: jest.fn().mockResolvedValue(() => {
    const projectAttributesMock: Admin.ProjectAttributesGetResponse = {
      attributes: {
        matchingAttributes: {
          workflowExecutionConfig: {
            maxParallelism: 1,
            securityContext: { runAs: { k8sServiceAccount: 'default' } },
            rawOutputDataConfig: {
              outputLocationPrefix:
                'cliOutputLocationPrefixFromProjectAttributes',
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
    const projectDomainAttributesMock: Admin.ProjectDomainAttributesDeleteResponse =
      {
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
  const mockUseUserProfile = useUserProfile as jest.Mock<
    FetchableData<UserProfile | null>
  >;

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
    queryClient = createTestQueryClient();
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
    mockServer.insertWorkflowExecutionList(
      scope,
      executions1,
      defaultQueryParams1,
    );
    mockServer.insertWorkflowExecutionList(
      scope,
      executions2,
      defaultQueryParams2,
    );
  });

  const renderView = () =>
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <LocalCacheProvider>
            <ProjectDashboard
              projectId={scope.project}
              domainId={scope.domain}
            />
          </LocalCacheProvider>
        </QueryClientProvider>
      </MemoryRouter>,
    );

  it('should display domain attributes section when config was provided', async () => {
    const { getByText } = renderView();
    expect(getProjectDomainAttributes).toHaveBeenCalled();
    await waitFor(() => {
      expect(getProjectAttributes).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(getByText('Domain Settings')).toBeInTheDocument();
    });

    expect(
      getByText('cliOutputLocationPrefixFromProjectAttributes'),
    ).toBeInTheDocument();
    expect(getByText('cliAnnotationKey')).toBeInTheDocument();
  });

  it('should show loading spinner', async () => {
    mockUseUserProfile.mockReturnValue(
      loadedFetchable(sampleUserProfile, jest.fn()),
    );
    const { queryByTestId } = renderView();
    await waitFor(() => {});
    expect(queryByTestId(/loading-spinner/i)).toBeDefined();
  });

  it('should display WorkflowExecutionsTable and BarChart ', async () => {
    mockUseUserProfile.mockReturnValue(
      loadedFetchable(sampleUserProfile, jest.fn()),
    );
    const { queryByTestId } = renderView();
    await waitFor(() => {});
    expect(queryByTestId('workflow-table')).toBeDefined();
  });

  it('should not display checkbox if user does not login', async () => {
    const { queryByTestId } = renderView();
    await waitFor(() => {});
    expect(mockUseUserProfile).toHaveBeenCalled();
    expect(queryByTestId(/checkbox/i)).toBeNull();
  });

  it('should display checkboxes if user login', async () => {
    mockUseUserProfile.mockReturnValue(
      loadedFetchable(sampleUserProfile, jest.fn()),
    );
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
    mockUseUserProfile.mockReturnValue(
      loadedFetchable(sampleUserProfile, jest.fn()),
    );
    const { getAllByText, queryAllByText, getAllByRole } = renderView();
    await waitFor(() => {});
    expect(mockUseUserProfile).toHaveBeenCalled();

    // There are 2 checkboxes on a page: 1 - onlyMyExecutions, 2 - show archived, both unchecked by default
    const checkboxes = getAllByRole(/checkbox/i) as HTMLInputElement[];
    expect(checkboxes[0]).toBeTruthy();
    expect(checkboxes[0]?.checked).toEqual(false);
    await waitFor(() =>
      expect(getAllByText(executions1[0].closure.workflowId.name)),
    );
    await fireEvent.click(checkboxes[0]);

    // when user selects checkbox, table should have no executions to display
    await waitFor(() =>
      expect(
        queryAllByText(executions1[0].closure.workflowId.name),
      ).toHaveLength(0),
    );
  });

  describe('when initial load fails', () => {
    const errorMessage = 'Something went wrong.';
    // Disable react-query logger output to avoid a console.error
    // when the request fails.
    beforeEach(() => {
      disableQueryLogger();
      mockServer.insertWorkflowExecutionList(
        scope,
        unexpectedError(errorMessage),
        defaultQueryParams1,
      );
    });
    afterEach(() => {
      enableQueryLogger();
    });

    it('shows error message', async () => {
      const { getByText } = renderView();
      await waitFor(() => expect(getByText(failedToLoadExecutionsString)));
    });
  });
});
