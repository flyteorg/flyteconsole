import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ResourceIdentifier } from '../../../models/Common/types';
import { LaunchPlanScheduleContextMenu } from './LaunchPlanScheduleContextMenu';
import { ScheduleDetails } from './ScheduleDetails';

export interface LaunchPlanDetailsHeaderProps {
  id: ResourceIdentifier;
}
export const LaunchPlanDetailsHeader = ({ id }: LaunchPlanDetailsHeaderProps) => {
  return (
    <Grid>
      {/*
      HEADER
      */}
      <Grid
        container
        direction="row"
        sx={{
          width: '100%',
          justifyContent: 'space-between',
          paddingBottom: (theme) => theme.spacing(0.5),
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Grid item sx={{ paddingBottom: (theme) => theme.spacing(0.5) }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Active launch plan
          </Typography>
        </Grid>
        <Grid data-testid="launch-plan-CTAs" item alignContent="flex-end">
          <LaunchPlanScheduleContextMenu id={id} />
        </Grid>
      </Grid>

      {/*
       DETAILS
       */}
      <Grid
        direction="row"
        sx={{
          width: '100%',
          minWidth: 300,
          maxWidth: 600,
          paddingTop: (theme) => theme.spacing(1),
        }}
      >
        <Grid
          container
          direction="row"
          sx={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <ScheduleDetails id={id} />
        </Grid>
      </Grid>
    </Grid>
  );
};
