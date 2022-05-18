import * as React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { MapTaskExecution } from 'models/Execution/types';
import { TaskExecutionPhase } from 'models/Execution/enums';
import { formatRetryAttempt, getTaskRetryAtemptsForIndex } from './utils';
import { TaskExecutionLogsCard } from './TaskExecutionLogsCard';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

interface MapTaskExecutionDetailsProps {
  taskExecution: MapTaskExecution;
}

/** Renders an individual map task execution attempts as part of a list */
export const MapTaskExecutionDetails: React.FC<MapTaskExecutionDetailsProps> = ({
  taskExecution,
}) => {
  const styles = useStyles();
  const {
    closure: { metadata },
    taskIndex,
  } = taskExecution;

  const filteredResources = getTaskRetryAtemptsForIndex(
    metadata?.externalResources ?? [],
    taskIndex,
  );

  return (
    <>
      {filteredResources.map((item) => {
        const attempt = item.retryAttempt ?? 0;
        const headerText = formatRetryAttempt(attempt);

        return (
          <div className={styles.wrapper} key={`card-${attempt}`}>
            <TaskExecutionLogsCard
              taskExecution={taskExecution}
              headerText={headerText}
              phase={item.phase ?? TaskExecutionPhase.UNDEFINED}
              logs={item.logs ?? []}
            />
          </div>
        );
      })}
    </>
  );
};
