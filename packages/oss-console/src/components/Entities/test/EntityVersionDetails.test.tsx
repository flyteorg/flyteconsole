import { render, waitFor } from '@testing-library/react';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import * as React from 'react';
import * as ReactQuery from 'react-query';
import { ResourceIdentifier } from '../../../models/Common/types';
import { createMockTask } from '../../../models/__mocks__/taskData';
import { Task } from '../../../models/Task/types';
import { getTask } from '../../../models/Task/api';
import { APIContext } from '../../data/apiContext';
import { mockAPIContextValue } from '../../data/__mocks__/apiContext';
import { EntityVersionDetails } from '../VersionDetails/EntityVersionDetails';

// eslint-disable-next-line prefer-destructuring
const QueryClientProvider: React.FC<React.PropsWithChildren<ReactQuery.QueryClientProviderProps>> =
  ReactQuery.QueryClientProvider;
const queryClient = new ReactQuery.QueryClient();

jest.mock('../../../queries/taskQueries', () => ({
  makeTaskTemplateQuery: async () => {
    return createMockTask('MyTask').closure.compiledTask.template;
  },
}));

jest.mock('../../../components/common/WaitForQuery', () => ({
  WaitForQuery: jest.fn(({ query, children }) => (
    <div>
      <>{children(query.data)}</>
    </div>
  )),
}));

// @ts-ignore
jest.spyOn(ReactQuery, 'useQuery').mockImplementation(() => ({
  data: createMockTask('MyTask').closure.compiledTask.template,
  isLoading: false,
  error: {},
}));

describe('EntityVersionDetails', () => {
  let mockTask: Task;
  let mockGetTask: jest.Mock<ReturnType<typeof getTask>>;

  const createMocks = () => {
    mockTask = createMockTask('MyTask');
    mockGetTask = jest.fn().mockImplementation(() => Promise.resolve(mockTask));
  };

  const renderDetails = (id: ResourceIdentifier) => {
    return render(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={muiTheme}>
          <QueryClientProvider client={queryClient}>
            <APIContext.Provider
              value={mockAPIContextValue({
                getTask: mockGetTask,
              })}
            >
              <EntityVersionDetails id={id} />
            </APIContext.Provider>
          </QueryClientProvider>
        </ThemeProvider>
      </StyledEngineProvider>,
    );
  };

  describe('Task Version Details', () => {
    beforeEach(() => {
      createMocks();
    });

    it('renders and checks text', async () => {
      const id: ResourceIdentifier = mockTask.id as ResourceIdentifier;
      const { getByText } = renderDetails(id);

      // check text for Task Details
      await waitFor(() => {
        expect(getByText('Task Details')).toBeInTheDocument();
      });

      // check text for image
      await waitFor(() => {
        expect(
          getByText(mockTask.closure.compiledTask.template?.container?.image || ''),
        ).toBeInTheDocument();
      });

      // check for env vars
      if (mockTask.closure.compiledTask.template?.container?.env) {
        const envVars = mockTask.closure.compiledTask.template?.container?.env;
        for (let i = 0; i < envVars.length; i++) {
          waitFor(() => {
            expect(getByText(envVars[i].key || '')).toBeInTheDocument();
            expect(getByText(envVars[i].value || '')).toBeInTheDocument();
          });
        }
      }
    });
  });
});
