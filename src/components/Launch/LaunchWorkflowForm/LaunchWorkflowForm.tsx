import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormHelperText,
    Typography
} from '@material-ui/core';
import { ButtonCircularProgress } from 'components/common/ButtonCircularProgress';
import { APIContextValue, useAPIContext } from 'components/data/apiContext';
import {
    FilterOperationName,
    NamedEntityIdentifier,
    SortDirection,
    workflowSortFields
} from 'models';
import * as React from 'react';
import { formStrings } from './constants';
import { InputValueCacheContext } from './inputValueCache';
import { LaunchWorkflowFormInputs } from './LaunchWorkflowFormInputs';
import { SearchableSelector } from './SearchableSelector';
import { useStyles } from './styles';
import { LaunchWorkflowFormProps } from './types';
import { UnsupportedRequiredInputsError } from './UnsupportedRequiredInputsError';
import { useLaunchWorkflowFormState } from './useLaunchWorkflowFormState';
import { workflowsToSearchableSelectorOptions } from './utils';

function generateFetchSearchResults(
    { listWorkflows }: APIContextValue,
    workflowId: NamedEntityIdentifier
) {
    return async (query: string) => {
        const { project, domain, name } = workflowId;
        const { entities: workflows } = await listWorkflows(
            { project, domain, name },
            {
                filter: [
                    {
                        key: 'version',
                        operation: FilterOperationName.CONTAINS,
                        value: query
                    }
                ],
                sort: {
                    key: workflowSortFields.createdAt,
                    direction: SortDirection.DESCENDING
                }
            }
        );
        return workflowsToSearchableSelectorOptions(workflows);
    };
}

/** Renders the form for initiating a Launch request based on a Workflow */
export const LaunchWorkflowForm: React.FC<LaunchWorkflowFormProps> = props => {
    const {
        formKey,
        formInputsRef,
        showErrors,
        inputValueCache,
        launchPlanSelectorOptions,
        onCancel,
        onSelectLaunchPlan,
        onSelectWorkflow,
        onSubmit,
        selectedLaunchPlan,
        selectedWorkflow,
        state,
        workflowSelectorOptions
    } = useLaunchWorkflowFormState(props);
    const styles = useStyles();

    // TODO: This won't work correctly with our selected item matching in the state hook, because
    // the selected item won't exist in the default list of options.
    // Either:
    // 1. Store search options in the machine context (meh, it's specific to the components)
    // 2. Move the search option generation here and pass through the selected items as bare values.
    const fetchSearchResults = generateFetchSearchResults(
        useAPIContext(),
        props.workflowId
    );

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
                    {state.context.sourceWorkflowName}
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
                            onSelectionChanged={onSelectWorkflow}
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
