import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormHelperText,
    Typography
} from '@material-ui/core';
import { getCacheKey } from 'components/Cache/utils';
import { ButtonCircularProgress } from 'components/common/ButtonCircularProgress';
import * as React from 'react';
import { history } from 'routes/history';
import { Routes } from 'routes/routes';
import { formStrings } from './constants';
import {
    createInputValueCache,
    InputValueCacheContext
} from './inputValueCache';
import { LaunchState } from './launchMachine';
import { LaunchWorkflowFormInputs } from './LaunchWorkflowFormInputs';
import { SearchableSelector } from './SearchableSelector';
import { useStyles } from './styles';
import { LaunchWorkflowFormProps } from './types';
import { UnsupportedRequiredInputsError } from './UnsupportedRequiredInputsError';
import { useLaunchWorkflowFormState } from './useLaunchWorkflowFormState';

/** Renders the form for initiating a Launch request based on a Workflow */
export const LaunchWorkflowForm: React.FC<LaunchWorkflowFormProps> = props => {
    const {
        formInputsRef,
        state,
        service,
        workflowSourceSelectorState
    } = useLaunchWorkflowFormState(props);
    const styles = useStyles();

    const {
        fetchSearchResults,
        launchPlanSelectorOptions,
        onSelectLaunchPlan,
        onSelectWorkflowVersion,
        selectedLaunchPlan,
        selectedWorkflow,
        workflowSelectorOptions
    } = workflowSourceSelectorState;

    const submit: React.FormEventHandler = event => {
        event.preventDefault();
        // Show errors after the first submission
        setShowErrors(true);
        service.send({ type: 'SUBMIT' });
    };

    const onCancel = () => {
        service.send({ type: 'CANCEL' });
        props.onClose();
    };

    React.useEffect(() => {
        const subscription = service.subscribe(newState => {
            // On transition to final success state, read the resulting execution
            // id and navigate to the Execution Details page.
            // if (state.matches({ submit: 'succeeded' })) {
            if (newState.matches(LaunchState.SUBMIT_SUCCEEDED)) {
                history.push(
                    Routes.ExecutionDetails.makeUrl(
                        newState.context.resultExecutionId
                    )
                );
            }
        });

        return subscription.unsubscribe;
    }, [service]);

    // Any time the inputs change (even if it's just re-ordering), we must
    // change the form key so that the inputs component will re-mount.
    const formKey = React.useMemo<string>(() => {
        return getCacheKey(state.context.parsedInputs);
    }, [state.context.parsedInputs]);
    const [inputValueCache] = React.useState(createInputValueCache());
    const [showErrors, setShowErrors] = React.useState(false);
    // Only show errors after first submission for a set of inputs.
    React.useEffect(() => setShowErrors(false), [formKey]);

    const submissionInFlight = state.matches(LaunchState.SUBMITTING);
    const canSubmit = [
        LaunchState.ENTER_INPUTS,
        LaunchState.VALIDATING_INPUTS,
        LaunchState.INVALID_INPUTS,
        LaunchState.SUBMIT_FAILED
    ].some(state.matches);
    const showWorkflowSelector = ![
        LaunchState.LOADING_WORKFLOW_VERSIONS,
        LaunchState.FAILED_LOADING_WORKFLOW_VERSIONS
    ].some(state.matches);
    const showLaunchPlanSelector =
        state.context.workflowVersion &&
        ![
            LaunchState.LOADING_LAUNCH_PLANS,
            LaunchState.FAILED_LOADING_LAUNCH_PLANS
        ].some(state.matches);
    const showInputs = [
        LaunchState.UNSUPPORTED_INPUTS,
        LaunchState.ENTER_INPUTS,
        LaunchState.VALIDATING_INPUTS,
        LaunchState.INVALID_INPUTS,
        LaunchState.SUBMIT_VALIDATING,
        LaunchState.SUBMITTING,
        LaunchState.SUBMIT_FAILED,
        LaunchState.SUBMIT_SUCCEEDED
    ].some(state.matches);

    // TODO: We removed all loading indicators here. Decide if we want skeletons
    // instead.
    return (
        <InputValueCacheContext.Provider value={inputValueCache}>
            <DialogTitle disableTypography={true} className={styles.header}>
                <div className={styles.inputLabel}>{formStrings.title}</div>
                <Typography variant="h6">
                    {state.context.sourceId?.name}
                </Typography>
            </DialogTitle>
            <DialogContent dividers={true} className={styles.inputsSection}>
                {showWorkflowSelector ? (
                    <section
                        title={formStrings.workflowVersion}
                        className={styles.formControl}
                    >
                        <SearchableSelector
                            id="launch-workflow-selector"
                            label={formStrings.workflowVersion}
                            onSelectionChanged={onSelectWorkflowVersion}
                            options={workflowSelectorOptions}
                            fetchSearchResults={fetchSearchResults}
                            selectedItem={selectedWorkflow}
                        />
                    </section>
                ) : null}
                {showLaunchPlanSelector ? (
                    <section
                        title={formStrings.launchPlan}
                        className={styles.formControl}
                    >
                        <SearchableSelector
                            id="launch-lp-selector"
                            label={formStrings.launchPlan}
                            onSelectionChanged={onSelectLaunchPlan}
                            options={launchPlanSelectorOptions}
                            selectedItem={selectedLaunchPlan}
                        />
                    </section>
                ) : null}
                {showInputs ? (
                    <section title={formStrings.inputs}>
                        {state.matches(LaunchState.UNSUPPORTED_INPUTS) ? (
                            <UnsupportedRequiredInputsError
                                inputs={state.context.unsupportedRequiredInputs}
                            />
                        ) : (
                            <LaunchWorkflowFormInputs
                                key={formKey}
                                inputs={state.context.parsedInputs}
                                ref={formInputsRef}
                                showErrors={showErrors}
                            />
                        )}
                    </section>
                ) : null}
            </DialogContent>
            <div className={styles.footer}>
                {state.matches(LaunchState.SUBMIT_FAILED) ? (
                    <FormHelperText error={true}>
                        {state.context.error.message}
                    </FormHelperText>
                ) : null}
                <DialogActions>
                    <Button
                        color="primary"
                        disabled={submissionInFlight}
                        id="launch-workflow-cancel"
                        onClick={onCancel}
                        variant="outlined"
                    >
                        {formStrings.cancel}
                    </Button>
                    <Button
                        color="primary"
                        disabled={!canSubmit}
                        id="launch-workflow-submit"
                        onClick={submit}
                        type="submit"
                        variant="contained"
                    >
                        {formStrings.submit}
                        {submissionInFlight && <ButtonCircularProgress />}
                    </Button>
                </DialogActions>
            </div>
        </InputValueCacheContext.Provider>
    );
};
