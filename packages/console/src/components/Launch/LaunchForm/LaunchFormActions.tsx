import * as React from 'react';
import { useEffect } from 'react';
import { Button, DialogActions, FormHelperText } from '@material-ui/core';
import { ButtonCircularProgress } from 'components/common/ButtonCircularProgress';
import { history } from 'routes/history';
import { Routes } from 'routes/routes';
import { useDetailsPanel } from 'components/Executions/ExecutionDetails/DetailsPanelContext';
import t from './strings';
import { LaunchState, TaskResumeContext } from './launchMachine';
import { useStyles } from './styles';
import { BaseInterpretedLaunchState, BaseLaunchService } from './types';

export interface LaunchFormActionsProps {
  state: BaseInterpretedLaunchState;
  service: BaseLaunchService;
  onClose(): void;
  isError: boolean;
  submitTitle: string;
  rejectTitle?: string;
}
/** Renders the Submit/Cancel buttons for a LaunchForm */
export const LaunchFormActions: React.FC<LaunchFormActionsProps> = ({
  state,
  service,
  onClose,
  isError,
  submitTitle,
  rejectTitle,
}) => {
  const styles = useStyles();
  const submissionInFlight = state.matches(LaunchState.SUBMITTING);
  const { setIsDetailsTabClosed } = useDetailsPanel();
  const canSubmit = [
    LaunchState.ENTER_INPUTS,
    LaunchState.VALIDATING_INPUTS,
    LaunchState.INVALID_INPUTS,
    LaunchState.SUBMIT_FAILED,
  ].some(state.matches);

  const submit: React.FormEventHandler = event => {
    event.preventDefault();
    service.send({ type: 'SELECT_REJECT', value: false });
    service.send({ type: 'SUBMIT' });
  };

  const reject: React.FormEventHandler = event => {
    event.preventDefault();
    service.send({ type: 'SELECT_REJECT', value: true });
    service.send({ type: 'SUBMIT' });
  };

  const onCancel = () => {
    service.send({ type: 'CANCEL' });
    onClose();
  };

  useEffect(() => {
    const subscription = service.subscribe(newState => {
      // On transition to final success state, read the resulting execution
      // id and navigate to the Execution Details page.
      // if (state.matches({ submit: 'succeeded' })) {
      if (newState.matches(LaunchState.SUBMIT_SUCCEEDED)) {
        if (newState.context.resultExecutionId) {
          onClose();
          setIsDetailsTabClosed && setIsDetailsTabClosed(true);
          // history.push(
          //   Routes.ExecutionDetails.makeUrl(newState.context.resultExecutionId),
          // );
        }
        const context = newState.context as TaskResumeContext;
        if (context.compiledNode) {
          // only for resume
          if (context.nodeExecutionId) {
            // this cancels the modal
            onCancel();
            // this reloads the page
            history.push(
              Routes.ExecutionDetails.makeUrl(
                context.nodeExecutionId.executionId,
              ),
            );
          }
        } else {
          if (newState.context.resultExecutionId) {
            history.push(
              Routes.ExecutionDetails.makeUrl(
                newState.context.resultExecutionId,
              ),
            );
          }
        }
      }
    });

    return subscription.unsubscribe;
  }, [service]);

  return (
    <div className={styles.footer}>
      {state.matches(LaunchState.SUBMIT_FAILED) ? (
        <FormHelperText error={true}>
          {state?.context?.error?.message}
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
          {t('cancel')}
        </Button>
        {rejectTitle && (
          <Button
            color="primary"
            disabled={!canSubmit || isError}
            id="launch-workflow-reject"
            onClick={reject}
            type="submit"
            variant="outlined"
          >
            {rejectTitle}
            {submissionInFlight && <ButtonCircularProgress />}
          </Button>
        )}
        <Button
          color="primary"
          disabled={!canSubmit || isError}
          id="launch-workflow-submit"
          onClick={submit}
          type="submit"
          variant="contained"
        >
          {submitTitle}
          {submissionInFlight && <ButtonCircularProgress />}
        </Button>
      </DialogActions>
    </div>
  );
};
