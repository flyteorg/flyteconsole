import { useMachine } from '@xstate/react';
import { getCacheKey } from 'components/Cache';
import { APIContextValue, useAPIContext } from 'components/data/apiContext';
import { useFetchableData, useWorkflow } from 'components/hooks';
import { fetchStates } from 'components/hooks/types';
import { isEqual, partial, uniqBy } from 'lodash';
import {
    FilterOperationName,
    Identifier,
    LaunchPlan,
    NamedEntityIdentifier,
    SortDirection,
    Workflow,
    WorkflowExecutionIdentifier,
    WorkflowId,
    workflowSortFields
} from 'models';
import { useEffect, useMemo, useRef, useState } from 'react';
import { history, Routes } from 'routes';
import { getInputs } from './getInputs';
import { createInputValueCache } from './inputValueCache';
import { LaunchContext, launchMachine } from './launchMachine';
import { SearchableSelectorOption } from './SearchableSelector';
import {
    LaunchWorkflowFormInputsRef,
    LaunchWorkflowFormProps,
    LaunchWorkflowFormState,
    ParsedInput
} from './types';
import {
    getUnsupportedRequiredInputs,
    launchPlansToSearchableSelectorOptions,
    workflowsToSearchableSelectorOptions
} from './utils';

export function useWorkflowSelectorOptions(workflows: Workflow[]) {
    return useMemo(() => {
        const options = workflowsToSearchableSelectorOptions(workflows);
        if (options.length > 0) {
            options[0].description = 'latest';
        }
        return options;
    }, [workflows]);
}

function useLaunchPlanSelectorOptions(launchPlans: LaunchPlan[]) {
    return useMemo(() => launchPlansToSearchableSelectorOptions(launchPlans), [
        launchPlans
    ]);
}

async function loadLaunchPlans(
    { listLaunchPlans }: APIContextValue,
    { preferredLaunchPlanId, workflowVersion }: LaunchContext
) {
    if (workflowVersion == null) {
        return Promise.reject('No workflowVersion specified');
    }

    let preferredLaunchPlanPromise = Promise.resolve({
        entities: [] as LaunchPlan[]
    });
    if (preferredLaunchPlanId) {
        const { version, ...scope } = preferredLaunchPlanId;
        preferredLaunchPlanPromise = listLaunchPlans(scope, {
            limit: 1,
            filter: [
                {
                    key: 'version',
                    operation: FilterOperationName.EQ,
                    value: version
                }
            ]
        });
    }

    const { project, domain, name, version } = workflowVersion;
    const launchPlansPromise = listLaunchPlans(
        { project, domain },
        // TODO: Only active?
        {
            filter: [
                {
                    key: 'workflow.name',
                    operation: FilterOperationName.EQ,
                    value: name
                },
                {
                    key: 'workflow.version',
                    operation: FilterOperationName.EQ,
                    value: version
                }
            ],
            limit: 10
        }
    );

    const [launchPlansResult, preferredLaunchPlanResult] = await Promise.all([
        launchPlansPromise,
        preferredLaunchPlanPromise
    ]);
    const merged = [
        ...launchPlansResult.entities,
        ...preferredLaunchPlanResult.entities
    ];
    return { launchPlans: uniqBy(merged, ({ id }) => id.name) };
}

interface UseLaunchPlansForWorkflowArgs {
    workflowId?: WorkflowId | null;
    preferredLaunchPlanId?: Identifier;
}
/** Lists launch plans for a given workflowId, optionally fetching a preferred
 * launch plan. The result is a merged, de-duplicated list.
 */
function useLaunchPlansForWorkflow({
    workflowId = null,
    preferredLaunchPlanId
}: UseLaunchPlansForWorkflowArgs) {
    const { listLaunchPlans } = useAPIContext();
    return useFetchableData<LaunchPlan[], WorkflowId | null>(
        {
            autoFetch: workflowId !== null,
            debugName: 'useLaunchPlansForWorkflow',
            defaultValue: [],
            doFetch: async workflowId => {
                if (workflowId === null) {
                    return Promise.reject('No workflowId specified');
                }

                let preferredLaunchPlanPromise = Promise.resolve({
                    entities: [] as LaunchPlan[]
                });
                if (preferredLaunchPlanId) {
                    const { version, ...scope } = preferredLaunchPlanId;
                    preferredLaunchPlanPromise = listLaunchPlans(scope, {
                        limit: 1,
                        filter: [
                            {
                                key: 'version',
                                operation: FilterOperationName.EQ,
                                value: version
                            }
                        ]
                    });
                }

                const { project, domain, name, version } = workflowId;
                const launchPlansPromise = listLaunchPlans(
                    { project, domain },
                    // TODO: Only active?
                    {
                        filter: [
                            {
                                key: 'workflow.name',
                                operation: FilterOperationName.EQ,
                                value: name
                            },
                            {
                                key: 'workflow.version',
                                operation: FilterOperationName.EQ,
                                value: version
                            }
                        ],
                        limit: 10
                    }
                );

                const [
                    launchPlansResult,
                    preferredLaunchPlanResult
                ] = await Promise.all([
                    launchPlansPromise,
                    preferredLaunchPlanPromise
                ]);
                const merged = [
                    ...launchPlansResult.entities,
                    ...preferredLaunchPlanResult.entities
                ];
                return uniqBy(merged, ({ id }) => id.name);
            }
        },
        workflowId
    );
}

async function loadWorkflowVersions(
    { listWorkflows }: APIContextValue,
    { preferredWorkflowId, workflowName }: LaunchContext
) {
    if (!workflowName) {
        throw new Error('Cannot load workflows, missing workflowName');
    }
    const { project, domain, name } = workflowName;
    const workflowsPromise = listWorkflows(
        { project, domain, name },
        {
            limit: 10,
            sort: {
                key: workflowSortFields.createdAt,
                direction: SortDirection.DESCENDING
            }
        }
    );

    let preferredWorkflowPromise = Promise.resolve({
        entities: [] as Workflow[]
    });
    if (preferredWorkflowId) {
        const { version, ...scope } = preferredWorkflowId;
        preferredWorkflowPromise = listWorkflows(scope, {
            limit: 1,
            filter: [
                {
                    key: 'version',
                    operation: FilterOperationName.EQ,
                    value: version
                }
            ]
        });
    }

    const [workflowsResult, preferredWorkflowResult] = await Promise.all([
        workflowsPromise,
        preferredWorkflowPromise
    ]);
    const merged = [
        ...workflowsResult.entities,
        ...preferredWorkflowResult.entities
    ];
    return { workflows: uniqBy(merged, ({ id: { version } }) => version) };
}

/** Fetches workflow versions matching a specific scope, optionally also
 * fetching a preferred version. The result is a merged, de-duplicated list.
 */
function useWorkflowsWithPreferredVersion(
    workflowName: NamedEntityIdentifier,
    preferredVersion?: WorkflowId
) {
    const { listWorkflows } = useAPIContext();
    return useFetchableData(
        {
            debugName: 'UseWorkflowsWithPreferredVersion',
            defaultValue: [] as Workflow[],
            doFetch: async () => {
                const { project, domain, name } = workflowName;
                const workflowsPromise = listWorkflows(
                    { project, domain, name },
                    {
                        limit: 10,
                        sort: {
                            key: workflowSortFields.createdAt,
                            direction: SortDirection.DESCENDING
                        }
                    }
                );

                let preferredWorkflowPromise = Promise.resolve({
                    entities: [] as Workflow[]
                });
                if (preferredVersion) {
                    const { version, ...scope } = preferredVersion;
                    preferredWorkflowPromise = listWorkflows(scope, {
                        limit: 1,
                        filter: [
                            {
                                key: 'version',
                                operation: FilterOperationName.EQ,
                                value: version
                            }
                        ]
                    });
                }

                const [
                    workflowsResult,
                    preferredWorkflowResult
                ] = await Promise.all([
                    workflowsPromise,
                    preferredWorkflowPromise
                ]);
                const merged = [
                    ...workflowsResult.entities,
                    ...preferredWorkflowResult.entities
                ];
                return uniqBy(merged, ({ id: { version } }) => version);
            }
        },
        { workflowName, preferredVersion }
    );
}

async function loadInputs(
    { getWorkflow }: APIContextValue,
    { workflowVersion, launchPlan }: LaunchContext
) {
    // TODO: per-argument errors?
    if (!workflowVersion || !launchPlan) {
        throw new Error('Missing arguments attempting to load inputs');
    }
    const workflow = await getWorkflow(workflowVersion);
    const parsedInputs: ParsedInput[] = getInputs(
        workflow,
        launchPlan,
        initialParameters.values
    );

    return {
        parsedInputs: [],
        unsupportedRequiredInputs: getUnsupportedRequiredInputs(parsedInputs)
    };
}

async function validate({}: LaunchContext) {
    throw new Error('Not Implemented');
    if (formInputsRef.current === null) {
        console.error('Unexpected empty form inputs ref');
        return;
    }
    // TODO: Do the validation here.
}

async function submit(apiContext: APIContextValue, {}: LaunchContext) {
    throw new Error('Not Implemented');

    // if (!launchPlanData) {
    //     throw new Error('Attempting to launch with no LaunchPlan');
    // }
    // if (formInputsRef.current === null) {
    //     throw new Error('Unexpected empty form inputs ref');
    // }
    // const literals = formInputsRef.current.getValues();
    // const launchPlanId = launchPlanData.id;
    // const { domain, project } = workflowId;

    // const response = await createWorkflowExecution({
    //     domain,
    //     launchPlanId,
    //     project,
    //     inputs: { literals }
    // });
    // const newExecutionId = response.id as WorkflowExecutionIdentifier;
    // if (!newExecutionId) {
    //     throw new Error('API Response did not include new execution id');
    // }
    // history.push(Routes.ExecutionDetails.makeUrl(newExecutionId));
    // return newExecutionId;
}

function getServices(apiContext: APIContextValue) {
    return {
        validate,
        loadWorkflowVersions: partial(loadWorkflowVersions, apiContext),
        loadLaunchPlans: partial(loadLaunchPlans, apiContext),
        loadInputs: partial(loadInputs, apiContext),
        submit: partial(submit, apiContext)
    };
}

/** Contains all of the form state for a LaunchWorkflowForm, including input
 * definitions, current input values, and errors.
 */
export function useLaunchWorkflowFormState({
    initialParameters = {},
    onClose,
    workflowId: sourceWorkflowId
}: LaunchWorkflowFormProps): LaunchWorkflowFormState {
    // These values will be used to auto-select items from the workflow
    // version/launch plan drop downs.
    const {
        launchPlan: preferredLaunchPlanId,
        workflow: preferredWorkflowId
    } = initialParameters;

    const workflowName = sourceWorkflowId.name;
    const apiContext = useAPIContext();
    const [inputValueCache] = useState(createInputValueCache());

    const [state, sendEvent] = useMachine(launchMachine, {
        context: {
            preferredLaunchPlanId,
            preferredWorkflowId,
            // TODO: This can only be set once, so we currently would have to force
            // re-initialization of the form if the workflowId changes.
            sourceWorkflowId,
            sourceType: 'workflow'
        },
        devTools: true, // TODO: Needs to be based on a common global machine config
        services: useMemo(() => getServices(apiContext), [apiContext])
    });

    const {
        launchPlanOptions = [],
        launchPlan,
        workflowVersionOptions = [],
        parsedInputs,
        workflowVersion
    } = state.context;

    const [
        lastSelectedLaunchPlanName,
        setLastSelectedLaunchPlanName
    ] = useState<string>();
    const formInputsRef = useRef<LaunchWorkflowFormInputsRef>(null);
    const [showErrors, setShowErrors] = useState(false);

    const workflowSelectorOptions = useWorkflowSelectorOptions(
        workflowVersionOptions
    );

    const [selectedWorkflow, setSelectedWorkflow] = useState<
        SearchableSelectorOption<WorkflowId>
    >();

    // We have to do a single item get once a workflow is selected so that we
    // receive the full workflow spec

    // TODO: Only need this in loading inputs, do it there.
    // const workflow = useWorkflow(selectedWorkflowId);

    const launchPlanSelectorOptions = useLaunchPlanSelectorOptions(
        launchPlanOptions
    );

    const [selectedLaunchPlan, setSelectedLaunchPlan] = useState<
        SearchableSelectorOption<LaunchPlan>
    >();

    // TODO: Move to component, use state matching instead.
    // const inputsReady = !!(
    //     launchPlanData && workflow.state.matches(fetchStates.LOADED)
    // );

    // Any time the inputs change (even if it's just re-ordering), we must
    // change the form key so that the inputs component will re-mount.
    const formKey = useMemo<string>(() => {
        if (!workflowVersion || !launchPlan) {
            return '';
        }
        return getCacheKey(parsedInputs);
    }, [parsedInputs]);

    // Only show errors after first submission for a set of inputs.
    // TODO: Move this to state machine, reset showErrors whenever we transition into loading inputs
    useEffect(() => setShowErrors(false), [formKey]);

    // const workflowName = workflowId.name;

    const onSelectWorkflow = (
        newWorkflow: SearchableSelectorOption<WorkflowId>
    ) => {
        if (newWorkflow === selectedWorkflow) {
            return;
        }
        setSelectedLaunchPlan(undefined);
        setSelectedWorkflow(newWorkflow);
        sendEvent({
            type: 'SELECT_WORKFLOW_VERSION',
            workflowId: newWorkflow.data
        });
    };

    const onSelectLaunchPlan = (
        newLaunchPlan: SearchableSelectorOption<LaunchPlan>
    ) => {
        if (newLaunchPlan === selectedLaunchPlan) {
            return;
        }
        setLastSelectedLaunchPlanName(newLaunchPlan.name);
        setSelectedLaunchPlan(newLaunchPlan);
        sendEvent({
            type: 'SELECT_LAUNCH_PLAN',
            launchPlan: newLaunchPlan.data
        });
    };

    const launchWorkflow = async () => {
        // TODO: sendEvent({type: 'SUBMIT'})
        // then do we actually need this to be async or will the form behave just fine based on the state value?
    };

    // TODO: Don't think we need this, but we do need to react to the state transition to success and
    // navigate away.

    // const submissionState = useFetchableData<
    //     WorkflowExecutionIdentifier,
    //     string
    // >(
    //     {
    //         autoFetch: false,
    //         debugName: 'LaunchWorkflowForm',
    //         defaultValue: {} as WorkflowExecutionIdentifier,
    //         doFetch: launchWorkflow
    //     },
    //     formKey
    // );

    const onSubmit = () => {
        // Show errors after the first submission
        setShowErrors(true);

        // TODO: We need a validate service, and we can remove this validate, the machine will call us.
        sendEvent({ type: 'SUBMIT' });
    };
    const onCancel = () => {
        sendEvent({ type: 'CANCEL' });
        onClose();
    };

    // TODO: Two options here:
    // Thought: If we're storing preferred ids in the machine, does it make sense to keep the logic there so it always
    // does that when using the machine?
    // 1: Do it with logic in the state machine
    // When entering the selectLaunchPlan state, check for a preferred launch plan
    // and attempt to send the event to select it. (catch: we manage the selector state
    // separately in this hook, so we would need to move it into the machine or
    // update how we determine the currently selected item to base it off the value from the machine)
    // 2: Use subscriptions, watch for state change here. If it's the workflows loaded event,
    // then see if we can do a selectLaunchPlan here

    // Once workflows have loaded, attempt to select the preferred workflow
    // plan, or fall back to selecting the first option
    // useEffect(() => {
    //     if (workflowSelectorOptions.length > 0 && !selectedWorkflow) {
    //         if (preferredWorkflowId) {
    //             const preferred = workflowSelectorOptions.find(({ data }) =>
    //                 isEqual(data, preferredWorkflowId)
    //             );
    //             if (preferred) {
    //                 setWorkflow(preferred);
    //                 return;
    //             }
    //         }
    //         setWorkflow(workflowSelectorOptions[0]);
    //     }
    // }, [state.matches('')]);

    // TODO: Similar to above, pick one of two options for maintaining this functionality.

    // Once launch plans have been loaded, attempt to keep the previously
    // selected launch plan, followed by the preferred launch plan, the one
    // matching the workflow name, or just the first option.
    // useEffect(() => {
    //     if (!launchPlanSelectorOptions.length) {
    //         return;
    //     }

    //     if (lastSelectedLaunchPlanName) {
    //         const lastSelected = launchPlanSelectorOptions.find(
    //             ({ name }) => name === lastSelectedLaunchPlanName
    //         );
    //         if (lastSelected) {
    //             onSelectLaunchPlan(lastSelected);
    //             return;
    //         }
    //     }

    //     if (preferredLaunchPlanId) {
    //         const preferred = launchPlanSelectorOptions.find(
    //             ({ data: { id } }) => isEqual(id, preferredLaunchPlanId)
    //         );
    //         if (preferred) {
    //             onSelectLaunchPlan(preferred);
    //             return;
    //         }
    //     }

    //     const defaultLaunchPlan = launchPlanSelectorOptions.find(
    //         ({ id }) => id === sourceWorkflowId.name
    //     );
    //     if (defaultLaunchPlan) {
    //         onSelectLaunchPlan(defaultLaunchPlan);
    //         return;
    //     }
    //     onSelectLaunchPlan(launchPlanSelectorOptions[0]);
    // }, [launchPlanSelectorOptions]);

    return {
        formInputsRef,
        formKey,
        inputValueCache,
        launchPlans,
        launchPlanSelectorOptions,
        onCancel,
        onSelectLaunchPlan,
        onSelectWorkflow,
        onSubmit,
        selectedLaunchPlan,
        selectedWorkflow,
        showErrors,
        submissionState,
        unsupportedRequiredInputs,
        workflowName,
        workflows,
        workflowSelectorOptions,
        inputs: parsedInputs
    };
}
