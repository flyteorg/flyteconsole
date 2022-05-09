import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ExternalResource } from 'models/Execution/types';
import { Core } from 'flyteidl';
import { Typography } from '@material-ui/core';
import classnames from 'classnames';
import { useCommonStyles } from 'components/common/styles';
import { TaskExecutionPhase } from 'models/Execution/enums';
import { ExecutionStatusBadge } from '../../ExecutionStatusBadge';
import { TaskExecutionLogs } from '../../TaskExecutionsList/TaskExecutionLogs';
import { formatRetryAttempt } from '../../TaskExecutionsList/utils';

const useStyles = makeStyles((theme) => {
  return {
    detailsPanelCardContent: {
      padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    section: {
      marginBottom: theme.spacing(2),
    },
    header: {
      marginBottom: theme.spacing(1),
    },
    title: {
      marginBottom: theme.spacing(1),
    },
    logLink: {
      margin: `${theme.spacing(0.5)} 0`,
    },
    logName: {
      fontWeight: 'lighter',
    },
  };
});

const MapTaskLogs: React.FC<{
  phase?: TaskExecutionPhase | null;
  retryAttempt?: number | null;
  logs?: Core.ITaskLog[] | null;
}> = ({ phase, retryAttempt, logs }) => {
  const commonStyles = useCommonStyles();
  const styles = useStyles();
  const headerText = formatRetryAttempt(retryAttempt ?? 0);

  return (
    <div className={styles.detailsPanelCardContent}>
      <section className={styles.section}>
        <header className={styles.header}>
          <Typography variant="h6" className={classnames(styles.title, commonStyles.textWrapped)}>
            {headerText}
          </Typography>
        </header>
        {phase && <ExecutionStatusBadge phase={phase} type="task" variant="text" />}
      </section>
      <section className={styles.section}>
        <TaskExecutionLogs taskLogs={logs || []} />
      </section>
    </div>
  );
};

export const MapTaskExecutionsList: React.FC<{
  mapTask: ExternalResource[];
}> = ({ mapTask }) => {
  return (
    <>
      {mapTask.map((task) => {
        return (
          <MapTaskLogs
            phase={task.phase}
            retryAttempt={task.retryAttempt}
            logs={task.logs}
            key={task.index}
          />
        );
      })}
    </>
  );
};
