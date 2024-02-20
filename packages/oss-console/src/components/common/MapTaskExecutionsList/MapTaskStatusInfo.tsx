import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Event from '@clients/common/flyteidl/event';
import { RowExpander } from '../../Executions/Tables/RowExpander';
import { TaskExecutionPhase } from '../../../models/Execution/enums';
import { getTaskExecutionPhaseConstants } from '../../Executions/utils';
import { MapTaskExecution, TaskExecution } from '../../../models/Execution/types';
import { TaskNameList } from './TaskNameList';

interface MapTaskStatusInfoProps {
  taskExecution: TaskExecution;
  externalResourcesByPhase: Event.IExternalResourceInfo[];
  phase: TaskExecutionPhase;
  selectedPhase?: TaskExecutionPhase;
  onTaskSelected: (val: MapTaskExecution) => void;
}

export const MapTaskStatusInfo = ({
  taskExecution,
  externalResourcesByPhase,
  phase,
  selectedPhase,
  onTaskSelected,
}: MapTaskStatusInfoProps) => {
  const [expanded, setExpanded] = useState<boolean>(selectedPhase === phase);

  const phaseData = getTaskExecutionPhaseConstants(phase);

  useEffect(() => {
    setExpanded(selectedPhase === phase);
  }, [selectedPhase, phase]);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const externalResources = externalResourcesByPhase ?? [];

  return (
    <>
      <Grid
        item
        alignItems="center"
        xs={12}
        sx={{
          top: 0,
          height: (theme) => theme.spacing(2),
          position: 'sticky',
          backgroundColor: (theme) => theme.palette.background.paper,
          zIndex: 1,
          // magic number to align with text height and fade out
          maxHeight: '3.5em',
          '&:after': {
            content: '""',
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            height: (theme) => theme.spacing(1),
            backgroundColor: 'transparent',
            backgroundImage: (theme) =>
              `linear-gradient(${theme.palette.background.paper}, transparent)`,
            zIndex: 1,
          },
        }}
      >
        <Grid container justifyContent="space-between">
          <Grid item xs={8}>
            <Grid container alignItems="center">
              <Grid item>
                <RowExpander expanded={expanded} onClick={toggleExpanded} />
              </Grid>
              <Grid item>
                <Box
                  sx={{
                    height: (theme) => theme.spacing(2.5),
                    borderLeft: (theme) =>
                      `solid ${theme.spacing(0.5)} ${phaseData.badgeColor ?? 'red'}`,
                    margin: (theme) => theme.spacing(0, 0.5, 0, 1),
                  }}
                />
              </Grid>
              <Grid item>
                <Typography variant="body2" className="title">
                  {phaseData.text}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item alignSelf="center">
            <span>{`×${externalResources.length} `}</span>
          </Grid>
        </Grid>
      </Grid>
      {expanded && (
        <Grid item className="logs">
          <TaskNameList
            taskExecution={taskExecution}
            externalResourcesByPhase={externalResources}
            onTaskSelected={onTaskSelected}
          />
        </Grid>
      )}
    </>
  );
};
