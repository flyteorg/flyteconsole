import React, { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { BrowserRouter } from 'react-router-dom';
import {
  NamedEntityIdentifier,
  NamedEntityMetadata,
  ResourceType,
} from '../../../models/Common/types';
import { LaunchPlanNextPotentialExecution } from '../components/LaunchPlanNextPotentialExecution';
import { createNamedEntity } from '../../../test/modelUtils';
import { LaunchPlan } from '../../../models/Launch/types';
import { Execution, ExecutionClosure } from '../../../models/Execution/types';

export function createLaunchPlan(
  id: NamedEntityIdentifier,
  metadata?: Partial<NamedEntityMetadata>,
) {
  return createNamedEntity(ResourceType.LAUNCH_PLAN, id, metadata);
}

const rateLaunchPlan: LaunchPlan = {
  id: {
    domain: 'development',
    name: 'my_cron_scheduled_lp',
    project: 'flytesnacks',
    resourceType: 3,
    version: 'v0.3.248',
  },
  spec: {
    defaultInputs: {
      parameters: {
        kickoff_time: {
          var: {
            description: 'kickoff_time',
            type: {
              simple: 5,
            },
          },
        },
      },
    },
    fixedInputs: {
      literals: {},
    },
    role: 'flyteuser',
    entityMetadata: {
      notifications: [],
      schedule: {
        rate: {
          value: 10,
        },
      },
    },
    workflowId: {
      domain: 'development',
      name: 'my_cron_scheduled_wf',
      project: 'flytesnacks',
      resourceType: 2,
      version: 'v0.3.248',
    },
  },
  closure: {
    state: 1,
    expectedInputs: {
      parameters: {
        kickoff_time: {
          var: {
            description: 'kickoff_time',
            type: {
              simple: 5,
            },
          },
        },
      },
    },
    expectedOutputs: {
      variables: {},
    },
    createdAt: {
      nanos: 102555000,
      seconds: {
        high: 0,
        low: 1683587947,
        unsigned: false,
      },
    },
    updatedAt: {
      nanos: 932665000,
      seconds: {
        high: 0,
        low: 1702446628,
        unsigned: false,
      },
    },
  },
};

const cronLaunchPlan: LaunchPlan = {
  id: {
    domain: 'development',
    name: 'my_cron_scheduled_lp',
    project: 'flytesnacks',
    resourceType: 3,
    version: 'v0.3.248',
  },
  spec: {
    defaultInputs: {
      parameters: {
        kickoff_time: {
          var: {
            description: 'kickoff_time',
            type: {
              simple: 5,
            },
          },
        },
      },
    },
    fixedInputs: {
      literals: {},
    },
    role: 'flyteuser',
    entityMetadata: {
      notifications: [],
      schedule: {
        cronSchedule: { schedule: '*/1 * * * *' },
        kickoffTimeInputArg: 'kickoff_time',
      },
    },
    workflowId: {
      domain: 'development',
      name: 'my_cron_scheduled_wf',
      project: 'flytesnacks',
      resourceType: 2,
      version: 'v0.3.248',
    },
  },
  closure: {
    state: 1,
    expectedInputs: {
      parameters: {
        kickoff_time: {
          var: {
            description: 'kickoff_time',
            type: {
              simple: 5,
            },
          },
        },
      },
    },
    expectedOutputs: {
      variables: {},
    },
    createdAt: {
      nanos: 102555000,
      seconds: {
        high: 0,
        low: 1702446149,
        unsigned: false,
      },
    },
    updatedAt: {
      nanos: 932665000,
      seconds: {
        high: 0,
        low: 1702446628,
        unsigned: false,
      },
    },
  },
};

const mockExecutionClosure: ExecutionClosure = {
  phase: 4,
  createdAt: {
    seconds: {
      low: 1683587947,
      high: 0,
      unsigned: false,
    },
    nanos: 381670536,
  },
  workflowId: {
    resourceType: 2,
    project: 'flytesnacks',
    domain: 'development',
    name: 'core.scheduled_workflows.lp_schedules.positive_wf',
    version: 'v0.3.173',
  },
};

const myTestExecutions: Execution[] = [
  {
    id: {
      domain: 'development',
      name: 'my_cron_scheduled_execution',
      project: 'flytesnacks',
    },
    spec: {
      notifications: { notifications: [] },
      inputs: {
        literals: {
          kickoff_time: {
            scalar: {
              primitive: {
                datetime: null,
              },
            },
          },
        },
      },
      launchPlan: {
        domain: 'development',
        name: 'my_cron_scheduled_lp',
        project: 'flytesnacks',
        resourceType: 3,
        version: 'v0.3.248',
      },
      metadata: {
        mode: 1,
        principal: 'dogfood-flyteadmin',
        scheduledAt: {
          nanos: 0,
          seconds: {
            high: 0,
            low: 1683587947,
            unsigned: false,
          },
        },
        systemMetadata: {
          executionCluster: 'oc-staging',
        },
        nesting: 0,
      },
      securityContext: {},
    },
    closure: mockExecutionClosure,
  },
];

jest.mock('../../../components/hooks/useConditionalQuery', () => {
  let invocationCount = 0;
  return {
    useConditionalQuery: jest.fn(() => {
      if (invocationCount === 0) {
        invocationCount++;
        return {
          status: 'loading',
          data: undefined,
          isFetched: false,
          isFetching: true,
        };
      }

      return {
        status: 'success',
        data: {
          entities: myTestExecutions,
        },
        isFetched: true,
        isFetching: false,
      };
    }),
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

describe('LaunchPlanNextPotentialExecution component with RATE Schedule', () => {
  const renderView = () => {
    return render(<LaunchPlanNextPotentialExecution launchPlan={rateLaunchPlan} />, {
      wrapper: createWrapper(),
    });
  };
  //
  it('renders shimmer initially while fetching the executions', async () => {
    const { getByTestId } = renderView();
    expect(getByTestId('shimmer').nodeName.toLowerCase()).toBe('div');
  });
  it('renders valid next potential execution for an active launchplan after it fetches execution', async () => {
    // Testing for disappearance of shimmer
    // 10 minutes after 5/8/2023 11:19:07 PM UTC
    const { queryByTestId } = renderView();
    await waitFor(() => {
      expect(queryByTestId('shimmer')).not.toBeInTheDocument();
    });
  });
});
