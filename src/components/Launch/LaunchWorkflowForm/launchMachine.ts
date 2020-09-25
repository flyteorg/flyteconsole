import {
    Identifier,
    LaunchPlan,
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
    workflowIds: WorkflowId[];
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
    inputs: ParsedInput[];
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
    error?: Error;
    workflowVersion?: WorkflowId;
    workflowVersionOptions?: WorkflowId[];
    taskVersion?: Identifier;
    taskVersionOptions?: Identifier[];
}

/* TODO

* Should we move all of the state into context here?
  * When are machines disposed? Will the memory be released?
* Need state management for parsing inputs
* Would be nice to pass all async fetching as a service object of some sort, or apiContext, so that mocking everything
  * for machines is simpler.
* Is it common to write tests for machines? Worried about testing large machines that leverage smaller sub-machines. Do we mock the nested machines?
* We could leverage child machines for async activities. At the very least we need passed-in services for the following:
  * Loading workflows
  * Loading launch plans
  * Loading selected workflow
  * Loading selected task?
  * Parsing inputs from workflow/launch plan
    * Should we do this as part of the sub-states for selection and have those nested machines return the inputs when done?
  * Parsing inputs from task
    * Same question as above about parsing inputs at end of selection machine
*/

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
                                    cond: ({ sourceType }) =>
                                        sourceType === 'workflow'
                                },
                                {
                                    target: 'taskSelected',
                                    cond: ({ sourceType }) =>
                                        sourceType === 'task'
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
                        unsupportedInputs: {},
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
                .workflowIds
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
        setInputs: assign((_, event) => ({
            parsedInputs: (event as InputsParsedEvent).inputs
        })),
        setError: assign((_, event) => ({
            error: (event as ErrorEvent).error
        }))
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
        submit: () => Promise.reject('No `submit` service has been provided')
    }
});
