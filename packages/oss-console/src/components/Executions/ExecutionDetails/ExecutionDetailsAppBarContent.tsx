import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import { CircularProgressButton } from '@clients/primitives/CircularProgressButton';
import { MoreOptionsMenu } from '../../common/MoreOptionsMenu';
import { useCommonStyles } from '../../common/styles';
import { history } from '../../../routes/history';
import { Routes } from '../../../routes/routes';
import { WorkflowExecutionPhase } from '../../../models/Execution/enums';
import { useEscapeKey } from '../../hooks/useKeyListener';
import { ExecutionInputsOutputsModal } from '../ExecutionInputsOutputsModal';
import { ExecutionStatusBadge } from '../ExecutionStatusBadge';
import { TerminateExecutionButton } from '../TerminateExecution/TerminateExecutionButton';
import { executionIsStoppable, executionIsTerminal } from '../utils';
import { executionActionStrings } from './constants';
import { RelaunchExecutionForm } from './RelaunchExecutionForm';
import { useRecoverExecutionState } from './useRecoverExecutionState';
import { ExecutionContext } from '../contexts';
import BreadcrumbTitleActions from '../../Breadcrumbs/components/BreadcrumbTitleActions';

/** Renders information about a given Execution into the NavBar */
export const ExecutionDetailsAppBarContentInner: React.FC<{}> = () => {
  const commonStyles = useCommonStyles();

  const { execution } = React.useContext(ExecutionContext);

  const [showInputsOutputs, setShowInputsOutputs] = React.useState(false);
  const [showRelaunchForm, setShowRelaunchForm] = React.useState(false);
  const { phase } = execution.closure;

  const isStoppable = executionIsStoppable(execution);
  const isTerminal = executionIsTerminal(execution);
  const onClickShowInputsOutputs = () => setShowInputsOutputs(true);
  const onClickRelaunch = () => setShowRelaunchForm(true);
  const onCloseRelaunch = (_?: any) => setShowRelaunchForm(false);

  // Close modal on escape key press
  useEscapeKey(onCloseRelaunch);

  const {
    recoverExecution,
    recoverState: { isLoading: recovering, data: recoveredId },
  } = useRecoverExecutionState();

  React.useEffect(() => {
    if (!recovering && recoveredId) {
      history.push(Routes.ExecutionDetails.makeUrl(recoveredId));
    }
  }, [recovering, recoveredId]);

  let modalContent: JSX.Element | null = null;
  if (showInputsOutputs) {
    const onClose = () => setShowInputsOutputs(false);
    modalContent = <ExecutionInputsOutputsModal execution={execution} onClose={onClose} />;
  }

  const onClickRecover = React.useCallback(async () => {
    await recoverExecution();
  }, [recoverExecution]);

  const isRecoverVisible = React.useMemo(
    () =>
      [
        WorkflowExecutionPhase.FAILED,
        WorkflowExecutionPhase.ABORTED,
        WorkflowExecutionPhase.TIMED_OUT,
      ].includes(phase),
    [phase],
  );

  const actionContent = isStoppable ? (
    <Grid item>
      <TerminateExecutionButton />
    </Grid>
  ) : isTerminal ? (
    <>
      {isRecoverVisible && (
        <Grid item>
          <Button
            variant="outlined"
            color="primary"
            disabled={recovering}
            className={commonStyles.buttonWhiteOutlined}
            onClick={onClickRecover}
            size="small"
          >
            Recover
            {recovering && <CircularProgressButton />}
          </Button>
        </Grid>
      )}
      <Grid item>
        <Button
          variant="outlined"
          color="primary"
          className={commonStyles.buttonWhiteOutlined}
          onClick={onClickRelaunch}
          size="small"
        >
          Relaunch
        </Button>
      </Grid>
    </>
  ) : null;

  // For non-terminal executions, add an overflow menu with the ability to clone
  const moreActionsContent = !isTerminal ? (
    <Grid item>
      <MoreOptionsMenu
        options={[
          {
            label: executionActionStrings.clone,
            onClick: onClickRelaunch,
          },
        ]}
      />
    </Grid>
  ) : null;
  return (
    <>
      <BreadcrumbTitleActions>
        <Grid container justifyContent="flex-end" alignItems="center" spacing={2}>
          <Grid item>
            <ExecutionStatusBadge phase={phase} type="workflow" className="subNavBadge" />
          </Grid>
          <Grid item>
            <Button onClick={onClickShowInputsOutputs} variant="text" size="small">
              View Inputs &amp; Outputs
            </Button>
          </Grid>
          {actionContent && <>{actionContent}</>}
          {moreActionsContent && <>{moreActionsContent}</>}
        </Grid>
      </BreadcrumbTitleActions>
      <Dialog
        scroll="paper"
        maxWidth="sm"
        fullWidth
        open={showRelaunchForm}
        onClose={onCloseRelaunch}
      >
        <RelaunchExecutionForm execution={execution} onClose={onCloseRelaunch} />
      </Dialog>
      {modalContent}
    </>
  );
};

export const ExecutionDetailsAppBarContent: React.FC<{}> = () => {
  return <ExecutionDetailsAppBarContentInner />;
};
