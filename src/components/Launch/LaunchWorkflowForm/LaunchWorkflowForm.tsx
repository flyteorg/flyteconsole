import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormHelperText,
    Typography
} from '@material-ui/core';
import { ButtonCircularProgress } from 'components/common/ButtonCircularProgress';
import * as React from 'react';
import { formStrings } from './constants';
import { InputValueCacheContext } from './inputValueCache';
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
        formKey,
        formInputsRef,
        showErrors,
        inputValueCache,
        onCancel,
        onSubmit,
        state,
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
        onSubmit();
    };

    // const submissionInFlight = state.matches({ submit: 'submitting' });
    // const canSubmit = !state.matches({ sourceSelected: 'enterInputs' });
    // const showWorkflowSelector = [
    //     { working: 'sourceSelected' },
    //     { workflow: 'select' }
    // ].some(state.matches);
    // console.log(JSON.stringify(state.value), showWorkflowSelector);
    // console.log(
    //     'dot match',
    //     state.matches('select')
    // );
    // const showLaunchPlanSelector = [
    //     { working: 'sourceSelected' },
    //     { launchPlan: 'select' }
    // ].some(state.matches);
    // const showInputs = [
    //     { sourceSelected: 'enterInputs' },
    //     { sourceSelected: 'submit' }
    // ].some(state.matches);

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
                    {state.context.sourceWorkflowId?.name}
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
