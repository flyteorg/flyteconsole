import { useMachine } from '@xstate/react';
import { getCacheKey } from 'components/Cache';
import { APIContextValue, useAPIContext } from 'components/data/apiContext';
import { isEqual, partial, uniqBy } from 'lodash';
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
import {
    LaunchContext,
    LaunchEvent,
    launchMachine,
    LaunchTypestate
} from './launchMachine';
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
    const [showErrors, setShowErrors] = useState(false);

    const [state, sendEvent, service] = useMachine<
        LaunchContext,
        LaunchEvent,
        LaunchTypestate
    >(launchMachine, {
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
    });

    const {
        launchPlanOptions = [],
        launchPlan,
        workflowVersionOptions = [],
        parsedInputs,
        unsupportedRequiredInputs,
        workflowVersion
    } = state.context;

    const workflowSelectorOptions = useWorkflowSelectorOptions(
        workflowVersionOptions
    );
    const launchPlanSelectorOptions = useLaunchPlanSelectorOptions(
        launchPlanOptions
    );

    const selectedWorkflow = useMemo(() => {
        if (!workflowVersion) {
            return undefined;
        }
        return workflowSelectorOptions.find(
            option => option.id === workflowVersion.version
        );
    }, [workflowVersion, workflowVersionOptions]);

    const selectedLaunchPlan = useMemo(() => {
        if (!launchPlan) {
            return undefined;
        }
        return launchPlanSelectorOptions.find(
            option => option.id === launchPlan.id.name
        );
    }, [launchPlan, launchPlanOptions]);

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
        sendEvent({
            type: 'SELECT_LAUNCH_PLAN',
            launchPlan: newLaunchPlan.data
        });
    };

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
            // On transition to final success state, read the resulting execution
            // id and navigate to the Execution Details page.
            if (state.matches({ submit: 'succeeded' })) {
                history.push(
                    Routes.ExecutionDetails.makeUrl(
                        state.context.resultExecutionId
                    )
                );
            }

            if (state.matches({ workflow: 'select' })) {
                const {
                    workflowVersionOptions,
                    preferredWorkflowId
                } = state.context;
                if (workflowVersionOptions.length > 0) {
                    let workflowToSelect = workflowVersionOptions[0];
                    if (preferredWorkflowId) {
                        const preferred = workflowVersionOptions.find(
                            ({ id }) => isEqual(id, preferredWorkflowId)
                        );
                        if (preferred) {
                            workflowToSelect = preferred;
                        }
                    }
                    service.send({
                        type: 'SELECT_WORKFLOW_VERSION',
                        workflowId: workflowToSelect.id
                    });
                }
            }

            if (state.matches({ launchPlan: 'select' })) {
                if (!launchPlanOptions.length) {
                    return;
                }

                let launchPlanToSelect = launchPlanOptions[0];
                /* Attempt to select, in order:
                 * 1. The last launch plan that was selected, matching by the name, to preserve
                 *    any user selection before switching workflow versions.
                 * 2. The launch plan that was specified when initializing the form, by full id
                 * 3. The default launch plan, which has the same `name` as the workflow
                 * 4. The first launch plan in the list
                 */
                if (launchPlan) {
                    const lastSelected = launchPlanOptions.find(
                        ({ id: { name } }) => name === launchPlan.id.name
                    );
                    if (lastSelected) {
                        launchPlanToSelect = lastSelected;
                    }
                } else if (preferredLaunchPlanId) {
                    const preferred = launchPlanOptions.find(({ id }) =>
                        isEqual(id, preferredLaunchPlanId)
                    );
                    if (preferred) {
                        launchPlanToSelect = preferred;
                    }
                } else {
                    const defaultLaunchPlan = launchPlanOptions.find(
                        ({ id: { name } }) => name === sourceWorkflowId.name
                    );
                    if (defaultLaunchPlan) {
                        launchPlanToSelect = defaultLaunchPlan;
                    }
                }

                service.send({
                    type: 'SELECT_LAUNCH_PLAN',
                    launchPlan: launchPlanToSelect
                });
            }
        });

        return subscription.unsubscribe;
    }, [service]);

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
        state,
        workflowSelectorOptions
    };
}
