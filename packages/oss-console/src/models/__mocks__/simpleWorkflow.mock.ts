import Long from 'long';
import { Workflow, WorkflowClosure } from '../Workflow';

const createdAt: WorkflowClosure['createdAt'] = {
  seconds: {
    low: 1695385664,
    high: 0,
    unsigned: false,
  } as Long,
  nanos: 586923000,
};

export const simpleWorkflowMock: Workflow = {
  id: {
    resourceType: 2,
    project: 'flytesnacks',
    domain: 'development',
    name: 'basics.hello_world.hello_world_wf',
    version: 'v0.3.226',
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
              name: 'basics.hello_world.say_hello',
              version: 'v0.3.226',
            },
            type: 'python-task',
            metadata: {
              tags: {},
              runtime: {
                type: 1,
                version: '1.9.0',
                flavor: 'python',
              },
              retries: {},
            },
            interface: {
              inputs: {
                variables: {},
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
                'basics.hello_world',
                'task-name',
                'say_hello',
              ],
              env: [],
              config: [],
              ports: [],
              image:
                'ghcr.io/flyteorg/flytecookbook:basics-a98c139d028f951134aa6fbfeb2531c8d4750e9c',
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
                      nodeId: 'n0',
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
              inputs: [],
              upstreamNodeIds: [],
              outputAliases: [],
              id: 'n0',
              metadata: {
                name: 'say_hello',
                retries: {},
              },
              taskNode: {
                overrides: {},
                referenceId: {
                  resourceType: 1,
                  project: 'flytesnacks',
                  domain: 'development',
                  name: 'basics.hello_world.say_hello',
                  version: 'v0.3.226',
                },
              },
            },
          ],
          outputs: [
            {
              var: 'o0',
              binding: {
                promise: {
                  nodeId: 'n0',
                  var: 'o0',
                },
              },
            },
          ],
          id: {
            resourceType: 2,
            project: 'flytesnacks',
            domain: 'development',
            name: 'basics.hello_world.hello_world_wf',
            version: 'v0.3.226',
          },
          metadata: {
            tags: {},
          },
          interface: {
            inputs: {
              variables: {},
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
              ids: ['end-node'],
            },
          },
          upstream: {
            n0: {
              ids: ['start-node'],
            },
            'end-node': {
              ids: ['n0'],
            },
          },
        },
      },
    },
    createdAt,
  },
};
