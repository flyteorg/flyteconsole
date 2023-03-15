import * as React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import classnames from 'classnames';
import { useCommonStyles } from 'components/common/styles';
import { TaskExecutionPhase } from 'models/Execution/enums';
import { TaskExecution } from 'models/Execution/types';
import { Core } from '@flyteorg/flyteidl-types';
import { useExternalConfigurationContext } from 'basics/ExternalConfigurationProvider';
import { ExecutionStatusBadge } from '../ExecutionStatusBadge';
import { TaskExecutionDetails } from './TaskExecutionDetails';
import { TaskExecutionError } from './TaskExecutionError';
import { TaskExecutionLogs } from './TaskExecutionLogs';

const useStyles = makeStyles((theme: Theme) => ({
  detailsLink: {
    fontWeight: 'normal',
  },
  header: {
    marginBottom: theme.spacing(1),
  },
  title: {
    marginBottom: theme.spacing(1),

    '& > svg': {
      verticalAlign: 'middle',
    },
  },
  showDetailsButton: {
    marginTop: theme.spacing(1),
  },
  section: {
    marginBottom: theme.spacing(2),
  },
}));

interface TaskExecutionLogsCardProps {
  taskExecution: TaskExecution;
  headerText: string;
  phase: TaskExecutionPhase;
  logs: Core.ITaskLog[];
}

export const TaskExecutionLogsCard: React.FC<TaskExecutionLogsCardProps> = ({
  taskExecution,
  headerText,
  phase,
  logs,
}) => {
  const commonStyles = useCommonStyles();
  const styles = useStyles();
  const { registry } = useExternalConfigurationContext();

  const {
    closure: { error, startedAt, updatedAt, duration },
    id: taskExecutionId,
  } = taskExecution;

  const taskHasStarted = phase >= TaskExecutionPhase.QUEUED;
  const { LaunchAnchor } = registry?.taskObservability || {};

  return (
    <>
      <section className={styles.section}>
        <header className={styles.header}>
          {LaunchAnchor ? (
            // Alternate path
            <LaunchAnchor
              classNames={classnames(styles.title, commonStyles.textWrapped)}
              headerText={headerText}
              taskId={taskExecutionId.taskId}
              nodeExecutionId={taskExecutionId.nodeExecutionId}
              retryAttempt={taskExecutionId.retryAttempt}
            />
          ) : (
            // default path
            <Typography
              variant="h6"
              className={classnames(styles.title, commonStyles.textWrapped)}
            >
              {headerText}
            </Typography>
          )}
        </header>
        <ExecutionStatusBadge phase={phase} type="task" variant="text" />
      </section>
      {!!error && (
        <section className={styles.section}>
          <TaskExecutionError error={error} />
        </section>
      )}
      {taskHasStarted && (
        <>
          <section className={styles.section}>
            <TaskExecutionLogs taskLogs={logs ?? []} />
          </section>
          <section className={styles.section}>
            <TaskExecutionDetails
              startedAt={startedAt}
              updatedAt={updatedAt}
              duration={duration}
            />
          </section>
        </>
      )}
    </>
  );
};
