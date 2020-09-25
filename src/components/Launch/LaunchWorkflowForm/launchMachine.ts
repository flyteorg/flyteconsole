import {
    Identifier,
    LaunchPlan,
    NamedEntityIdentifier,
    Workflow,
    WorkflowExecutionIdentifier,
    WorkflowId
} from 'models';
import { assign, Machine, MachineConfig } from 'xstate';
import { ParsedInput } from './types';

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
    unsupportedRequiredInputs?: ParsedInput[];
}

export interface LaunchSchema {
    states: {
        cancelled: {};
        working: {
            states: {
                selectSource: {
                    states: {
                        selectType: {};
                        workflowSelected: {
                            states: {
                                loadingWorkflowVersions: {};
                                failedLoadingWorkflowVersions: {};
                                selectVersion: {};
                                loadingLaunchPlans: {};
                                failedLoadingLaunchPlans: {};
                                selectLaunchPlan: {};
                            };
                        };
                        taskSelected: {
                            states: {
                                loadingTaskVersions: {};
                                failedLoadingTaskVersions: {};
                                selectVersion: {};
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
                                submitFailed: {};
                                submitSucceeded: {};
                            };
                        };
                    };
                };
            };
        };
    };
}

// TODO: Handle transitionless events for setting:
// * preferred workflow version / launch plan

const launchMachineConfig: MachineConfig<
    LaunchContext,
    LaunchSchema,
    LaunchEvent
> = {
    id: 'launch',
    initial: 'working',
    context: {
        parsedInputs: [],
        // Defaults to workflow, can be overidden when interpreting the machine
        sourceType: 'workflow'
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
                    states: {
                        // Automatically transition to the proper sub-state based
                        // on what type of source was specified when interpreting
                        // the machine.
                        selectType: {
                            always: [
                                {
                                    target: 'workflowSelected',
                                    // TODO: Possible to interpret this machine without setting
                                    // a source id. That's an unrecoverable error. What should we do there?
                                    cond: ({ sourceType, sourceWorkflowId }) =>
                                        sourceType === 'workflow' &&
                                        !!sourceWorkflowId
                                },
                                {
                                    target: 'taskSelected',
                                    cond: ({ sourceType, sourceTaskId }) =>
                                        sourceType === 'task' && !!sourceTaskId
                                }
                            ]
                        },
                        workflowSelected: {
                            initial: 'loadingWorkflowVersions',
                            states: {
                                loadingWorkflowVersions: {
                                    invoke: {
                                        src: 'loadWorkflowVersions',
                                        onDone: {
                                            target: 'loadingLaunchPlans',
                                            actions: ['setWorkflowOptions']
                                        },
                                        onError: {
                                            target:
                                                'failedLoadingWorkflowVersions',
                                            actions: ['setError']
                                        }
                                    }
                                },
                                failedLoadingWorkflowVersions: {
                                    on: {
                                        RETRY: 'loadingWorkflowVersions'
                                    }
                                },
                                selectVersion: {
                                    // todo: handle preferred version
                                    on: {
                                        SELECT_WORKFLOW_VERSION: {
                                            target: 'loadingLaunchPlans',
                                            actions: ['setWorkflowVersion']
                                        }
                                    }
                                },
                                loadingLaunchPlans: {
                                    id: '#loadingLaunchPlans',
                                    invoke: {
                                        src: 'loadLaunchPlans',
                                        onDone: {
                                            target: 'selectLaunchPlan',
                                            actions: ['setLaunchPlanOptions']
                                        },
                                        onError: {
                                            target: 'failedLoadingLaunchPlans',
                                            actions: ['setError']
                                        }
                                    }
                                },
                                failedLoadingLaunchPlans: {
                                    on: {
                                        RETRY: 'loadingLaunchPlans'
                                    }
                                },
                                selectLaunchPlan: {
                                    // todo: handle preferred launch plan
                                    on: {
                                        SELECT_LAUNCH_PLAN: {
                                            target: '#loadingInputs',
                                            actions: ['setLaunchPlan']
                                        }
                                    }
                                }
                            }
                        },
                        taskSelected: {
                            initial: 'loadingTaskVersions',
                            states: {
                                loadingTaskVersions: {
                                    invoke: {
                                        src: 'loadTaskVersions',
                                        onDone: {
                                            target: 'selectVersion',
                                            actions: ['setTaskVersionOptions']
                                        },
                                        onError: {
                                            target: 'failedLoadingTaskVersions',
                                            actions: ['setError']
                                        }
                                    }
                                },
                                failedLoadingTaskVersions: {
                                    on: {
                                        RETRY: 'loadingTaskVersions'
                                    }
                                },
                                selectVersion: {
                                    // todo: handle preferred version
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
                            target: '#loadingLaunchPlans'
                        },
                        SELECT_LAUNCH_PLAN: {
                            // TODO: guard on sourceType
                            target: '#loadingInputs'
                        },
                        SELECT_TASK_VERSION: {
                            // TODO: guard on sourceType
                            target: '#loadingInputs'
                        }
                    },
                    states: {
                        loadingInputs: {
                            id: '#loadingInputs',
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
                                            target: 'submitSucceeded',
                                            // TODO: Do we need this or can the consumer just listen to the `data` property of the machine?
                                            actions: ['setExecutionId']
                                        },
                                        onError: {
                                            target: 'submitFailed',
                                            actions: ['setError']
                                        }
                                    }
                                },
                                submitFailed: {
                                    on: {
                                        SUBMIT: 'submitting'
                                    }
                                },
                                submitSucceeded: {
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
