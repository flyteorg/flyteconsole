import * as React from 'react';
import { Button, Dialog, Grid, Link } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import classnames from 'classnames';
import { navbarGridHeight } from 'common/layout';
import { ButtonCircularProgress } from 'components/common/ButtonCircularProgress';
import { MoreOptionsMenu } from 'components/common/MoreOptionsMenu';
import { useCommonStyles } from 'components/common/styles';
import { history } from 'routes/history';
import { Routes } from 'routes/routes';
import { WorkflowExecutionPhase } from 'models/Execution/enums';
import { SubNavBarContent } from 'components/Navigation/SubNavBarContent';
import { useEscapeKey } from 'components/hooks/useKeyListener';
import { BreadcrumbTitleActions } from 'components/Breadcrumbs';
import { ExecutionInputsOutputsModal } from '../ExecutionInputsOutputsModal';
import { ExecutionStatusBadge } from '../ExecutionStatusBadge';
import { TerminateExecutionButton } from '../TerminateExecution/TerminateExecutionButton';
import { executionIsRunning, executionIsTerminal } from '../utils';
import { executionActionStrings } from './constants';
import { RelaunchExecutionForm } from './RelaunchExecutionForm';
import { useRecoverExecutionState } from './useRecoverExecutionState';
import { ExecutionContext } from '../contexts';

const useStyles = makeStyles((theme: Theme) => {
  return {
    actionButton: {
      // marginLeft: theme.spacing(2),
    },
    actions: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'flex-end',
      flex: '1 0 auto',
      height: '100%',
      marginLeft: theme.spacing(2),
    },
    backLink: {
      color: 'inherit',
      marginRight: theme.spacing(1),
    },
    container: {
      alignItems: 'center',
      display: 'flex',
      flex: '1 1 auto',
      maxWidth: '100%',
    },
    inputsOutputsLink: {
      color: theme.palette.primary.main,
    },
    moreActions: {
      // marginLeft: theme.spacing(1),
      // marginRight: theme.spacing(-2),
    },
    title: {
      flex: '0 1 auto',
      marginLeft: theme.spacing(2),
    },
    titleContainer: {
      alignItems: 'center',
      display: 'flex',
      flex: '0 1 auto',
      flexDirection: 'column',
      maxHeight: theme.spacing(navbarGridHeight),
      overflow: 'hidden',
    },
    version: {
      flex: '0 1 auto',
      overflow: 'hidden',
    },
  };
});

/** Renders information about a given Execution into the NavBar */
export const ExecutionDetailsAppBarContentInner: React.FC<{}> = () => {
  const commonStyles = useCommonStyles();
  const styles = useStyles();

  const { execution } = React.useContext(ExecutionContext);

  const [showInputsOutputs, setShowInputsOutputs] = React.useState(false);
  const [showRelaunchForm, setShowRelaunchForm] = React.useState(false);
  const { phase } = execution.closure;

  const isRunning = executionIsRunning(execution);
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
    modalContent = (
      <ExecutionInputsOutputsModal execution={execution} onClose={onClose} />
    );
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

  const actionContent = isRunning ? (
    <TerminateExecutionButton className={styles.actionButton} />
  ) : isTerminal ? (
    <>
      {isRecoverVisible && (
        <Button
          variant="outlined"
          color="primary"
          disabled={recovering}
          className={classnames(
            styles.actionButton,
            commonStyles.buttonWhiteOutlined,
          )}
          onClick={onClickRecover}
          size="small"
        >
          Recover
          {recovering && <ButtonCircularProgress />}
        </Button>
      )}
      <Button
        variant="outlined"
        color="primary"
        className={classnames(
          styles.actionButton,
          commonStyles.buttonWhiteOutlined,
        )}
        onClick={onClickRelaunch}
        size="small"
      >
        Relaunch
      </Button>
    </>
  ) : null;

  // For non-terminal executions, add an overflow menu with the ability to clone
  const moreActionsContent = !isTerminal ? (
    <MoreOptionsMenu
      className={styles.moreActions}
      options={[
        {
          label: executionActionStrings.clone,
          onClick: onClickRelaunch,
        },
      ]}
    />
  ) : null;

  return (
    <>
      <BreadcrumbTitleActions>
        <Grid container justifyContent="flex-end" spacing={2}>
          <Grid item>
            <ExecutionStatusBadge
              phase={phase}
              type="workflow"
              className="subNavBadge"
            />
          </Grid>
          <Grid item>
            <Link
              className={styles.inputsOutputsLink}
              component="button"
              onClick={onClickShowInputsOutputs}
              variant="body1"
            >
              View Inputs &amp; Outputs
            </Link>
          </Grid>
          {actionContent && <Grid item>{actionContent}</Grid>}
          {moreActionsContent && <Grid item>{moreActionsContent}</Grid>}
        </Grid>
      </BreadcrumbTitleActions>
      <Dialog
        scroll="paper"
        maxWidth="sm"
        fullWidth={true}
        open={showRelaunchForm}
      >
        <RelaunchExecutionForm
          execution={execution}
          onClose={onCloseRelaunch}
        />
      </Dialog>
      {modalContent}
    </>
  );
};
export const ExecutionDetailsAppBarContent: React.FC<{}> = () => {
  return (
    <SubNavBarContent>
      <ExecutionDetailsAppBarContentInner />
    </SubNavBarContent>
  );
};
