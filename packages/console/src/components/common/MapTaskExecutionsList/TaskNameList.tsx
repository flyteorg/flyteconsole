import * as React from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { Core } from '@flyteorg/flyteidl-types';
import { getTaskLogName } from 'components/Executions/TaskExecutionsList/utils';
import { MapTaskExecution, TaskExecution } from 'models/Execution/types';
import { noLogsFoundString } from 'components/Executions/constants';
import { CacheStatus } from 'components/Executions/CacheStatus';
import classnames from 'classnames';
import { useCommonStyles } from '../styles';

const useStyles = makeStyles((_theme: Theme) => ({
  taskName: {
    lineHeight: 2,
    overflowWrap: 'anywhere',
  },

  taskTitle: {
    cursor: 'default',
    '&:hover': {
      textDecoration: 'none',
    },
  },

  taskTitleLink: {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },

  taskCacheLogo: {
    verticalAlign: 'middle',
    position: 'relative',
    left: 0,
  },
}));

interface TaskNameListProps {
  taskExecution: TaskExecution;
  logs: Core.ITaskLog[];
  onTaskSelected: (val: MapTaskExecution) => void;
  className?: string;
}

export const TaskNameList = ({
  taskExecution,
  logs,
  onTaskSelected,
  className,
}: TaskNameListProps) => {
  const commonStyles = useCommonStyles();
  const styles = useStyles();

  if (logs.length === 0) {
    return <span className={commonStyles.hintText}>{noLogsFoundString}</span>;
  }

  return (
    <>
      {logs.map((log, _taskIndex) => {
        const taskLogName = getTaskLogName(
          taskExecution.id.taskId.name,
          log.name ?? '',
        );

        const cacheStatus =
          taskExecution.closure?.metadata?.externalResources?.find(
            item =>
              item.externalId === log.name ||
              !!item.logs?.find(l => l.name === log.name),
          )?.cacheStatus;

        const handleClick = () => {
          // Use the resource's index instead of the log index
          onTaskSelected({
            ...taskExecution,
            taskIndex: (log as any).index,
            parentRetryAttempt: taskExecution.id.retryAttempt,
          });
        };

        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
            key={taskLogName}
          >
            <Typography
              variant="body1"
              color={log.uri ? 'primary' : 'textPrimary'}
              onClick={log.uri ? handleClick : undefined}
              className={classnames(
                styles.taskName,
                log.uri ? styles.taskTitleLink : styles.taskTitle,
                className,
              )}
              data-testid="map-task-log"
            >
              {taskLogName}
              <CacheStatus
                cacheStatus={cacheStatus}
                variant="iconOnly"
                className={classnames(styles.taskCacheLogo, className)}
              />
            </Typography>
          </div>
        );
      })}
    </>
  );
};
