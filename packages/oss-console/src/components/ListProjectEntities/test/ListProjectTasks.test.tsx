import { waitFor } from '@testing-library/react';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router';
import { FilterOperationName } from '@clients/common/types/adminEntityTypes';
import { APIContext } from '../../data/apiContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { mockAPIContextValue } from '../../data/__mocks__/apiContext';
import { FetchableData } from '../../hooks/types';
import { loadedFetchable } from '../../hooks/__mocks__/fetchableData';
import {
  NamedEntity,
  NamedEntityIdentifier,
  NamedEntityMetadata,
  ResourceType,
  UserProfile,
} from '../../../models/Common/types';
import { NamedEntityState } from '../../../models/enums';
import { createNamedEntity } from '../../../test/modelUtils';
import { createTestQueryClient } from '../../../test/utils';
import { renderTest } from '../../../test/renderUtils';
import { ListProjectTasks } from '../ListProjectTasks';

declare module 'react-query/types/react/QueryClientProvider' {
  interface QueryClientProviderProps {
    children?: React.ReactNode;
  }
}

export function createTask(id: NamedEntityIdentifier, metadata?: Partial<NamedEntityMetadata>) {
  return createNamedEntity(ResourceType.TASK, id, metadata);
}

jest.mock('../../../models/Common/api', () => {
  const originalModule = jest.requireActual('../../../models/Common/api');
  return {
    __esModule: true,
    ...originalModule,
    listNamedEntities: jest.fn().mockResolvedValue({}),
  };
});

const { listNamedEntities } = require('../../../models/Common/api');

jest.mock('../../../components/hooks/useUserProfile');
jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}));

jest.mock('../../../models/Task/api', () => ({
  updateTaskState: jest.fn().mockResolvedValue({}),
}));

jest.mock('@tanstack/react-virtual', () => {
  return {
    __esModule: true,
    useVirtualizer: ({ count }) => ({
      getTotalSize: () => 1000,
      getVirtualItems: () => {
        return Array.from({ length: count }).map((_, index) => ({
          index,
          measureElement: jest.fn(),
        }));
      },
    }),
  };
});

/*
 * TODO: Need to fix few tests in ProjectTasks.test.tsx.
 */

describe('ProjectTasks', () => {
  const project = 'TestProject';
  const domain = 'TestDomain';
  let tasks: NamedEntity[];
  let queryClient: QueryClient;
  const mockUseUserProfile = useUserProfile as jest.Mock<FetchableData<UserProfile | null>>;

  beforeEach(() => {
    mockUseUserProfile.mockReturnValue(loadedFetchable(null, jest.fn()));
    queryClient = createTestQueryClient();
    tasks = ['MyTask', 'MyOtherTask'].map((name) => createTask({ domain, name, project }));
    listNamedEntities.mockResolvedValue({ entities: tasks });

    window.IntersectionObserver = jest.fn().mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
  });

  const renderComponent = () =>
    renderTest(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <APIContext.Provider
            value={mockAPIContextValue({
              listNamedEntities,
            })}
          >
            <ListProjectTasks projectId={project} domainId={domain} />
          </APIContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );

  it('does not show archived tasks', async () => {
    const { getByText } = renderComponent();
    await waitFor(() => {
      expect(listNamedEntities).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          filter: [
            {
              key: 'state',
              operation: FilterOperationName.EQ,
              value: NamedEntityState.NAMED_ENTITY_ACTIVE,
            },
          ],
        }),
      );
    });

    await waitFor(() => expect(getByText('MyTask')));
  });
});
