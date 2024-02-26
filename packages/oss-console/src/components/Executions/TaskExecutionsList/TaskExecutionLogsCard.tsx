import React from 'react';
import Typography from '@mui/material/Typography';
import classnames from 'classnames';
import Core from '@clients/common/flyteidl/core';
import { useTheme } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';
import { useCommonStyles } from '../../common/styles';
import { TaskExecutionPhase } from '../../../models/Execution/enums';
import { MapTaskExecution, TaskExecution } from '../../../models/Execution/types';
import { isMapTaskV1 } from '../../../models/Task/utils';
import { ExecutionStatusBadge } from '../ExecutionStatusBadge';
import { TaskExecutionError } from './TaskExecutionError';
import { TaskExecutionLogs } from './TaskExecutionLogs';
import { TaskExecutionDetails } from './TaskExecutionDetails';

const namespace = 'TASK_EXECUTION_LOGS_CARD-';
const taskExecutionLogStyles: Record<string, string> = {
  detailsLink: `${namespace}detailsLink`,
  theme: `${namespace}theme`,
  header: `${namespace}header`,
  showDetailsButton: `${namespace}showDetailsButton`,
  section: `${namespace}section`,
};

const useStyles = () => {
  return taskExecutionLogStyles;
};

const TaskExecutionLogStyles = () => {
  const theme = useTheme();
  return (
    <GlobalStyles
      styles={{
        [`.${taskExecutionLogStyles.detailsLink}`]: {
          fontWeight: 'normal',
        },
        [`.${taskExecutionLogStyles.header}`]: {
          marginBottom: theme.spacing(1),
        },
        [`.${taskExecutionLogStyles.header}`]: {
          marginBottom: theme.spacing(1),

          '& > svg': {
            verticalAlign: 'middle',
          },
        },
        [`.${taskExecutionLogStyles.showDetailsButton}`]: {
          marginTop: theme.spacing(1),
        },
        [`.${taskExecutionLogStyles.section}`]: {
          marginBottom: theme.spacing(2),
        },
      }}
    />
  );
};

interface TaskExecutionLogsCardProps {
  taskExecution: TaskExecution | MapTaskExecution;
  headerText: string;
  phase: TaskExecutionPhase;
  logs: Core.ITaskLog[];
  mappedItem?: any;
}

export const TaskExecutionLogsCard: React.FC<TaskExecutionLogsCardProps> = (props) => {
  const { taskExecution, headerText, phase, logs } = props;
  const commonStyles = useCommonStyles();
  const styles = useStyles();

  const {
    closure: { error, startedAt, updatedAt, duration, metadata, eventVersion, taskType },
  } = taskExecution;

  const taskHasStarted = phase >= TaskExecutionPhase.QUEUED;

  const isMapTask = isMapTaskV1(
    eventVersion!,
    metadata?.externalResources?.length ?? 0,
    taskType ?? undefined,
  );
  return (
    <>
      <TaskExecutionLogStyles />
      <section className={styles.section}>
        <header className={styles.header}>
          <Typography variant="h6" className={classnames(styles.title, commonStyles.textWrapped)}>
            {headerText}
          </Typography>
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
