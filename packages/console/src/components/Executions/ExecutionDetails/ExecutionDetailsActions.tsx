import React, { useEffect, useState } from 'react';
import { Button, Dialog, Grid, IconButton } from '@material-ui/core';
import { ResourceIdentifier, Identifier } from 'models/Common/types';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { getTask } from 'models/Task/api';
import { LaunchFormDialog } from 'components/Launch/LaunchForm/LaunchFormDialog';
import { NodeExecutionIdentifier } from 'models/Execution/types';
import {
  useNodeExecution,
  useNodeExecutionData,
} from 'components/hooks/useNodeExecution';
import { literalsToLiteralValueMap } from 'components/Launch/LaunchForm/utils';
import { TaskInitialLaunchParameters } from 'components/Launch/LaunchForm/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { extractCompiledNodes } from 'components/hooks/utils';
import Close from '@material-ui/icons/Close';
import classnames from 'classnames';
import { Fullscreen, FullscreenExit } from '@material-ui/icons';
import { NodeExecutionDetails } from '../types';
import t from './strings';
import { ExecutionNodeDeck } from './ExecutionNodeDeck';
import {
  useNodeExecutionContext,
  useNodeExecutionsById,
} from '../contextProvider/NodeExecutionDetails';

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
      width: theme.spacing(110),
      transition: 'all 0.3s ease',
    },
    fullscreenDialog: {
      maxWidth: '100vw',
      width: '100vw',
      maxHeight: '100svh',
      height: '100svh',
      margin: 0,
      transition: 'all 0.3s ease',
      borderRadius: 0,
    },
    dialogHeader: {
      padding: theme.spacing(2),
      paddingBottom: theme.spacing(0),
      fontFamily: 'Open sans',
    },
    deckTitle: {
      flexGrow: 1,
      textAlign: 'center',
      fontSize: '24px',
      lineHeight: '32px',
      marginBlock: 0,
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    close: {
      paddingRight: theme.spacing(2),
    },
  };
});
interface ExecutionDetailsActionsProps {
  className?: string;
  details?: NodeExecutionDetails;
  nodeExecutionId: NodeExecutionIdentifier;
  phase: NodeExecutionPhase;
  text?: {
    flyteDeckText?: string;
    rerunText?: string;
    resumeText?: string;
  };
}

export const ExecutionDetailsActions = ({
  className,
  details,
  nodeExecutionId,
  phase,
  text,
}: ExecutionDetailsActionsProps): JSX.Element => {
  const styles = useStyles();

  const [showLaunchForm, setShowLaunchForm] = useState<boolean>(false);
  const [showResumeForm, setShowResumeForm] = useState<boolean>(false);

  const [initialParameters, setInitialParameters] = useState<
    TaskInitialLaunchParameters | undefined
  >(undefined);
  const { nodeExecutionsById } = useNodeExecutionsById();
  const executionData = useNodeExecutionData(nodeExecutionId);
  const execution = useNodeExecution(nodeExecutionId);
  const { compiledWorkflowClosure } = useNodeExecutionContext();
  const id = details?.taskTemplate?.id;

  const compiledNode = extractCompiledNodes(compiledWorkflowClosure).find(
    node =>
      node.id ===
        nodeExecutionsById[nodeExecutionId.nodeId]?.metadata?.specNodeId ||
      node.id === nodeExecutionId.nodeId,
  );

  useEffect(() => {
    if (!id) {
      return;
    }

    (async () => {
      const task = await getTask(id!);

      const literals = executionData.value.fullInputs?.literals;
      const taskInputsTypes =
        task.closure.compiledTask.template?.interface?.inputs?.variables;

      const tempInitialParameters: TaskInitialLaunchParameters = {
        values:
          literals &&
          taskInputsTypes &&
          literalsToLiteralValueMap(literals, taskInputsTypes),
        taskId: id as Identifier | undefined,
      };

      setInitialParameters(tempInitialParameters);
    })();
  }, [details]);

  const [showDeck, setShowDeck] = React.useState(false);
  const onCloseDeck = () => setShowDeck(false);

  const [fullScreen, setSetFullScreen] = React.useState(false);
  const toggleFullScreen = () => {
    setSetFullScreen(!fullScreen);
  };

  const rerunOnClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setShowLaunchForm(true);
  };

  const onResumeClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setShowResumeForm(true);
  };

  return (
    <>
      <div className={classnames(styles.actionsContainer, className)}>
        {execution?.value?.closure?.deckUri && (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setShowDeck(true)}
            disabled={phase !== NodeExecutionPhase.SUCCEEDED}
          >
            {text?.flyteDeckText || t('flyteDeck')}
          </Button>
        )}
        {id && initialParameters && details && (
          <Button variant="outlined" color="primary" onClick={rerunOnClick}>
            {text?.rerunText || t('rerun')}
          </Button>
        )}
        {phase === NodeExecutionPhase.PAUSED && (
          <Button variant="outlined" color="primary" onClick={onResumeClick}>
            {text?.resumeText || t('resume')}
          </Button>
        )}
      </div>
      {id && initialParameters && (
        <LaunchFormDialog
          id={id as ResourceIdentifier}
          initialParameters={initialParameters}
          showLaunchForm={showLaunchForm}
          setShowLaunchForm={setShowLaunchForm}
        />
      )}
      {compiledNode && (
        <LaunchFormDialog
          compiledNode={compiledNode}
          initialParameters={initialParameters}
          nodeExecutionId={nodeExecutionId}
          showLaunchForm={showResumeForm}
          setShowLaunchForm={setShowResumeForm}
        />
      )}
      {execution?.value?.closure?.deckUri && (
        <Dialog
          PaperProps={{
            className: fullScreen ? styles.fullscreenDialog : styles.dialog,
          }}
          maxWidth={false}
          open={showDeck}
        >
          <Grid
            container
            justifyContent="space-between"
            alignContent="center"
            className={styles.dialogHeader}
          >
            <Grid item>
              <IconButton aria-label="Expand" onClick={toggleFullScreen}>
                {fullScreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Grid>
            <Grid item>
              <h2 className={styles.deckTitle}>{t('flyteDeck')}</h2>
            </Grid>
            <Grid item>
              <IconButton aria-label="close" onClick={onCloseDeck}>
                <Close />
              </IconButton>
            </Grid>
          </Grid>
          <ExecutionNodeDeck nodeExecutionId={nodeExecutionId} />
        </Dialog>
      )}
    </>
  );
};
