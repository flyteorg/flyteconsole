import React, { useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import WarningText from '@clients/primitives/WarningText';
import Shimmer from '@clients/primitives/Shimmer';

import { LaunchPlan } from '../../../models/Launch/types';
import { useLatestLaunchPlans } from '../hooks/useLatestLaunchPlans';

export interface LaunchPlanVersionDetailsProps {
  activeScheduleLaunchPlan: LaunchPlan;
}
export const LaunchPlanVersionDetails = ({
  activeScheduleLaunchPlan,
}: LaunchPlanVersionDetailsProps) => {
  const latestLaunchPlanQuery = useLatestLaunchPlans({
    id: activeScheduleLaunchPlan.id,
    limit: 1,
  });

  const latestLaunchPlan = useMemo(() => {
    return latestLaunchPlanQuery.data?.entities?.[0];
  }, [latestLaunchPlanQuery]);
  const isLatestVersionActive =
    latestLaunchPlan?.id?.version === activeScheduleLaunchPlan?.id?.version;

  return latestLaunchPlanQuery.isFetched ? (
    <Grid
      data-testid="launch-plan-version-details"
      container
      sx={{
        flex: 'auto',
        whiteSpace: 'nowrap',
        alignItems: 'center',
      }}
    >
      <Grid
        item
        data-testid="launch-plan-version"
        direction="row"
        sx={{ alignItems: 'center', maxWidth: 300 }}
      >
        <WarningText
          text={activeScheduleLaunchPlan?.id?.version}
          showWarningIcon={!isLatestVersionActive}
          tooltipText={isLatestVersionActive ? '' : 'Not using latest'}
        />
      </Grid>
      {isLatestVersionActive ? (
        <Grid
          item
          data-testid="launch-plan-latest-chip"
          sx={{ marginLeft: (theme) => theme.spacing(1) }}
        >
          <Chip
            sx={{
              backgroundColor: (theme) => theme.palette.common.primary.union200,
              borderRadius: (theme) => theme.spacing(0.5),
              color: (theme) => theme.palette.common.primary.black,

              '& .MuiChip-label': {
                fontSize: (theme) => theme.spacing(1.5),
                padding: (theme) => theme.spacing(0.75, 0.75),
              },
            }}
            variant="filled"
            size="small"
            label="Latest"
          />
        </Grid>
      ) : null}
    </Grid>
  ) : (
    <Shimmer />
  );
};
