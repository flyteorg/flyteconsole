import { act, render, screen, waitFor } from '@testing-library/react';
import { Workflow } from 'models/Workflow/types';
import * as React from 'react';
import { long, createTestQueryClient } from 'test/utils';
import { QueryClient, QueryClientProvider } from 'react-query';
import { WorkflowGraph } from '../WorkflowGraph';

const workflow: Workflow = {
  id: {
    resourceType: 2,
    project: 'flytesnacks',
    domain: 'development',
    name: 'core.control_flow.map_task.my_map_workflow',
    version: 'MT76cyUZeeYX-hA6qeIotA==',
  },
  closure: {
    compiledWorkflow: {
      subWorkflows: [],
      tasks: [
        {
          template: {
            config: {},
            id: {
              resourceType: 1,
              project: 'flytesnacks',
              domain: 'development',
              name: 'core.control_flow.map_task.coalesce',
              version: 'MT76cyUZeeYX-hA6qeIotA==',
            },
            type: 'python-task',
            metadata: {
              runtime: {
                type: 1,
                version: '0.0.0+develop',
                flavor: 'python',
              },
              retries: {},
            },
            interface: {
              inputs: {
                variables: {
                  b: {
                    type: {
                      collectionType: {
                        simple: 3,
                      },
                    },
                    description: 'b',
                  },
                },
              },
              outputs: {
                variables: {
                  o0: {
                    type: {
                      simple: 3,
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
                's3://flyte-demo/zn/flytesnacks/development/MT76cyUZeeYX+hA6qeIotA==/scriptmode.tar.gz',
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
                'core.control_flow.map_task',
                'task-name',
                'coalesce',
              ],
              env: [],
              config: [],
              ports: [],
              image: 'ghcr.io/flyteorg/flytekit:py3.9-latest',
              resources: {
                requests: [],
                limits: [],
              },
            },
          },
        },
        {
          template: {
            config: {},
            id: {
              resourceType: 1,
              project: 'flytesnacks',
              domain: 'development',
              name: 'core.control_flow.map_task.mapper_a_mappable_task_0',
              version: 'MT76cyUZeeYX-hA6qeIotA==',
            },
            type: 'container_array',
            metadata: {
              runtime: {
                type: 1,
                version: '0.0.0+develop',
                flavor: 'python',
              },
              retries: {},
            },
            interface: {
              inputs: {
                variables: {
                  a: {
                    type: {
                      collectionType: {
                        simple: 1,
                      },
                    },
                    description: 'a',
                  },
                },
              },
              outputs: {
                variables: {
                  o0: {
                    type: {
                      collectionType: {
                        simple: 3,
                      },
                    },
                    description: 'o0',
                  },
                },
              },
            },
            custom: {
              fields: {
                minSuccessRatio: {
                  numberValue: 1,
                },
              },
            },
            taskTypeVersion: 1,
            container: {
              command: [],
              args: [
                'pyflyte-fast-execute',
                '--additional-distribution',
                's3://flyte-demo/zn/flytesnacks/development/MT76cyUZeeYX+hA6qeIotA==/scriptmode.tar.gz',
                '--dest-dir',
                '/root',
                '--',
                'pyflyte-map-execute',
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
                'core.control_flow.map_task',
                'task-name',
                'a_mappable_task',
              ],
              env: [],
              config: [],
              ports: [],
              image: 'ghcr.io/flyteorg/flytekit:py3.9-latest',
              resources: {
                requests: [],
                limits: [],
              },
            },
          },
        },
      ],
      primary: {
        template: {
          nodes: [
            {
              inputs: [],
              upstreamNodeIds: [],
              outputAliases: [],
              id: 'start-node',
            },
            {
              inputs: [
                {
                  var: 'o0',
                  binding: {
                    promise: {
                      nodeId: 'n1',
                      var: 'o0',
                    },
                  },
                },
              ],
              upstreamNodeIds: [],
              outputAliases: [],
              id: 'end-node',
            },
            {
              inputs: [
                {
                  var: 'a',
                  binding: {
                    promise: {
                      nodeId: 'start-node',
                      var: 'a',
                    },
                  },
                },
              ],
              upstreamNodeIds: [],
              outputAliases: [],
              id: 'n0',
              metadata: {
                name: 'mapper_a_mappable_task_0',
                retries: {
                  retries: 1,
                },
              },
              taskNode: {
                overrides: {
                  resources: {
                    requests: [
                      {
                        name: 3,
                        value: '300Mi',
                      },
                    ],
                    limits: [
                      {
                        name: 3,
                        value: '500Mi',
                      },
                    ],
                  },
                },
                referenceId: {
                  resourceType: 1,
                  project: 'flytesnacks',
                  domain: 'development',
                  name: 'core.control_flow.map_task.mapper_a_mappable_task_0',
                  version: 'MT76cyUZeeYX-hA6qeIotA==',
                },
              },
            },
            {
              inputs: [
                {
                  var: 'b',
                  binding: {
                    promise: {
                      nodeId: 'n0',
                      var: 'o0',
                    },
                  },
                },
              ],
              upstreamNodeIds: ['n0'],
              outputAliases: [],
              id: 'n1',
              metadata: {
                name: 'coalesce',
                retries: {},
              },
              taskNode: {
                overrides: {},
                referenceId: {
                  resourceType: 1,
                  project: 'flytesnacks',
                  domain: 'development',
                  name: 'core.control_flow.map_task.coalesce',
                  version: 'MT76cyUZeeYX-hA6qeIotA==',
                },
              },
            },
          ],
          outputs: [
            {
              var: 'o0',
              binding: {
                promise: {
                  nodeId: 'n1',
                  var: 'o0',
                },
              },
            },
          ],
          id: {
            resourceType: 2,
            project: 'flytesnacks',
            domain: 'development',
            name: 'core.control_flow.map_task.my_map_workflow',
            version: 'MT76cyUZeeYX-hA6qeIotA==',
          },
          metadata: {},
          interface: {
            inputs: {
              variables: {
                a: {
                  type: {
                    collectionType: {
                      simple: 1,
                    },
                  },
                  description: 'a',
                },
              },
            },
            outputs: {
              variables: {
                o0: {
                  type: {
                    simple: 3,
                  },
                  description: 'o0',
                },
              },
            },
          },
          metadataDefaults: {},
        },
        connections: {
          downstream: {
            'start-node': {
              ids: ['n0'],
            },
            n0: {
              ids: ['n1'],
            },
            n1: {
              ids: ['end-node'],
            },
          },
          upstream: {
            'end-node': {
              ids: ['n1'],
            },
            n0: {
              ids: ['start-node'],
            },
            n1: {
              ids: ['n0'],
            },
          },
        },
      },
    },
    createdAt: {
      seconds: long(0),
      nanos: 343264000,
    },
  },
};

const nodeExecutionsById = {
  n0: {
    id: {
      nodeId: 'n0',
      executionId: {
        project: 'flytesnacks',
        domain: 'development',
        name: 'fc027ce9fe4cf4f5eba8',
      },
    },
    inputUri:
      's3://flyte-demo/metadata/propeller/flytesnacks-development-fc027ce9fe4cf4f5eba8/n0/data/inputs.pb',
    closure: {
      phase: 3,
      startedAt: {
        seconds: {
          low: 1649888546,
          high: 0,
          unsigned: false,
        },
        nanos: 773100279,
      },
      duration: {
        seconds: {
          low: 22,
          high: 0,
          unsigned: false,
        },
        nanos: 800572640,
      },
      createdAt: {
        seconds: {
          low: 1649888546,
          high: 0,
          unsigned: false,
        },
        nanos: 697168683,
      },
      updatedAt: {
        seconds: {
          low: 1649888569,
          high: 0,
          unsigned: false,
        },
        nanos: 573672640,
      },
      outputUri:
        's3://flyte-demo/metadata/propeller/flytesnacks-development-fc027ce9fe4cf4f5eba8/n0/data/0/outputs.pb',
    },
    metadata: {
      specNodeId: 'n0',
    },
    scopedId: 'n0',
    externalResourcesByPhase: new Map([
      [
        3,
        [
          {
            logs: [
              {
                uri: 'http://localhost:30082/#!/log/flytesnacks-development/fc027ce9fe4cf4f5eba8-n0-0-0/pod?namespace=flytesnacks-development',
                name: 'Kubernetes Logs #0-0',
                messageFormat: 2,
              },
            ],
            externalId: 'fc027ce9fe4cf4f5eba8-n0-0-0',
            phase: 3,
          },
          {
            logs: [
              {
                uri: 'http://localhost:30082/#!/log/flytesnacks-development/fc027ce9fe4cf4f5eba8-n0-0-1/pod?namespace=flytesnacks-development',
                name: 'Kubernetes Logs #0-1',
                messageFormat: 2,
              },
            ],
            externalId: 'fc027ce9fe4cf4f5eba8-n0-0-1',
            index: 1,
            phase: 3,
          },
          {
            logs: [
              {
                uri: 'http://localhost:30082/#!/log/flytesnacks-development/fc027ce9fe4cf4f5eba8-n0-0-2/pod?namespace=flytesnacks-development',
                name: 'Kubernetes Logs #0-2',
                messageFormat: 2,
              },
            ],
            externalId: 'fc027ce9fe4cf4f5eba8-n0-0-2',
            index: 2,
            phase: 3,
          },
        ],
      ],
    ]),
  },
  n1: {
    id: {
      nodeId: 'n1',
      executionId: {
        project: 'flytesnacks',
        domain: 'development',
        name: 'fc027ce9fe4cf4f5eba8',
      },
    },
    inputUri:
      's3://flyte-demo/metadata/propeller/flytesnacks-development-fc027ce9fe4cf4f5eba8/n1/data/inputs.pb',
    closure: {
      phase: 3,
      startedAt: {
        seconds: {
          low: 1649888569,
          high: 0,
          unsigned: false,
        },
        nanos: 782695018,
      },
      duration: {
        seconds: {
          low: 9,
          high: 0,
          unsigned: false,
        },
        nanos: 811268323,
      },
      createdAt: {
        seconds: {
          low: 1649888569,
          high: 0,
          unsigned: false,
        },
        nanos: 685160925,
      },
      updatedAt: {
        seconds: {
          low: 1649888579,
          high: 0,
          unsigned: false,
        },
        nanos: 593963323,
      },
      outputUri:
        's3://flyte-demo/metadata/propeller/flytesnacks-development-fc027ce9fe4cf4f5eba8/n1/data/0/outputs.pb',
    },
    metadata: {
      specNodeId: 'n1',
    },
    scopedId: 'n1',
  },
};

describe('WorkflowGraph', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
  });

  it('should render map task logs when all props were provided', async () => {
    act(() => {
      render(
        <QueryClientProvider client={queryClient}>
          <div style={{ width: '1000px', height: '1000px' }}>
            <WorkflowGraph
              onNodeSelectionChanged={jest.fn}
              onMapTaskSelectionChanged={jest.fn}
              workflow={workflow}
              nodeExecutionsById={nodeExecutionsById}
            />
          </div>
        </QueryClientProvider>,
      );
    });

    const graphNode = await waitFor(() => screen.findByText('start'));
    expect(graphNode).toBeInTheDocument();
  });
});
