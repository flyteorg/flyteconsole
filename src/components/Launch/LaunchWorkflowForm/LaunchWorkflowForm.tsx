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

    const submissionInFlight = state.matches({ submit: 'submitting' });
    const canSubmit = !state.matches({ sourceSelected: 'enterInputs' });
    const showWorkflowSelector = [
        { working: 'sourceSelected' },
        { workflow: 'select' }
    ].some(state.matches);
    const showLaunchPlanSelector = [
        { working: 'sourceSelected' },
        { launchPlan: 'select' }
    ].some(state.matches);
    const showInputs = [
        { sourceSelected: 'enterInputs' },
        { sourceSelected: 'submit' }
    ].some(state.matches);

    // TODO: We removed all loading indicators here. Decide if we want skeletons
    // instead.
    return (
        <InputValueCacheContext.Provider value={inputValueCache}>
            <DialogTitle disableTypography={true} className={styles.header}>
                <div className={styles.inputLabel}>{formStrings.title}</div>
                <Typography variant="h6">
                    {state.context.sourceWorkflowId}
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
                <section title={formStrings.inputs}>
                    {state.matches({ sourceSelected: 'unsupportedInputs' }) ? (
                        <UnsupportedRequiredInputsError
                            inputs={state.context.unsupportedRequiredInputs}
                        />
                    ) : null}
                    {showInputs ? (
                        <LaunchWorkflowFormInputs
                            key={formKey}
                            inputs={state.context.parsedInputs}
                            ref={formInputsRef}
                            showErrors={showErrors}
                        />
                    ) : null}
                </section>
            </DialogContent>
            <div className={styles.footer}>
                {state.matches({ submit: 'failed' }) && (
                    <FormHelperText error={true}>
                        {state.context.error.message}
                    </FormHelperText>
                )}
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
