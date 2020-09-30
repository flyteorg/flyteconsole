import {
    Identifier,
    LaunchPlan,
    NamedEntityIdentifier,
    Workflow,
    WorkflowExecutionIdentifier,
    WorkflowId
} from 'models';
import { assign, Machine, MachineConfig } from 'xstate';
import { LiteralValueMap, ParsedInput } from './types';

export type SelectWorkflowVersionEvent = {
    type: 'SELECT_WORKFLOW_VERSION';
    workflowId: WorkflowId;
};

export type WorkflowVersionOptionsLoadedEvent = {
    type: string;
    workflows: Workflow[];
};

export type LaunchPlanOptionsLoadedEvent = {
    type: string;
    launchPlans: LaunchPlan[];
};

export type TaskVersionOptionsLoadedEvent = {
    type: string;
    taskIds: Identifier[];
};

export type SelectTaskVersionEvent = {
    type: 'SELECT_TASK_VERSION';
    taskId: Identifier;
};

export type SelectLaunchPlanEvent = {
    type: 'SELECT_LAUNCH_PLAN';
    launchPlan: LaunchPlan;
};

export type ExecutionCreatedEvent = {
    type: string;
    executionId: WorkflowExecutionIdentifier;
};

export type InputsParsedEvent = {
    type: string;
    parsedInputs: ParsedInput[];
    unsupportedRequiredInputs?: ParsedInput[];
};

export type ErrorEvent = {
    type: string;
    error: Error;
};

export type LaunchEvent =
    | { type: 'CANCEL' }
    | { type: 'SUBMIT' }
    | { type: 'RETRY' }
    | SelectWorkflowVersionEvent
    | WorkflowVersionOptionsLoadedEvent
    | LaunchPlanOptionsLoadedEvent
    | TaskVersionOptionsLoadedEvent
    | InputsParsedEvent
    | SelectTaskVersionEvent
    | SelectLaunchPlanEvent
    | ExecutionCreatedEvent
    | ErrorEvent;

export interface LaunchContext {
    defaultInputValues?: LiteralValueMap;
    launchPlan?: LaunchPlan;
    launchPlanOptions?: LaunchPlan[];
    parsedInputs: ParsedInput[];
    resultExecutionId?: WorkflowExecutionIdentifier;
    sourceType: 'workflow' | 'task';
    sourceWorkflowId?: NamedEntityIdentifier;
    sourceTaskId?: NamedEntityIdentifier;
    error?: Error;
    preferredLaunchPlanId?: Identifier;
    preferredWorkflowId?: Identifier;
    workflowVersion?: WorkflowId;
    workflowVersionOptions?: Workflow[];
    taskVersion?: Identifier;
    taskVersionOptions?: Identifier[];
    unsupportedRequiredInputs: ParsedInput[];
}

export enum LaunchState {
    CANCELLED = 'CANCELLED',
    SELECT_SOURCE = 'SELECT_SOURCE',
    LOADING_WORKFLOW_VERSIONS = 'LOADING_WORKFLOW_VERSIONS',
    FAILED_LOADING_WORKFLOW_VERSIONS = 'FAILED_LOADING_WORKFLOW_VERSIONS',
    SELECT_WORKFLOW_VERSION = 'SELECT_WORKFLOW_VERSION',
    LOADING_LAUNCH_PLANS = 'LOADING_LAUNCH_PLANS',
    FAILED_LOADING_LAUNCH_PLANS = 'FAILED_LOADING_LAUNCH_PLANS',
    SELECT_LAUNCH_PLAN = 'SELECT_LAUNCH_PLAN',
    LOADING_TASK_VERSIONS = 'LOADING_TASK_VERSIONS',
    FAILED_LOADING_TASK_VERSIONS = 'FAILED_LOADING_TASK_VERSIONS',
    SELECT_TASK_VERSION = 'SELECT_TASK_VERSION',
    LOADING_INPUTS = 'LOADING_INPUTS',
    FAILED_LOADING_INPUTS = 'FAILED_LOADING_INPUTS',
    UNSUPPORTED_INPUTS = 'UNSUPPORTED_INPUTS',
    ENTER_INPUTS = 'ENTER_INPUTS',
    VALIDATING_INPUTS = 'VALIDATING_INPUTS',
    INVALID_INPUTS = 'INVALID_INPUTS',
    SUBMIT_VALIDATING = 'SUBMIT_VALIDATING',
    SUBMITTING = 'SUBMITTING',
    SUBMIT_FAILED = 'SUBMIT_FAILED',
    SUBMIT_SUCCEEDED = 'SUBMIT_SUCCEEDED'
}

export interface LaunchSchemaFlat {
    states: {
        [LaunchState.CANCELLED]: {};
        [LaunchState.SELECT_SOURCE]: {};
        [LaunchState.LOADING_WORKFLOW_VERSIONS]: {};
        [LaunchState.FAILED_LOADING_WORKFLOW_VERSIONS]: {};
        [LaunchState.SELECT_WORKFLOW_VERSION]: {};
        [LaunchState.LOADING_LAUNCH_PLANS]: {};
        [LaunchState.FAILED_LOADING_LAUNCH_PLANS]: {};
        [LaunchState.SELECT_LAUNCH_PLAN]: {};
        [LaunchState.LOADING_TASK_VERSIONS]: {};
        [LaunchState.FAILED_LOADING_TASK_VERSIONS]: {};
        [LaunchState.SELECT_TASK_VERSION]: {};
        [LaunchState.LOADING_INPUTS]: {};
        [LaunchState.FAILED_LOADING_INPUTS]: {};
        [LaunchState.UNSUPPORTED_INPUTS]: {};
        [LaunchState.ENTER_INPUTS]: {};
        [LaunchState.VALIDATING_INPUTS]: {};
        [LaunchState.INVALID_INPUTS]: {};
        [LaunchState.SUBMIT_VALIDATING]: {};
        [LaunchState.SUBMITTING]: {};
        [LaunchState.SUBMIT_FAILED]: {};
        [LaunchState.SUBMIT_SUCCEEDED]: {};
    };
}

export interface LaunchSchemaDeep {
    states: {
        cancelled: {};
        working: {
            states: {
                selectSource: {
                    states: {
                        selectType: {};
                        workflowSource: {
                            states: {
                                workflow: {
                                    states: {
                                        loading: {};
                                        failedLoading: {};
                                        select: {};
                                    };
                                };
                                launchPlan: {
                                    states: {
                                        loading: {};
                                        failedLoading: {};
                                        select: {};
                                    };
                                };
                            };
                        };
                        taskSource: {
                            states: {
                                loading: {};
                                failedLoading: {};
                                select: {};
                            };
                        };
                    };
                };
                sourceSelected: {
                    states: {
                        loadingInputs: {};
                        failedLoadingInputs: {};
                        unsupportedInputs: {};
                        enterInputs: {
                            states: {
                                working: {};
                                validating: {};
                                invalidInputs: {};
                            };
                        };
                        submit: {
                            states: {
                                validating: {};
                                submitting: {};
                                failed: {};
                                succeeded: {};
                            };
                        };
                    };
                };
            };
        };
    };
}

export type LaunchSchema = LaunchSchemaDeep;

export type LaunchTypestate =
    | {
          value:
              | { cancelled: string }
              | { launchPlan: string }
              | { working: string }
              | { workflow: string }
              | { sourceSelected: string }
              | { submit: string };
          context: LaunchContext;
      }
    | {
          value: 'select' | { workflow: 'select' };
          context: LaunchContext & {
              workflowVersionOptions: Workflow[];
          };
      }
    | {
          value: { launchPlan: 'select' };
          context: LaunchContext & {
              workflowVersionOptions: Workflow[];
              launchPlanOptions: LaunchPlan[];
          };
      }
    | {
          value: { sourceSelected: 'unsupportedRequiredInputs' };
          context: LaunchContext & {
              unsupportedRequiredInputs: [];
          };
      }
    | {
          value:
              | { sourceSelected: 'enterInputs' }
              | { sourceSelected: 'submit' };
          context: LaunchContext & {
              parsedInputs: [];
          };
      }
    | {
          value: { submit: 'succeeded' };
          context: LaunchContext & {
              resultExecutionId: WorkflowExecutionIdentifier;
          };
      }
    | {
          value: { submit: 'failed' };
          context: LaunchContext & {
              error: Error;
          };
      };

export type LaunchFlatTypestate =
    | {
          value: LaunchState;
          context: LaunchContext;
      }
    | {
          value: LaunchState.SELECT_WORKFLOW_VERSION;
          context: LaunchContext & {
              workflowVersionOptions: Workflow[];
          };
      }
    | {
          value: LaunchState.SELECT_LAUNCH_PLAN;
          context: LaunchContext & {
              workflowVersionOptions: Workflow[];
              launchPlanOptions: LaunchPlan[];
          };
      }
    | {
          value: LaunchState.UNSUPPORTED_INPUTS;
          context: LaunchContext & {
              parsedInputs: [];
              unsupportedRequiredInputs: [];
          };
      }
    | {
          value:
              | LaunchState.ENTER_INPUTS
              | LaunchState.VALIDATING_INPUTS
              | LaunchState.INVALID_INPUTS
              | LaunchState.SUBMIT_VALIDATING
              | LaunchState.SUBMITTING
              | LaunchState.SUBMIT_SUCCEEDED;
          context: LaunchContext & {
              parsedInputs: [];
          };
      }
    | {
          value: LaunchState.SUBMIT_SUCCEEDED;
          context: LaunchContext & {
              resultExecutionId: WorkflowExecutionIdentifier;
          };
      }
    | {
          value: LaunchState.SUBMIT_FAILED;
          context: LaunchContext & {
              parsedInputs: ParsedInput[];
              error: Error;
          };
      }
    | {
          value:
              | LaunchState.FAILED_LOADING_INPUTS
              | LaunchState.FAILED_LOADING_LAUNCH_PLANS
              | LaunchState.FAILED_LOADING_TASK_VERSIONS
              | LaunchState.FAILED_LOADING_WORKFLOW_VERSIONS;
          context: LaunchContext & {
              error: Error;
          };
      };

export const flatLaunchMachineConfig: MachineConfig<
    LaunchContext,
    LaunchSchemaFlat,
    LaunchEvent
> = {
    id: 'launch',
    initial: LaunchState.SELECT_SOURCE,
    context: {
        parsedInputs: [],
        // Defaults to workflow, can be overidden when interpreting the machine
        sourceType: 'workflow',
        unsupportedRequiredInputs: []
    },
    on: {
        CANCEL: LaunchState.CANCELLED,
        SELECT_WORKFLOW_VERSION: {
            // TODO: guard on sourceType
            target: LaunchState.LOADING_LAUNCH_PLANS
        },
        SELECT_LAUNCH_PLAN: {
            // TODO: guard on sourceType
            target: LaunchState.LOADING_INPUTS
        },
        SELECT_TASK_VERSION: {
            // TODO: guard on sourceType
            target: LaunchState.LOADING_INPUTS
        }
    },
    states: {
        [LaunchState.CANCELLED]: {
            type: 'final'
        },
        [LaunchState.SELECT_SOURCE]: {
            // Automatically transition to the proper sub-state based
            // on what type of source was specified when interpreting
            // the machine.
            always: [
                {
                    target: LaunchState.LOADING_WORKFLOW_VERSIONS,
                    // TODO: Possible to interpret this machine without setting
                    // a source id. That's an unrecoverable error. What should we do there?
                    cond: ({ sourceType, sourceWorkflowId }) =>
                        sourceType === 'workflow' && !!sourceWorkflowId
                },
                {
                    target: LaunchState.LOADING_TASK_VERSIONS,
                    cond: ({ sourceType, sourceTaskId }) =>
                        sourceType === 'task' && !!sourceTaskId
                }
            ]
        },
        [LaunchState.LOADING_WORKFLOW_VERSIONS]: {
            invoke: {
                src: 'loadWorkflowVersions',
                onDone: {
                    target: LaunchState.SELECT_WORKFLOW_VERSION,
                    actions: ['setWorkflowVersionOptions']
                },
                onError: {
                    target: LaunchState.FAILED_LOADING_WORKFLOW_VERSIONS,
                    actions: ['setError']
                }
            }
        },
        [LaunchState.FAILED_LOADING_WORKFLOW_VERSIONS]: {
            on: {
                RETRY: LaunchState.LOADING_WORKFLOW_VERSIONS
            }
        },
        [LaunchState.SELECT_WORKFLOW_VERSION]: {
            on: {
                SELECT_WORKFLOW_VERSION: {
                    target: LaunchState.LOADING_LAUNCH_PLANS,
                    actions: ['setWorkflowVersion']
                }
            }
        },
        [LaunchState.LOADING_LAUNCH_PLANS]: {
            invoke: {
                src: 'loadLaunchPlans',
                onDone: {
                    target: LaunchState.SELECT_LAUNCH_PLAN,
                    actions: ['setLaunchPlanOptions']
                },
                onError: {
                    target: LaunchState.FAILED_LOADING_LAUNCH_PLANS,
                    actions: ['setError']
                }
            }
        },
        [LaunchState.FAILED_LOADING_LAUNCH_PLANS]: {
            on: {
                RETRY: LaunchState.LOADING_LAUNCH_PLANS
            }
        },
        [LaunchState.SELECT_LAUNCH_PLAN]: {
            on: {
                SELECT_LAUNCH_PLAN: {
                    target: LaunchState.LOADING_INPUTS,
                    actions: ['setLaunchPlan']
                }
            }
        },
        [LaunchState.LOADING_TASK_VERSIONS]: {
            invoke: {
                src: 'loadTaskVersions',
                onDone: {
                    target: LaunchState.SELECT_TASK_VERSION,
                    actions: ['setTaskVersionOptions']
                },
                onError: {
                    target: LaunchState.FAILED_LOADING_TASK_VERSIONS,
                    actions: ['setError']
                }
            }
        },
        [LaunchState.FAILED_LOADING_TASK_VERSIONS]: {
            on: {
                RETRY: LaunchState.LOADING_TASK_VERSIONS
            }
        },
        [LaunchState.SELECT_TASK_VERSION]: {
            on: {
                SELECT_TASK_VERSION: {
                    target: LaunchState.LOADING_INPUTS,
                    actions: ['setTaskVersion']
                }
            }
        },
        [LaunchState.LOADING_INPUTS]: {
            invoke: {
                src: 'loadInputs',
                onDone: {
                    target: LaunchState.ENTER_INPUTS,
                    actions: ['setInputs']
                },
                onError: {
                    target: LaunchState.FAILED_LOADING_INPUTS,
                    actions: ['setError']
                }
            }
        },
        [LaunchState.FAILED_LOADING_INPUTS]: {
            on: {
                RETRY: LaunchState.LOADING_INPUTS
            }
        },
        [LaunchState.UNSUPPORTED_INPUTS]: {
            // TODO: We need logic to detect when to move into this state
        },
        [LaunchState.ENTER_INPUTS]: {
            on: {
                SUBMIT: LaunchState.SUBMIT_VALIDATING,
                VALIDATE: LaunchState.VALIDATING_INPUTS
            }
        },
        [LaunchState.VALIDATING_INPUTS]: {
            invoke: {
                src: 'validate',
                onDone: LaunchState.ENTER_INPUTS,
                onError: LaunchState.INVALID_INPUTS
            }
        },
        [LaunchState.INVALID_INPUTS]: {
            on: {
                VALIDATE: LaunchState.VALIDATING_INPUTS
            }
        },
        [LaunchState.SUBMIT_VALIDATING]: {
            invoke: {
                src: 'validate',
                onDone: {
                    target: LaunchState.SUBMITTING
                },
                onError: {
                    target: LaunchState.INVALID_INPUTS,
                    actions: ['setError']
                }
            }
        },
        [LaunchState.SUBMITTING]: {
            invoke: {
                src: 'submit',
                onDone: {
                    target: LaunchState.SUBMIT_SUCCEEDED,
                    // TODO: Do we need this or can the consumer just listen to the `data` property of the machine?
                    actions: ['setExecutionId']
                },
                onError: {
                    target: LaunchState.SUBMIT_FAILED,
                    actions: ['setError']
                }
            }
        },
        [LaunchState.SUBMIT_FAILED]: {
            on: {
                SUBMIT: LaunchState.SUBMITTING
            }
        },
        [LaunchState.SUBMIT_SUCCEEDED]: {
            type: 'final'
        }
    }
};

const launchMachineConfig: MachineConfig<
    LaunchContext,
    LaunchSchemaDeep,
    LaunchEvent
> = {
    id: 'launch',
    initial: 'working',
    context: {
        parsedInputs: [],
        // Defaults to workflow, can be overidden when interpreting the machine
        sourceType: 'workflow',
        unsupportedRequiredInputs: []
    },
    states: {
        cancelled: {
            type: 'final'
        },
        working: {
            initial: 'selectSource',
            on: {
                CANCEL: 'cancelled'
            },
            states: {
                selectSource: {
                    initial: 'selectType',
                    states: {
                        // Automatically transition to the proper sub-state based
                        // on what type of source was specified when interpreting
                        // the machine.
                        selectType: {
                            always: [
                                {
                                    target: 'workflowSource',
                                    // TODO: Possible to interpret this machine without setting
                                    // a source id. That's an unrecoverable error. What should we do there?
                                    cond: ({ sourceType, sourceWorkflowId }) =>
                                        sourceType === 'workflow' &&
                                        !!sourceWorkflowId
                                },
                                {
                                    target: 'taskSource',
                                    cond: ({ sourceType, sourceTaskId }) =>
                                        sourceType === 'task' && !!sourceTaskId
                                }
                            ]
                        },
                        workflowSource: {
                            initial: 'workflow',
                            states: {
                                workflow: {
                                    initial: 'loading',
                                    states: {
                                        loading: {
                                            invoke: {
                                                src: 'loadWorkflowVersions',
                                                onDone: {
                                                    target: 'select',
                                                    actions: [
                                                        'setWorkflowVersionOptions'
                                                    ]
                                                },
                                                onError: {
                                                    target: 'failedLoading',
                                                    actions: ['setError']
                                                }
                                            }
                                        },
                                        failedLoading: {
                                            on: {
                                                RETRY: 'loading'
                                            }
                                        },
                                        select: {
                                            on: {
                                                SELECT_WORKFLOW_VERSION: {
                                                    target: '#selectLaunchPlan',
                                                    actions: [
                                                        'setWorkflowVersion'
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                },
                                launchPlan: {
                                    id: 'selectLaunchPlan',
                                    initial: 'loading',
                                    states: {
                                        loading: {
                                            invoke: {
                                                src: 'loadLaunchPlans',
                                                onDone: {
                                                    target: 'select',
                                                    actions: [
                                                        'setLaunchPlanOptions'
                                                    ]
                                                },
                                                onError: {
                                                    target: 'failedLoading',
                                                    actions: ['setError']
                                                }
                                            }
                                        },
                                        failedLoading: {
                                            on: {
                                                RETRY: 'loading'
                                            }
                                        },
                                        select: {
                                            on: {
                                                SELECT_LAUNCH_PLAN: {
                                                    target: '#loadingInputs',
                                                    actions: ['setLaunchPlan']
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        taskSource: {
                            initial: 'loading',
                            states: {
                                loading: {
                                    invoke: {
                                        src: 'loadTaskVersions',
                                        onDone: {
                                            target: 'select',
                                            actions: ['setTaskVersionOptions']
                                        },
                                        onError: {
                                            target: 'failedLoading',
                                            actions: ['setError']
                                        }
                                    }
                                },
                                failedLoading: {
                                    on: {
                                        RETRY: 'loading'
                                    }
                                },
                                select: {
                                    on: {
                                        SELECT_TASK_VERSION: {
                                            target: '#loadingInputs',
                                            actions: ['setTaskVersion']
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                sourceSelected: {
                    on: {
                        SELECT_WORKFLOW_VERSION: {
                            // TODO: guard on sourceType
                            target: '#selectLaunchPlan'
                        },
                        SELECT_LAUNCH_PLAN: {
                            // TODO: guard on sourceType
                            target: '.loadingInputs'
                        },
                        SELECT_TASK_VERSION: {
                            // TODO: guard on sourceType
                            target: '.loadingInputs'
                        }
                    },
                    states: {
                        loadingInputs: {
                            id: 'loadingInputs',
                            invoke: {
                                src: 'loadInputs',
                                onDone: {
                                    target: 'enterInputs',
                                    actions: ['setInputs']
                                },
                                onError: {
                                    target: 'failedLoadingInputs',
                                    actions: ['setError']
                                }
                            }
                        },
                        failedLoadingInputs: {
                            on: {
                                RETRY: 'loadingInputs'
                            }
                        },
                        // Doesn't need any specific handlers, as the only way to get out
                        // of this state is selecting a different workflow/launch plan/task
                        unsupportedInputs: {
                            // TODO: We need logic to detect when to move into this state
                        },
                        enterInputs: {
                            states: {
                                working: {
                                    on: {
                                        SUBMIT: '#submit',
                                        VALIDATE: 'validating'
                                    }
                                },
                                validating: {
                                    invoke: {
                                        src: 'validate',
                                        onDone: 'working',
                                        onError: 'invalidInputs'
                                    }
                                },
                                invalidInputs: {
                                    id: 'invalidInputs',
                                    on: {
                                        VALIDATE: 'validating'
                                    }
                                }
                            }
                        },
                        submit: {
                            id: 'submit',
                            initial: 'validating',
                            states: {
                                validating: {
                                    invoke: {
                                        src: 'validate',
                                        onDone: {
                                            target: 'submitting'
                                        },
                                        onError: {
                                            target: '#invalidInputs',
                                            actions: ['setError']
                                        }
                                    }
                                },
                                submitting: {
                                    invoke: {
                                        src: 'submit',
                                        onDone: {
                                            target: 'succeeded',
                                            // TODO: Do we need this or can the consumer just listen to the `data` property of the machine?
                                            actions: ['setExecutionId']
                                        },
                                        onError: {
                                            target: 'failed',
                                            actions: ['setError']
                                        }
                                    }
                                },
                                failed: {
                                    on: {
                                        SUBMIT: 'submitting'
                                    }
                                },
                                succeeded: {
                                    type: 'final'
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export const flatLaunchMachine = Machine(flatLaunchMachineConfig, {
    actions: {
        setWorkflowVersion: assign((_, event) => ({
            // TODO: I don't love this casting :-/ but not sure there's a way
            // to maintain full type safety.
            workflowVersion: (event as SelectWorkflowVersionEvent).workflowId
        })),
        // TODO: When called via invoke.src, the payload gets wrapped in a `data` object.
        setWorkflowVersionOptions: assign((_, event) => ({
            workflowVersionOptions: (event as WorkflowVersionOptionsLoadedEvent)
                .workflows
        })),
        setTaskVersion: assign((_, event) => ({
            taskVersion: (event as SelectTaskVersionEvent).taskId
        })),
        setTaskVersionOptions: assign((_, event) => ({
            taskVersionOptions: (event as TaskVersionOptionsLoadedEvent).taskIds
        })),
        setLaunchPlanOptions: assign((_, event) => ({
            launchPlanOptions: (event as LaunchPlanOptionsLoadedEvent)
                .launchPlans
        })),
        setLaunchPlan: assign((_, event) => ({
            launchPlan: (event as SelectLaunchPlanEvent).launchPlan
        })),
        setExecutionId: assign((_, event) => ({
            resultExecutionId: (event as ExecutionCreatedEvent).executionId
        })),
        setInputs: assign((_, event) => {
            const {
                parsedInputs,
                unsupportedRequiredInputs
            } = event as InputsParsedEvent;
            return {
                parsedInputs,
                unsupportedRequiredInputs
            };
        }),
        setError: assign((_, event) => ({
            error: (event as ErrorEvent).error
        }))
    },
    services: {
        // TODO: Promise results here aren't typed, might get confusing when implementing these services in consumer
        loadWorkflowVersions: () =>
            Promise.reject(
                'No `loadWorkflowVersions` service has been provided'
            ),
        loadLaunchPlans: () =>
            Promise.reject('No `loadLaunchPlans` service has been provided'),
        loadTaskVersions: () =>
            Promise.reject('No `loadTaskVersions` service has been provided'),
        loadInputs: () =>
            Promise.reject('No `loadInputs` service has been provided'),
        submit: () => Promise.reject('No `submit` service has been provided'),
        validate: () =>
            Promise.reject('No `validate` service has been provided')
    }
});

export const launchMachine = Machine(launchMachineConfig, {
    actions: {
        setWorkflowVersion: assign((_, event) => ({
            // TODO: I don't love this casting :-/ but not sure there's a way
            // to maintain full type safety.
            workflowVersion: (event as SelectWorkflowVersionEvent).workflowId
        })),
        setWorkflowVersionOptions: assign((_, event) => ({
            workflowVersionOptions: (event as WorkflowVersionOptionsLoadedEvent)
                .workflows
        })),
        setTaskVersion: assign((_, event) => ({
            taskVersion: (event as SelectTaskVersionEvent).taskId
        })),
        setTaskVersionOptions: assign((_, event) => ({
            taskVersionOptions: (event as TaskVersionOptionsLoadedEvent).taskIds
        })),
        setLaunchPlanOptions: assign((_, event) => ({
            launchPlanOptions: (event as LaunchPlanOptionsLoadedEvent)
                .launchPlans
        })),
        setLaunchPlan: assign((_, event) => ({
            launchPlan: (event as SelectLaunchPlanEvent).launchPlan
        })),
        setExecutionId: assign((_, event) => ({
            resultExecutionId: (event as ExecutionCreatedEvent).executionId
        })),
        setInputs: assign((_, event) => {
            const {
                parsedInputs,
                unsupportedRequiredInputs
            } = event as InputsParsedEvent;
            return {
                parsedInputs,
                unsupportedRequiredInputs
            };
        }),
        setError: assign((_, event) => ({
            error: (event as ErrorEvent).error
        }))
    },
    services: {
        // TODO: Promise results here aren't typed, might get confusing when implementing these services in consumer
        loadWorkflowVersions: () =>
            Promise.reject(
                'No `loadWorkflowVersions` service has been provided'
            ),
        loadLaunchPlans: () =>
            Promise.reject('No `loadLaunchPlans` service has been provided'),
        loadTaskVersions: () =>
            Promise.reject('No `loadTaskVersions` service has been provided'),
        loadInputs: () =>
            Promise.reject('No `loadInputs` service has been provided'),
        submit: () => Promise.reject('No `submit` service has been provided'),
        validate: () =>
            Promise.reject('No `validate` service has been provided')
    }
});
