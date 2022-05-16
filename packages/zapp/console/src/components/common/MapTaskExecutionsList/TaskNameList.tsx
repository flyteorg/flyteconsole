import * as React from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { Core } from 'flyteidl';
import {
  getTaskLogName,
  getUniqueTaskExecutionName,
} from 'components/Executions/TaskExecutionsList/utils';
import { MapTaskExecution, TaskExecution } from 'models/Execution/types';
import { noLogsFoundString } from 'components/Executions/constants';
import { useCommonStyles } from '../styles';

interface StyleProps {
  isLink: boolean;
}

const useStyles = makeStyles((_theme: Theme) => ({
  taskTitle: ({ isLink }: StyleProps) => ({
    cursor: isLink ? 'pointer' : 'default',
    '&:hover': {
      textDecoration: isLink ? 'underline' : 'none',
    },
  }),
}));

interface TaskNameListProps {
  taskExecution: TaskExecution;
  logs: Core.ITaskLog[];
  onTaskSelected: (val: MapTaskExecution) => void;
}

export const TaskNameList = ({ taskExecution, logs, onTaskSelected }: TaskNameListProps) => {
  const commonStyles = useCommonStyles();

  if (logs.length === 0) {
    return <span className={commonStyles.hintText}>{noLogsFoundString}</span>;
  }

  const taskName = getUniqueTaskExecutionName(taskExecution);

  return (
    <>
      {logs.map((log) => {
        const styles = useStyles({ isLink: !!log.uri });
        const taskLogName = getTaskLogName(taskName, log.name ?? '');

        const handleClick = () => {
          onTaskSelected({ ...taskExecution, taskName: taskLogName, log });
        };

        return (
          <Typography
            variant="body1"
            color={log.uri ? 'primary' : 'textPrimary'}
            onClick={log.uri ? handleClick : undefined}
            key={taskLogName}
            className={styles.taskTitle}
            data-testid="map-task-log"
          >
            {taskLogName}
          </Typography>
        );
      })}
    </>
  );
};
