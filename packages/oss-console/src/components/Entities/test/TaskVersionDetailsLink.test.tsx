import { render, waitFor, screen } from '@testing-library/react';
import * as React from 'react';
import { createTestQueryClient } from '@clients/oss-console/test/utils';
import { QueryClientProvider } from 'react-query';
import { createMockTask } from '../../../models/__mocks__/taskData';
import { Task } from '../../../models/Task/types';
import { Identifier } from '../../../models/Common/types';
import { versionDetailsUrlGenerator } from '../generators';
import { TaskVersionDetailsLink } from '../VersionDetails/VersionDetailsLink';

jest.mock('../../../models/Task/api.ts', () => ({
  getTask: jest.fn((scope) => ({
    id: scope,
    closure: {
      compiledTask: {
        template: {
          config: {},
          id: {
            resourceType: 1,
            project: 'flytesnacks',
            domain: 'development',
            name: 'My Task',
            version: '1234567890',
          },
          type: 'python-task',
          metadata: {
            tags: {},
            runtime: {
              type: 1,
              version: '0.32.3',
              flavor: 'python',
            },
            retries: {},
          },
          interface: {
            inputs: {
              variables: {
                s: {
                  type: {
                    schema: {
                      columns: [],
                    },
                  },
                  description: 's',
                },
              },
            },
            outputs: {
              variables: {
                o0: {
                  type: {
                    schema: {
                      columns: [],
                    },
                  },
                  description: 'o0',
                },
              },
            },
          },
          container: {
            command: [],
            args: [
              'pyflyte-fast-execute',
              '--additional-distribution',
              's3://union-cloud-oc-staging-dogfood/flytesnacks/development/64MA5UGSQODRA4K5NT3D4HMMRE======/scriptmode.tar.gz',
              '--dest-dir',
              '/root',
              '--',
              'pyflyte-execute',
              '--inputs',
              '{{.input}}',
              '--output-prefix',
              '{{.outputPrefix}}',
              '--raw-output-data-prefix',
              '{{.rawOutputDataPrefix}}',
              '--checkpoint-path',
              '{{.checkpointOutputPrefix}}',
              '--prev-checkpoint',
              '{{.prevCheckpointPrefix}}',
              '--resolver',
              'flytekit.core.python_auto_container.default_task_resolver',
              '--',
              'task-module',
              'athena.athena',
              'task-name',
              'manipulate_athena_schema',
            ],
            env: [],
            config: [],
            ports: [],
            image: 'ghcr.io/flyteorg/flytecookbook:athena-latest',
            resources: {
              requests: [],
              limits: [],
            },
          },
        },
      },
      createdAt: {
        seconds: {
          low: 1688540086,
          high: 0,
          unsigned: false,
        },
        nanos: 358482000,
      },
    },
  })),
}));

jest.mock('../../../components/common/WaitForData', () => ({
  ...jest.requireActual('../../../components/common/WaitForData'),
  WaitForData: jest.fn(({ children }) => <div>{children}</div>),
}));

describe('TaskVersionDetailsLink', () => {
  let mockTask: Task;
  const queryClient = createTestQueryClient();

  const createMocks = () => {
    mockTask = createMockTask('MyTask', '1234567890');
  };

  const renderLink = (id: Identifier) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TaskVersionDetailsLink id={id} />
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    createMocks();
  });

  it('renders and checks text', async () => {
    const { id } = mockTask;
    renderLink(id);
    await waitFor(() => {
      expect(screen.getByText('Task Details')).toBeInTheDocument();
    });
  });

  it('renders and checks containing icon', () => {
    const { id } = mockTask;
    const { container } = renderLink(id);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders and checks url', () => {
    const { id } = mockTask;
    const { container } = renderLink(id);
    expect(container.querySelector('a')).toHaveAttribute('href', versionDetailsUrlGenerator(id));
  });
});
