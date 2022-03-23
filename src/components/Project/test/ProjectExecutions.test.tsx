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
import { createTestQueryClient, disableQueryLogger, enableQueryLogger } from 'test/utils';

import { APIContext } from 'components/data/apiContext';
import { mockAPIContextValue } from 'components/data/__mocks__/apiContext';
import { getUserProfile } from 'models/Common/api';
import { ProjectExecutions } from '../ProjectExecutions';
import { failedToLoadExecutionsString } from '../constants';

jest.mock('components/Executions/Tables/WorkflowExecutionsTable');
jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}));

describe('ProjectExecutions', () => {
  let basicPythonFixture: ReturnType<typeof basicPythonWorkflow.generate>;
  let failedTaskFixture: ReturnType<typeof oneFailedTaskWorkflow.generate>;
  let executions1: Execution[];
  let executions2: Execution[];
  let scope: DomainIdentifierScope;
  let queryClient: QueryClient;
  let mockGetUserProfile: jest.Mock<ReturnType<typeof getUserProfile>>;

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

  beforeEach(() => {
    mockGetUserProfile = jest.fn().mockResolvedValue(null);
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
    mockServer.insertWorkflowExecutionList(scope, executions1, defaultQueryParams1);
    mockServer.insertWorkflowExecutionList(scope, executions2, defaultQueryParams2);
  });

  const renderView = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <APIContext.Provider
          value={mockAPIContextValue({
            getUserProfile: mockGetUserProfile,
          })}
        >
          <ProjectExecutions projectId={scope.project} domainId={scope.domain} />
        </APIContext.Provider>
      </QueryClientProvider>,
      { wrapper: MemoryRouter },
    );

  it('should not display checkbox if user does not login', async () => {
    const { queryByTestId } = renderView();
    await waitFor(() => {});
    expect(mockGetUserProfile).toHaveBeenCalled();
    expect(queryByTestId(/checkbox/i)).toBeNull();
  });

  it('should display checkbox if user login', async () => {
    mockGetUserProfile.mockResolvedValue(sampleUserProfile);
    const { queryByTestId } = renderView();
    await waitFor(() => {});
    expect(mockGetUserProfile).toHaveBeenCalled();
    const checkbox = queryByTestId(/checkbox/i) as HTMLInputElement;
    expect(checkbox).toBeTruthy();
  });

  /** user doesn't have its own workflow */
  it('should not display workflow if user does not have workflow', async () => {
    mockGetUserProfile.mockResolvedValue(sampleUserProfile);
    const { getByText, queryByText, queryByTestId } = renderView();
    await waitFor(() => {});
    expect(mockGetUserProfile).toHaveBeenCalled();
    const checkbox = queryByTestId(/checkbox/i)?.querySelector('input') as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox?.checked).toEqual(true);
    await waitFor(() => expect(queryByText(executions1[0].closure.workflowId.name)).toBeNull());
    fireEvent.click(checkbox);
    // in case that user uncheck checkbox, table should display all executions
    await waitFor(() => expect(getByText(executions1[0].closure.workflowId.name)));
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
