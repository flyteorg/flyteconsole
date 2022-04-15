import { fireEvent, render, waitFor } from '@testing-library/react';
import { APIContext } from 'components/data/apiContext';
import { mockAPIContextValue } from 'components/data/__mocks__/apiContext';
import { Admin } from 'flyteidl';
import { FilterOperationName } from 'models/AdminEntity/types';
import { getUserProfile, listNamedEntities } from 'models/Common/api';
import { NamedEntity, UserProfile } from 'models/Common/types';
import { updateTaskState } from 'models/Task/api';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router';
import { createTask } from 'test/modelUtils';
import { createTestQueryClient } from 'test/utils';
import { ProjectTasks } from '../ProjectTasks';

const sampleUserProfile: UserProfile = {
  subject: 'subject',
} as UserProfile;

jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}));

jest.mock('models/Task/api', () => ({
  updateTaskState: jest.fn().mockResolvedValue({}),
}));

describe('ProjectTasks', () => {
  const project = 'TestProject';
  const domain = 'TestDomain';
  let tasks: NamedEntity[];
  let queryClient: QueryClient;
  let mockListNamedEntities: jest.Mock<ReturnType<typeof listNamedEntities>>;
  let mockGetUserProfile: jest.Mock<ReturnType<typeof getUserProfile>>;

  beforeEach(() => {
    mockGetUserProfile = jest.fn().mockResolvedValue(null);
    queryClient = createTestQueryClient();
    tasks = ['MyTask', 'MyOtherTask'].map((name) => createTask({ domain, name, project }));
    mockListNamedEntities = jest.fn().mockResolvedValue({ entities: tasks });

    window.IntersectionObserver = jest.fn().mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <APIContext.Provider
          value={mockAPIContextValue({
            listNamedEntities: mockListNamedEntities,
            getUserProfile: mockGetUserProfile,
          })}
        >
          <ProjectTasks projectId={project} domainId={domain} />
        </APIContext.Provider>
      </QueryClientProvider>,
      { wrapper: MemoryRouter },
    );

  it('does not show archived tasks', async () => {
    const { getByText } = renderComponent();
    await waitFor(() => {});

    expect(mockListNamedEntities).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        filter: [
          {
            key: 'state',
            operation: FilterOperationName.EQ,
            value: Admin.NamedEntityState.NAMED_ENTITY_ACTIVE,
          },
        ],
      }),
    );
    await waitFor(() => expect(getByText('MyTask')));
  });

  it('should display checkbox if user login', async () => {
    mockGetUserProfile.mockResolvedValue(sampleUserProfile);
    const { getAllByRole } = renderComponent();
    await waitFor(() => {});
    const checkboxes = getAllByRole(/checkbox/i) as HTMLInputElement[];
    expect(checkboxes).toHaveLength(1);
    expect(checkboxes[0]).toBeTruthy();
    expect(checkboxes[0]?.checked).toEqual(false);
  });

  it('should display archive button', async () => {
    mockGetUserProfile.mockResolvedValue(sampleUserProfile);
    const { getByText, getAllByTitle, findAllByText } = renderComponent();
    await waitFor(() => {});

    const task = getByText('MyTask');
    expect(task).toBeTruthy();

    const parent = task?.parentElement?.parentElement?.parentElement!;
    fireEvent.mouseOver(parent);

    const archiveButton = getAllByTitle('Archive');
    expect(archiveButton[0]).toBeTruthy();

    fireEvent.click(archiveButton[0]);

    const cancelButton = await findAllByText('Cancel');
    await waitFor(() => expect(cancelButton.length).toEqual(1));
    const confirmArchiveButton = cancelButton?.[0]?.parentElement?.parentElement?.children[0]!;

    expect(confirmArchiveButton).toBeTruthy();

    fireEvent.click(confirmArchiveButton!);

    await waitFor(() => {
      expect(updateTaskState).toHaveBeenCalledTimes(1);
    });
  });

  it('clicking show archived should hide active tasks', async () => {
    mockGetUserProfile.mockResolvedValue(sampleUserProfile);
    const { getByText, queryByText, getAllByRole } = renderComponent();
    await waitFor(() => {});

    // check the checkbox is present
    const checkboxes = getAllByRole(/checkbox/i) as HTMLInputElement[];
    expect(checkboxes[0]).toBeTruthy();
    expect(checkboxes[0]?.checked).toEqual(false);

    // check that my task is in document
    await waitFor(() => expect(getByText('MyTask')));
    fireEvent.click(checkboxes[0]);

    // when user selects checkbox, table should have no tasks to display
    await waitFor(() => expect(queryByText('MyTask')).not.toBeInTheDocument());
  });
});
