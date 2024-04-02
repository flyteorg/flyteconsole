import React, { useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Shimmer from '@clients/primitives/Shimmer';
import {
  ActiveLaunchPlanDisplayValueEnum,
  getTriggerDisplayValue,
  getTriggerTooltipValues,
} from './LaunchPlanCells';
import { StatusBadge } from '../../Executions/StatusBadge';
import { LaunchPlanState } from '../../../models/Launch/types';
import { LaunchPlanVersionDetails } from './LaunchPlanVersionDetails';
import { ResourceIdentifier } from '../../../models/Common/types';
import { useLatestActiveLaunchPlan } from '../hooks/useLatestActiveLaunchPlan';
import { useLatestScheduledLaunchPlans } from '../hooks/useLatestScheduledLaunchPlans';
import { hasAnyEvent } from '../utils';

export interface ScheduleDetailsProps {
  id: ResourceIdentifier;
}
export const ScheduleDetails: React.FC<ScheduleDetailsProps> = ({ id }) => {
  const activeScheduleLaunchPlanQuery = useLatestActiveLaunchPlan({
    id,
  });

  const activeScheduleLaunchPlan = useMemo(() => {
    return activeScheduleLaunchPlanQuery.data?.entities?.[0];
  }, [activeScheduleLaunchPlanQuery]);

  const scheduledLaunchPlansQuery = useLatestScheduledLaunchPlans({
    id,
    limit: 1,
  });

  const scheduledLaunchPlan = useMemo(() => {
    return scheduledLaunchPlansQuery.data?.entities?.[0];
  }, [scheduledLaunchPlansQuery]);

  const isActive = activeScheduleLaunchPlan?.closure?.state === LaunchPlanState.ACTIVE;

  const eventDisplayValue = getTriggerDisplayValue(activeScheduleLaunchPlan);
  const eventToolTipValue = getTriggerTooltipValues(activeScheduleLaunchPlan);

  const hasEvent = hasAnyEvent(scheduledLaunchPlan);

  return activeScheduleLaunchPlanQuery.isFetched ? (
    isActive ? (
      <>
        <Grid
          item
          sx={{
            maxWidth: '60px',
            flexGrow: '0',
            flexShrink: '0',
          }}
        >
          <StatusBadge
            text={ActiveLaunchPlanDisplayValueEnum.ACTIVE}
            className="background-status-succeeded launchPlan"
          />
        </Grid>

        <Grid
          item
          sx={{
            flex: '1 1 auto',
            minWidth: 0, // Allow to shrink below its content width
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '50%',
            width: '1%',
            alignItems: 'center',
            marginRight: (theme) => theme.spacing(1),
            marginLeft: (theme) => theme.spacing(1),
          }}
        >
          {hasEvent ? (
            <Tooltip title={eventToolTipValue}>
              <Typography
                variant="body2"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {eventDisplayValue}
              </Typography>
            </Tooltip>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ pr: (theme) => theme.spacing(2) }}
            >
              No Trigger
            </Typography>
          )}
        </Grid>

        <Grid item sx={{ flex: '0 1 auto', whiteSpace: 'nowrap' }}>
          <LaunchPlanVersionDetails activeScheduleLaunchPlan={activeScheduleLaunchPlan} />
        </Grid>
      </>
    ) : (
      <Typography variant="body2" color="text.secondary">
        No active launch plans
      </Typography>
    )
  ) : (
    <Shimmer />
  );
};
