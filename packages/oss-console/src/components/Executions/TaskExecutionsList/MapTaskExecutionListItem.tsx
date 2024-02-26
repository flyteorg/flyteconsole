import React from 'react';
import styled from '@mui/system/styled';
import Typography from '@mui/material/Typography';
import classnames from 'classnames';
import Grid from '@mui/material/Grid';
import { PanelSection } from '../../common/PanelSection';
import { useCommonStyles } from '../../common/styles';
import { TaskExecutionPhase } from '../../../models/Execution/enums';
import { MapTaskExecution, TaskExecution } from '../../../models/Execution/types';
import { MapTaskStatusInfo } from '../../common/MapTaskExecutionsList/MapTaskStatusInfo';
import { TaskExecutionDetails } from './TaskExecutionDetails';
import { TaskExecutionError } from './TaskExecutionError';
import { TaskExecutionLogs } from './TaskExecutionLogs';
import { formatRetryAttempt, getGroupedExternalResources } from './utils';
import { RENDER_ORDER } from './constants';
import { isMapTaskV1 } from '../../../models/Task/utils';

const MapTaskExecutionsListItemContainer = styled(PanelSection)(({ theme }) => ({
  '.detailsLink': {
    fontWeight: 'normal',
  },
  '.header': {
    marginBottom: theme.spacing(1),
  },
  '.title': {
    marginBottom: theme.spacing(1),
  },
  '.showDetailsButton': {
    marginTop: theme.spacing(1),
  },
  '.section': {
    marginBottom: theme.spacing(2),
  },
}));

interface MapTaskExecutionsListItemProps {
  taskExecution: TaskExecution;
  showAttempts: boolean;
  onTaskSelected: (val: MapTaskExecution) => void;
  selectedPhase?: TaskExecutionPhase;
}

/** Renders an individual `TaskExecution` record as part of a list */
export const MapTaskExecutionsListItem: React.FC<MapTaskExecutionsListItemProps> = ({
  taskExecution,
  showAttempts,
  onTaskSelected,
  selectedPhase,
}) => {
  const commonStyles = useCommonStyles();

  const {
    closure: {
      error,
      startedAt,
      updatedAt,
      duration,
      phase,
      logs,
      metadata,
      eventVersion,
      taskType,
    },
    id: { retryAttempt },
  } = taskExecution;
  const taskHasStarted = phase >= TaskExecutionPhase.QUEUED;
  const headerText = formatRetryAttempt(retryAttempt);
  const externalResourcesByPhase = getGroupedExternalResources(metadata?.externalResources ?? []);

  const isMapTask = isMapTaskV1(
    eventVersion!,
    metadata?.externalResources?.length ?? 0,
    taskType ?? undefined,
  );

  return (
    <MapTaskExecutionsListItemContainer>
      {/* Attempts header is shown only if there is more than one attempt */}
      {showAttempts ? (
        <Grid item xs={12} className="section">
          <header className="header">
            <Typography variant="h6" className={classnames('title', commonStyles.textWrapped)}>
              {headerText}
            </Typography>
          </header>
        </Grid>
      ) : null}
      {/* Error info is shown only if there is an error present for this map task */}
      {error ? (
        <Grid item xs={12} className="section">
          <TaskExecutionError error={error} />
        </Grid>
      ) : null}
      {/* If main map task has log attached - show it here */}
      {logs && logs.length > 0 ? (
        <Grid item xs={12} className="section">
          <TaskExecutionLogs taskLogs={logs || []} title="Task Log" />
        </Grid>
      ) : null}
      {/* child/array logs separated by subtasks phase */}
      {RENDER_ORDER.map((phase, id) => {
        const externalResourcesBucket = externalResourcesByPhase?.get(phase);
        if (!externalResourcesBucket) {
          return null;
        }
        const key = `${id}-${phase}`;
        return (
          <MapTaskStatusInfo
            taskExecution={taskExecution}
            phase={phase}
            externalResourcesByPhase={externalResourcesBucket}
            selectedPhase={selectedPhase}
            key={key}
            onTaskSelected={onTaskSelected}
          />
        );
      })}
      {/* If map task is actively started - show 'started' and 'run time' details */}
      {taskHasStarted && !isMapTask && (
        <Grid item xs={12} className="section">
          <TaskExecutionDetails startedAt={startedAt} updatedAt={updatedAt} duration={duration} />
        </Grid>
      )}
    </MapTaskExecutionsListItemContainer>
  );
};
