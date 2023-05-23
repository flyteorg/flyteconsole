import * as React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import classnames from 'classnames';
import { useCommonStyles } from 'components/common/styles';
import { TaskExecutionPhase } from 'models/Execution/enums';
import { MapTaskExecution, TaskExecution } from 'models/Execution/types';
import { Core } from '@flyteorg/flyteidl-types';
import { ExternalConfigHoc } from 'basics/ExternalConfigHoc';
import { useExternalConfigurationContext } from 'basics/ExternalConfigurationProvider';
import { isMapTaskV1 } from 'models';
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
  taskExecution: TaskExecution | MapTaskExecution;
  headerText: string;
  phase: TaskExecutionPhase;
  logs: Core.ITaskLog[];
  mappedItem?: any;
}

export const TaskExecutionLogsCard: React.FC<
  TaskExecutionLogsCardProps
> = props => {
  const { taskExecution, headerText, phase, logs } = props;
  const commonStyles = useCommonStyles();
  const styles = useStyles();
  const { registry } = useExternalConfigurationContext();

  const {
    closure: {
      error,
      startedAt,
      updatedAt,
      duration,
      metadata,
      eventVersion,
      taskType,
    },
  } = taskExecution;

  const taskHasStarted = phase >= TaskExecutionPhase.QUEUED;
  const defaultHeader = (
    <Typography
      variant="h6"
      className={classnames(styles.title, commonStyles.textWrapped)}
    >
      {headerText}
    </Typography>
  );

  const externalHeader = registry?.taskExecutionAttemps && (
    <ExternalConfigHoc
      ChildComponent={registry.taskExecutionAttemps}
      data={{
        ...props,
        styles,
        commonStyles,
        fallback: defaultHeader,
      }}
    />
  );

  const isMapTask = isMapTaskV1(
    eventVersion!,
    metadata?.externalResources?.length ?? 0,
    taskType ?? undefined,
  );
  return (
    <>
      <section className={styles.section}>
        <header className={styles.header}>
          {externalHeader || defaultHeader}
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
          {!isMapTask && (
            <section className={styles.section}>
              <TaskExecutionDetails
                startedAt={startedAt}
                updatedAt={updatedAt}
                duration={duration}
              />
            </section>
          )}
        </>
      )}
    </>
  );
};
