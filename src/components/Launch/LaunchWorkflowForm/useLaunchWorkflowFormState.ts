import { useMachine } from '@xstate/react';
import { getCacheKey } from 'components/Cache';
import { APIContextValue, useAPIContext } from 'components/data/apiContext';
import { partial, uniqBy } from 'lodash';
import {
    FilterOperationName,
    LaunchPlan,
    SortDirection,
    Workflow,
    WorkflowExecutionIdentifier,
    WorkflowId,
    workflowSortFields
} from 'models';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { history } from 'routes/history';
import { Routes } from 'routes/routes';
import { getInputs } from './getInputs';
import { createInputValueCache } from './inputValueCache';
import { LaunchContext, LaunchEvent, launchMachine } from './launchMachine';
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

async function loadWorkflowVersions(
    { listWorkflows }: APIContextValue,
    { preferredWorkflowId, sourceWorkflowName }: LaunchContext
) {
    if (!sourceWorkflowName) {
        throw new Error('Cannot load workflows, missing workflowName');
    }
    const { project, domain, name } = sourceWorkflowName;
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

async function loadInputs(
    { getWorkflow }: APIContextValue,
    { defaultInputValues, workflowVersion, launchPlan }: LaunchContext
) {
    // TODO: per-argument errors?
    if (!workflowVersion || !launchPlan) {
        throw new Error('Missing arguments attempting to load inputs');
    }
    const workflow = await getWorkflow(workflowVersion);
    const parsedInputs: ParsedInput[] = getInputs(
        workflow,
        launchPlan,
        defaultInputValues
    );

    return {
        parsedInputs: [],
        unsupportedRequiredInputs: getUnsupportedRequiredInputs(parsedInputs)
    };
}

async function validate(
    formInputsRef: RefObject<LaunchWorkflowFormInputsRef>,
    {}: LaunchContext
) {
    if (formInputsRef.current === null) {
        throw new Error('Unexpected empty form inputs ref');
    }

    if (!formInputsRef.current.validate()) {
        throw new Error(
            'Some inputs have errors. Please correct them before submitting'
        );
    }
}

async function submit(
    { createWorkflowExecution }: APIContextValue,
    formInputsRef: RefObject<LaunchWorkflowFormInputsRef>,
    { launchPlan, workflowVersion }: LaunchContext
) {
    if (!launchPlan) {
        throw new Error('Attempting to launch with no LaunchPlan');
    }
    if (!workflowVersion) {
        throw new Error('Attempting to launch with no Workflow version');
    }
    if (formInputsRef.current === null) {
        throw new Error('Unexpected empty form inputs ref');
    }
    const literals = formInputsRef.current.getValues();
    const launchPlanId = launchPlan.id;
    const { domain, project } = workflowVersion;

    const response = await createWorkflowExecution({
        domain,
        launchPlanId,
        project,
        inputs: { literals }
    });
    const newExecutionId = response.id as WorkflowExecutionIdentifier;
    if (!newExecutionId) {
        throw new Error('API Response did not include new execution id');
    }

    return newExecutionId;
}

function getServices(
    apiContext: APIContextValue,
    formInputsRef: RefObject<LaunchWorkflowFormInputsRef>
) {
    return {
        loadWorkflowVersions: partial(loadWorkflowVersions, apiContext),
        loadLaunchPlans: partial(loadLaunchPlans, apiContext),
        loadInputs: partial(loadInputs, apiContext),
        submit: partial(submit, apiContext, formInputsRef),
        validate: partial(validate, formInputsRef)
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
        workflow: preferredWorkflowId,
        values: defaultInputValues
    } = initialParameters;

    const workflowName = sourceWorkflowId.name;
    const apiContext = useAPIContext();
    const [inputValueCache] = useState(createInputValueCache());
    const formInputsRef = useRef<LaunchWorkflowFormInputsRef>(null);

    const [state, sendEvent, service] = useMachine<LaunchContext, LaunchEvent>(
        launchMachine,
        {
            // TODO: Question: Does this replace or merge with the default context?
            // If replace, we would need a default empty value for the inputs arrays
            context: {
                defaultInputValues,
                preferredLaunchPlanId,
                preferredWorkflowId,
                // TODO: This can only be set once, so we currently would have to force
                // re-initialization of the form if the workflowId changes.
                sourceWorkflowName: sourceWorkflowId,
                sourceType: 'workflow'
            },
            devTools: true, // TODO: Needs to be based on a common global machine config
            services: useMemo(() => getServices(apiContext, formInputsRef), [
                apiContext,
                formInputsRef
            ])
        }
    );

    const {
        launchPlanOptions = [],
        launchPlan,
        workflowVersionOptions = [],
        parsedInputs,
        unsupportedRequiredInputs,
        workflowVersion
    } = state.context;

    const [
        lastSelectedLaunchPlanName,
        setLastSelectedLaunchPlanName
    ] = useState<string>();
    const [showErrors, setShowErrors] = useState(false);

    const workflowSelectorOptions = useWorkflowSelectorOptions(
        workflowVersionOptions
    );
    const [selectedWorkflow, setSelectedWorkflow] = useState<
        SearchableSelectorOption<WorkflowId>
    >();

    const launchPlanSelectorOptions = useLaunchPlanSelectorOptions(
        launchPlanOptions
    );
    const [selectedLaunchPlan, setSelectedLaunchPlan] = useState<
        SearchableSelectorOption<LaunchPlan>
    >();

    // Any time the inputs change (even if it's just re-ordering), we must
    // change the form key so that the inputs component will re-mount.
    const formKey = useMemo<string>(() => {
        if (!workflowVersion || !launchPlan) {
            return '';
        }
        return getCacheKey(parsedInputs);
    }, [parsedInputs]);

    // Only show errors after first submission for a set of inputs.
    useEffect(() => setShowErrors(false), [formKey]);

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

    // TODO: Subscribe to state transitions, navigate away on final submit state.

    const onSubmit = () => {
        // Show errors after the first submission
        setShowErrors(true);
        sendEvent({ type: 'SUBMIT' });
    };
    const onCancel = () => {
        sendEvent({ type: 'CANCEL' });
        onClose();
    };

    useEffect(() => {
        const subscription = service.subscribe(state => {
            // TODO: Handle selecting default workflow and launch plan in a similar manner using code below
            if (state.matches({ submit: 'submitSucceeded' })) {
                history.push(
                    Routes.ExecutionDetails.makeUrl(
                        state.context.resultExecutionId
                    )
                );
            }
        });

        return subscription.unsubscribe;
    }, [service]);

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
        launchPlanSelectorOptions,
        onCancel,
        onSelectLaunchPlan,
        onSelectWorkflow,
        onSubmit,
        selectedLaunchPlan,
        selectedWorkflow,
        showErrors,
        unsupportedRequiredInputs,
        workflowName,
        workflowSelectorOptions,
        inputs: parsedInputs
    };
}
