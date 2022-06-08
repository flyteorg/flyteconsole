import { Button, Dialog, IconButton } from '@material-ui/core';
import * as React from 'react';
import { ResourceIdentifier, Identifier, Variable } from 'models/Common/types';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { getTask } from 'models/Task/api';
import { LaunchFormDialog } from 'components/Launch/LaunchForm/LaunchFormDialog';
import { NodeExecutionIdentifier } from 'models/Execution/types';
import { useNodeExecution, useNodeExecutionData } from 'components/hooks/useNodeExecution';
import { literalsToLiteralValueMap } from 'components/Launch/LaunchForm/utils';
import { TaskInitialLaunchParameters } from 'components/Launch/LaunchForm/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import Close from '@material-ui/icons/Close';
import { NodeExecutionDetails } from '../types';
import t from './strings';
import { ExecutionNodeDeck } from './ExecutionNodeDeck';

const useStyles = makeStyles((theme: Theme) => {
  return {
    actionsContainer: {
      borderTop: `1px solid ${theme.palette.divider}`,
      marginTop: theme.spacing(2),
      paddingTop: theme.spacing(2),
      '& button': {
        marginRight: theme.spacing(1),
      },
    },
    dialog: {
      maxWidth: `calc(100% - ${theme.spacing(12)}px)`,
      maxHeight: `calc(100% - ${theme.spacing(12)}px)`,
      height: theme.spacing(90),
      width: theme.spacing(100),
      '& iframe': {
        border: 'none',
      },
    },
    dialogTitle: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(2),
      paddingBottom: theme.spacing(0),
    },
    deckTitle: {
      flexGrow: 1,
      textAlign: 'center',
      fontSize: '24px',
      lineHeight: '28px',
      marginBlock: 0,
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    close: {
      position: 'absolute',
      right: theme.spacing(2),
    },
  };
});

interface ExecutionDetailsActionsProps {
  details: NodeExecutionDetails;
  nodeExecutionId: NodeExecutionIdentifier;
  phase?: NodeExecutionPhase;
}

export const ExecutionDetailsActions = (props: ExecutionDetailsActionsProps): JSX.Element => {
  const { details, nodeExecutionId, phase } = props;
  const styles = useStyles();

  const [showLaunchForm, setShowLaunchForm] = React.useState<boolean>(false);
  const [taskInputsTypes, setTaskInputsTypes] = React.useState<
    Record<string, Variable> | undefined
  >();

  const executionData = useNodeExecutionData(nodeExecutionId);
  const execution = useNodeExecution(nodeExecutionId);

  const id = details.taskTemplate?.id as ResourceIdentifier | undefined;

  React.useEffect(() => {
    const fetchTask = async () => {
      const task = await getTask(id as Identifier);
      setTaskInputsTypes(task.closure.compiledTask.template?.interface?.inputs?.variables);
    };
    if (id) fetchTask();
  }, [id]);

  const [showDeck, setShowDeck] = React.useState(false);
  const onCloseDeck = () => setShowDeck(false);

  if (!id) {
    return <></>;
  }

  const literals = executionData.value.fullInputs?.literals;

  const initialParameters: TaskInitialLaunchParameters = {
    values: literals && taskInputsTypes && literalsToLiteralValueMap(literals, taskInputsTypes),
    taskId: id as Identifier | undefined,
  };

  const rerunOnClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setShowLaunchForm(true);
  };

  return (
    <>
      <div className={styles.actionsContainer}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setShowDeck(true)}
          disabled={phase !== NodeExecutionPhase.SUCCEEDED}
        >
          {t('flyteDeck')}
        </Button>
        <Button variant="outlined" color="primary" onClick={rerunOnClick}>
          {t('rerun')}
        </Button>
      </div>
      <LaunchFormDialog
        id={id}
        initialParameters={initialParameters}
        showLaunchForm={showLaunchForm}
        setShowLaunchForm={setShowLaunchForm}
      />
      {nodeExecutionId && execution?.value?.closure?.deckUri ? (
        <Dialog PaperProps={{ className: styles.dialog }} maxWidth={false} open={showDeck}>
          <div className={styles.dialogTitle}>
            <h3 className={styles.deckTitle}>{t('flyteDeck')}</h3>
            <IconButton aria-label="close" onClick={onCloseDeck} className={styles.close}>
              <Close />
            </IconButton>
          </div>
          <ExecutionNodeDeck deckUri={execution.value.closure.deckUri} />
        </Dialog>
      ) : null}
    </>
  );
};
