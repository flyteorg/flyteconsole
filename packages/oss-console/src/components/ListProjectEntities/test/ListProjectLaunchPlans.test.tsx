import React, { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { BrowserRouter } from 'react-router-dom';
import { fetchStates } from '../../hooks/types';
import {
  NamedEntityIdentifier,
  NamedEntityMetadata,
  ResourceType,
} from '../../../models/Common/types';
import { ListProjectLaunchPlans } from '../ListProjectLaunchPlans';
import { createNamedEntity } from '../../../test/modelUtils';

export function createLaunchPlan(
  id: NamedEntityIdentifier,
  metadata?: Partial<NamedEntityMetadata>,
) {
  return createNamedEntity(ResourceType.LAUNCH_PLAN, id, metadata);
}

const project = 'TestProject';
const domain = 'TestDomain';

const launchPlans = ['LP1', 'LP2'].map((name) => createLaunchPlan({ domain, name, project }));

jest.mock('../../LaunchPlan/useLaunchPlanInfoList', () => {
  return {
    useLaunchPlanInfoList: jest.fn(() => ({
      isLoading: false,
      value: launchPlans,
      state: {
        matches: (fetchState) => fetchState === fetchStates.LOADED,
        value: 'LOADED',
      },
    })),
  };
});

jest.mock('../../../components/hooks/useConditionalQuery', () => {
  let invocationCount = 0;
  return {
    useConditionalQuery: jest.fn(() => {
      if (invocationCount === 0) {
        invocationCount++;
        return {
          status: 'success',
          data: {
            entities: launchPlans,
          },
          isFetched: true,
          isFetching: false,
        };
      }

      return {
        status: 'success',
        data: {
          entities: launchPlans.map((lp) => ({
            id: lp.id,
            spec: {
              workflowId: {
                domain: lp.id.domain,
                name: `WF_${lp.id.name}`,
                project: lp.id.project,
              },
              entityMetadata: {
                schedule: {
                  kickoffTimeInputArg: 'kickoffTime',
                  kickoffTimeCronSchedule: '0 0 * * *',
                },
              },
              metadata: {
                mode: 1, // scheduled
              },
            },
            closure: {},
          })),
        },
        isFetched: true,
        isFetching: false,
      };
    }),
  };
});

jest.mock('@clients/primitives/hooks/FeatureFlagsProvider/useFeatureFlags', () => {
  return {
    useFeatureFlags: jest.fn(() => ({
      isFlagEnabled: () => true,
    })),
  };
});

jest.mock('@clients/primitives/hooks/FeatureFlagsProvider/defaultFlags', () => {
  return {
    FeatureFlagsEnum: {
      newLaunchPlan: 'newLaunchPlan',
    },
  };
});

declare module 'react-query/types/react/QueryClientProvider' {
  interface QueryClientProviderProps {
    children?: React.ReactNode;
  }
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: PropsWithChildren) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Launch Plan List', () => {
  const project = 'TestProject';
  const domain = 'TestDomain';
  beforeEach(() => {
    window.IntersectionObserver = jest.fn().mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });

    render(<ListProjectLaunchPlans domainId={domain} projectId={project} />, {
      wrapper: createWrapper(),
    });
  });
  it('renders two Launch Plans LP1 and LP2', async () => {
    expect(screen.getByText('LP1')).toBeInTheDocument();
    expect(screen.getByText('LP2')).toBeInTheDocument();
    const spanElementsLP1 = screen.getAllByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && content.startsWith('LP1');
    });
    expect(spanElementsLP1).toHaveLength(1);
    const spanElementsLP2 = screen.getAllByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && content.startsWith('LP2');
    });
    expect(spanElementsLP2).toHaveLength(1);
  });

  it('renders in table format with 2 rows + 1 header row', async () => {
    const tableElements = screen.getAllByText((content, element) => {
      return element?.tagName.toLowerCase() === 'table';
    });
    expect(tableElements).toHaveLength(1);

    const tableRowElements = screen.getAllByText((content, element) => {
      return element?.tagName.toLowerCase() === 'tr';
    });
    expect(tableRowElements).toHaveLength(3); // 2 rows + 1 header row

    // another way
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('renders in table format with six columns with exact names', async () => {
    const launchPlanNameCol = screen.getAllByText((content, element) => {
      return element?.tagName.toLowerCase() === 'th' && content === 'Launch Plan Name';
    });

    const underlyingWorkflowCol = screen.getAllByText((content, element) => {
      return element?.tagName.toLowerCase() === 'th' && content === 'Underlying Workflow';
    });

    const scheduleStatusCol = screen.getAllByText((content, element) => {
      return element?.tagName.toLowerCase() === 'th' && content === 'Schedule Status';
    });

    const scheduleCol = screen.getAllByText((content, element) => {
      return element?.tagName.toLowerCase() === 'th' && content === 'Schedule';
    });

    const lastExecutionCol = screen.getAllByText((content, element) => {
      return element?.tagName.toLowerCase() === 'th' && content === 'Last Execution';
    });

    const last10ExecutionsCol = screen.getAllByText((content, element) => {
      return element?.tagName.toLowerCase() === 'th' && content === 'Last 10 Executions';
    });

    expect(launchPlanNameCol).toHaveLength(1);
    expect(underlyingWorkflowCol).toHaveLength(1);
    expect(scheduleStatusCol).toHaveLength(1);
    expect(scheduleCol).toHaveLength(1);
    expect(lastExecutionCol).toHaveLength(1);
    expect(last10ExecutionsCol).toHaveLength(1);
  });

  it('renders 12 td elements', async () => {
    const tableTdElements = screen.getAllByText((content, element) => {
      return element?.tagName.toLowerCase() === 'td';
    });
    expect(tableTdElements).toHaveLength(12);
    // another way
    expect(screen.getAllByRole('cell')).toHaveLength(12);
  });
});
