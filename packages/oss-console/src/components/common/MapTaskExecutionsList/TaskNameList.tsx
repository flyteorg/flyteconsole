import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import styled from '@mui/system/styled';
import Event from '@clients/common/flyteidl/event';
import classnames from 'classnames';
import { getTaskLogName } from '../../Executions/TaskExecutionsList/utils';
import { MapTaskExecution, TaskExecution } from '../../../models/Execution/types';
import { noLogsFoundString } from '../../Executions/constants';
import { CacheStatus } from '../../Executions/CacheStatus';
import { useCommonStyles } from '../styles';

const TaskLogContainer = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',

  '& .taskName': {
    lineHeight: 2,
    overflowWrap: 'anywhere',
  },

  '& .taskTitle': {
    cursor: 'default',
    '&:hover': {
      textDecoration: 'none',
    },
  },

  '& .taskTitleLink': {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },

  '& .taskCacheLogo': {
    verticalAlign: 'middle',
    position: 'relative',
    left: 0,
  },
}));

interface TaskNameListProps {
  taskExecution: TaskExecution;
  externalResourcesByPhase: Event.IExternalResourceInfo[];
  onTaskSelected: (val: MapTaskExecution) => void;
  className?: string;
}

export const TaskNameList = ({
  taskExecution,
  externalResourcesByPhase,
  onTaskSelected,
  className,
}: TaskNameListProps) => {
  const commonStyles = useCommonStyles();

  const dataSources = externalResourcesByPhase ?? [];

  if (externalResourcesByPhase.length === 0) {
    return <span className={commonStyles.hintText}>{noLogsFoundString}</span>;
  }

  return (
    <>
      {dataSources.map((dataSource, _taskIndex) => {
        const taskLogName = getTaskLogName(
          taskExecution.id.taskId.name,
          dataSource?.logs?.at(0)?.name ?? '',
        );

        const cacheStatus =
          dataSource?.cacheStatus !== null || undefined ? dataSource.cacheStatus : undefined;

        const handleClick = () => {
          // Use the resource's index instead of the log index
          onTaskSelected({
            ...taskExecution,
            taskIndex: dataSource.index || 0,
            parentRetryAttempt: taskExecution.id.retryAttempt,
          });
        };

        const logWithUri = dataSource?.logs ? dataSource.logs.findIndex((log) => log.uri) : -1;
        const isLogUriPresent = logWithUri > -1;

        return (
          <TaskLogContainer
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
            key={taskLogName}
          >
            <Box mr={1} width={(t) => t.spacing(4)}>
              <CacheStatus
                cacheStatus={cacheStatus}
                variant="iconOnly"
                className={classnames('taskCacheLogo', className)}
              />
            </Box>
            <Button
              variant="text"
              color="primary"
              onClick={isLogUriPresent ? handleClick : undefined}
              disabled={!isLogUriPresent}
              size="small"
              className={classnames(
                'taskName',
                isLogUriPresent ? 'taskTitleLink' : 'taskTitle',
                className,
              )}
              data-testid="map-task-log"
              sx={{
                color: (theme) =>
                  !isLogUriPresent
                    ? `${theme.palette.info.main} !important`
                    : theme.palette.primary.main,
                textAlign: 'left',
                lineHeight: '1em',
              }}
            >
              <span>{taskLogName}</span>
            </Button>
          </TaskLogContainer>
        );
      })}
    </>
  );
};
