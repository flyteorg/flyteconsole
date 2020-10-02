import {
    Identifier,
    LaunchPlan,
    NamedEntityIdentifier,
    Workflow,
    WorkflowExecutionIdentifier,
    WorkflowId
} from 'models';
import { assign, DoneInvokeEvent, Machine, MachineConfig } from 'xstate';
import { LiteralValueMap, ParsedInput } from './types';

export type SelectWorkflowVersionEvent = {
    type: 'SELECT_WORKFLOW_VERSION';
    workflowId: WorkflowId;
};
export type SelectTaskVersionEvent = {
    type: 'SELECT_TASK_VERSION';
    taskId: Identifier;
};
export type SelectLaunchPlanEvent = {
    type: 'SELECT_LAUNCH_PLAN';
    launchPlan: LaunchPlan;
};
export type WorkflowVersionOptionsLoadedEvent = DoneInvokeEvent<Workflow[]>;
export type LaunchPlanOptionsLoadedEvent = DoneInvokeEvent<LaunchPlan[]>;
export type TaskVersionOptionsLoadedEvent = DoneInvokeEvent<Identifier[]>;
export type ExecutionCreatedEvent = DoneInvokeEvent<
    WorkflowExecutionIdentifier
>;
export type InputsParsedEvent = DoneInvokeEvent<{
    parsedInputs: ParsedInput[];
    unsupportedRequiredInputs?: ParsedInput[];
}>;
export type ErrorEvent = DoneInvokeEvent<Error>;

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

export interface LaunchSchema {
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

/** Typestates to narrow down the `context` values based on the result of
 * a `state.matches` check.
 */
export type LaunchTypestate =
    | {
          value: LaunchState;
          context: LaunchContext;
      }
    | {
          value: LaunchState.SELECT_WORKFLOW_VERSION;
          context: LaunchContext & {
              sourceWorkflowId: WorkflowId;
              workflowVersionOptions: Workflow[];
          };
      }
    | {
          value: LaunchState.SELECT_LAUNCH_PLAN;
          context: LaunchContext & {
              launchPlanOptions: LaunchPlan[];
              sourceWorkflowId: WorkflowId;
              workflowVersionOptions: Workflow[];
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

/** A state machine config representing the flow a user takes through the Launch form.
 * The high-level steps are:
 * 1. Choose a source type. This is usually done automatically by specifying the
 *    source type in context when interpreting the machine.
 * 2. Select the relevant parameters for the source (version/launch plan for a Workflow source)
 * 3. Enter inputs
 * 4. Submit
 * 5. Optionally correct any validation errors and re-submit.
 */
export const launchMachineConfig: MachineConfig<
    LaunchContext,
    LaunchSchema,
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
            cond: { type: 'isWorkflowSource' },
            target: LaunchState.LOADING_LAUNCH_PLANS,
            actions: ['setWorkflowVersion']
        },
        SELECT_LAUNCH_PLAN: {
            cond: { type: 'isWorkflowSource' },
            target: LaunchState.LOADING_INPUTS,
            actions: ['setLaunchPlan']
        },
        SELECT_TASK_VERSION: {
            cond: { type: 'isTaskSource' },
            target: LaunchState.LOADING_INPUTS,
            actions: ['setTaskVersion']
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
            // Events handled at top level
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
            // events handled at top level
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
            // events handled at top level
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
            // events handled at top level
        },
        [LaunchState.ENTER_INPUTS]: {
            always: {
                target: LaunchState.UNSUPPORTED_INPUTS,
                cond: ({ unsupportedRequiredInputs }) =>
                    unsupportedRequiredInputs.length > 0
            },
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

/** A full machine for representing the Launch flow, combining the state definitions
 * with actions/guards/services needed to support them.
 */
export const launchMachine = Machine(launchMachineConfig, {
    actions: {
        setWorkflowVersion: assign((_, event) => ({
            workflowVersion: (event as SelectWorkflowVersionEvent).workflowId
        })),
        setWorkflowVersionOptions: assign((_, event) => ({
            workflowVersionOptions: (event as DoneInvokeEvent<Workflow[]>).data
        })),
        setTaskVersion: assign((_, event) => ({
            taskVersion: (event as SelectTaskVersionEvent).taskId
        })),
        setTaskVersionOptions: assign((_, event) => ({
            taskVersionOptions: (event as TaskVersionOptionsLoadedEvent).data
        })),
        setLaunchPlanOptions: assign((_, event) => ({
            launchPlanOptions: (event as LaunchPlanOptionsLoadedEvent).data
        })),
        setLaunchPlan: assign((_, event) => ({
            launchPlan: (event as SelectLaunchPlanEvent).launchPlan
        })),
        setExecutionId: assign((_, event) => ({
            resultExecutionId: (event as ExecutionCreatedEvent).data
        })),
        setInputs: assign((_, event) => {
            const {
                parsedInputs,
                unsupportedRequiredInputs
            } = (event as InputsParsedEvent).data;
            return {
                parsedInputs,
                unsupportedRequiredInputs
            };
        }),
        setError: assign((_, event) => ({
            error: (event as ErrorEvent).data
        }))
    },
    guards: {
        isTaskSource: ({ sourceType }) => sourceType === 'task',
        isWorkflowSource: ({ sourceType }) => sourceType === 'workflow'
    },
    services: {
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
