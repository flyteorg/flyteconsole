import Shimmer from '@clients/primitives/Shimmer';
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import Tooltip from '@mui/material/Tooltip';
import React, { forwardRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import LaunchPlansLogo from '@clients/ui-atoms/LaunchPlansLogo';
import Grid from '@mui/material/Grid';
import Icon from '@mui/material/Icon';
import { useQueryClient } from 'react-query';
import Typography from '@mui/material/Typography';
import { LaunchPlan, LaunchPlanState } from '../../../models/Launch/types';
import { NamedEntity, NamedEntityIdentifier } from '../../../models/Common/types';
import {
  SearchResult,
  createHighlightedEntitySearchResult,
} from '../../common/useSearchableListState';
import { Routes } from '../../../routes/routes';

import { getRawScheduleStringFromLaunchPlan } from '../../Entities/EntitySchedules';
import { getScheduleStringFromLaunchPlan } from '../../Entities/getScheduleStringFromLaunchPlan';
import t from '../../common/strings';
import { useConditionalQuery } from '../../hooks/useConditionalQuery';
import { CREATED_AT_DESCENDING_SORT } from '../../../models/Launch/constants';
import {
  castLaunchPlanIdAsQueryKey,
  makeListLaunchPlansQuery,
} from '../../../queries/launchPlanQueries';
import { StatusBadge } from '../../Executions/StatusBadge';
import { useLatestActiveLaunchPlan } from '../hooks/useLatestActiveLaunchPlan';
import { useLatestScheduledLaunchPlans } from '../hooks/useLatestScheduledLaunchPlans';
import { hasAnyEvent } from '../utils';
import { useSearchRowRefreshContext } from '../LaunchPlanTable/LaunchPlanTableRow';
import { QueryType } from '../../data/types';

export interface WorkflowNameProps {
  launchPlan?: LaunchPlan;
  isFetched: boolean;
}

export const WorkflowName = ({ launchPlan, isFetched }: WorkflowNameProps) => {
  if (!isFetched || launchPlan == null) {
    return <Shimmer />;
  }
  return (
    <Tooltip title={launchPlan.spec.workflowId.name}>
      <ListItemButton
        href={Routes.WorkflowDetails.makeUrl(
          launchPlan.id.project,
          launchPlan.id.domain,
          launchPlan.spec.workflowId.name,
        )}
        LinkComponent={forwardRef((props, ref) => {
          return <Link to={props?.href} ref={ref} {...props} />;
        })}
      >
        <Box
          sx={{
            // text wrap
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          {launchPlan.spec.workflowId.name}
        </Box>
      </ListItemButton>
    </Tooltip>
  );
};

interface LaunchPlanNameProps
  extends Pick<SearchResult<NamedEntity>, 'value' | 'result' | 'content'> {
  inView: boolean;
}
/**
 * Renders individual searchable launchPlan item
 * @param searchResult
 * @returns
 */

export const LaunchPlanName: React.FC<LaunchPlanNameProps> = ({ result, content, inView }) => {
  const finalContent = useMemo(() => {
    return result && inView ? createHighlightedEntitySearchResult(result) : content;
  }, [result, content, inView]);

  return (
    <Grid container data-testid="launch-plan-name">
      <Grid item xs={12}>
        <Tooltip title={content} placement="bottom">
          <Grid container>
            <Grid item sx={{ height: '24px', paddingRight: (theme) => theme.spacing(2) }}>
              <Icon
                sx={{
                  '& svg': {
                    color: (theme) => theme.palette.common.grays[40],
                    width: '20px',
                  },
                }}
              >
                <LaunchPlansLogo />
              </Icon>
            </Grid>
            <Grid
              item
              alignSelf="center"
              sx={{
                width: (theme) => `calc(100% - 24px - ${theme.spacing(2)})`,
                // text wrap
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              <span>{finalContent}</span>
            </Grid>
          </Grid>
        </Tooltip>
      </Grid>
    </Grid>
  );
};

export interface ScheduleStatusProps {
  launchPlan?: LaunchPlan;
  refetch: () => void;
}
export const enum ActiveLaunchPlanDisplayValueEnum {
  NO_SCHEDULE = '-',
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export const getTriggerTooltipValues = (launchPlan: LaunchPlan | undefined) => {
  if (!launchPlan) {
    return t('noValue');
  }
  return getScheduleTooltipValue(launchPlan);
};

export const getTriggerDisplayValue = (launchPlan: LaunchPlan | undefined) => {
  if (!launchPlan) {
    return t('noValue');
  }
  return getScheduleStringFromLaunchPlan(launchPlan);
};

export const getScheduleTooltipValue = (launchPlan: LaunchPlan | undefined) => {
  if (!launchPlan) {
    return t('noValue');
  }
  return `${getScheduleStringFromLaunchPlan(launchPlan)} (${getRawScheduleStringFromLaunchPlan(
    launchPlan,
  )})`;
};
export interface TriggerDisplayValueProps {
  launchPlan?: LaunchPlan;
}
export const TriggerDisplayValue = ({ launchPlan }: TriggerDisplayValueProps) => {
  if (!launchPlan) {
    return <Shimmer />;
  }

  const displayEventValueHeader = useMemo(() => {
    return getTriggerDisplayValue(launchPlan);
  }, [launchPlan]);

  const displayEventValueSub = useMemo(() => {
    return getRawScheduleStringFromLaunchPlan(launchPlan);
  }, [launchPlan]);

  const displayTooltipValue = useMemo(() => {
    return getTriggerTooltipValues(launchPlan);
  }, [launchPlan]);

  return (
    <Tooltip title={displayTooltipValue} placement="bottom-start">
      <Grid container direction="column">
        <Grid
          item
          sx={{
            width: '100%',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              width: '100%',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {displayEventValueHeader}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body2" color="text.secondary">
            {displayEventValueSub}
          </Typography>
        </Grid>
      </Grid>
    </Tooltip>
  );
};
export interface ScheduleStatusSummaryProps {
  id: NamedEntityIdentifier;
  inView: boolean;
}
export const ScheduleStatusSummary = ({ id, inView }: ScheduleStatusSummaryProps) => {
  const queryClient = useQueryClient();
  const { refresh, setRefresh } = useSearchRowRefreshContext();

  /**
   * Invalidate cache to trigger refetch on launchplan data to pickup state change
   */
  useEffect(() => {
    if (refresh) {
      const queryKey = [QueryType.ListLaunchPlans, castLaunchPlanIdAsQueryKey(id)];
      queryClient.invalidateQueries(queryKey);
      setRefresh(false);
    }
  }, [refresh, setRefresh, queryClient, id]);

  const latestLaunchPlanQuery = useConditionalQuery(
    {
      ...makeListLaunchPlansQuery(queryClient, id, {
        sort: CREATED_AT_DESCENDING_SORT,
        limit: 1,
      }),
      enabled: inView,
    },
    (prev) => !prev && !!inView,
  );
  const activeLaunchPlanQuery = useLatestActiveLaunchPlan({
    id,
    enabled: inView,
  });
  const scheduledLaunchPlansQuery = useLatestScheduledLaunchPlans({
    id,
    limit: 1,
    enabled: inView,
  });

  const activeLaunchPlan = useMemo(() => {
    return activeLaunchPlanQuery.data?.entities?.[0];
  }, [activeLaunchPlanQuery]);

  const scheduledLaunchPlan = useMemo(() => {
    return scheduledLaunchPlansQuery.data?.entities?.[0];
  }, [scheduledLaunchPlansQuery]);

  const hasEvent = hasAnyEvent(scheduledLaunchPlan);

  const isActive = activeLaunchPlan?.closure?.state === LaunchPlanState.ACTIVE;

  return !scheduledLaunchPlansQuery.isFetched &&
    !activeLaunchPlanQuery.isFetched &&
    !latestLaunchPlanQuery.isFetched ? (
    <Shimmer />
  ) : isActive ? (
    <Grid
      data-testid="launch-plan-schedule-status-summary"
      container
      alignItems="center"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <Grid
        item
        sx={{
          width: '60px',
          flexShrink: 0,
        }}
      >
        <StatusBadge
          text={ActiveLaunchPlanDisplayValueEnum.ACTIVE}
          className="background-status-succeeded launchPlan"
        />
      </Grid>

      {hasEvent ? (
        <Grid
          item
          sx={{
            width: '1%',
            flexGrow: 1,
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          <TriggerDisplayValue launchPlan={activeLaunchPlan} />
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No Trigger
        </Typography>
      )}
    </Grid>
  ) : (
    <Typography variant="body2" color="text.secondary">
      No active launch plan
    </Typography>
  );
};
