import Typography from '@mui/material/Typography';
import React, { useMemo } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import { useInView } from 'react-intersection-observer';
import { makeFilterableWorkflowExecutionsQuery } from '@clients/oss-console/queries/workflowQueries';
import { useQueryClient } from 'react-query';
import Shimmer from '@clients/primitives/Shimmer';
import { formatDateUTC } from '@clients/oss-console/common/formatters';
import { timestampToDate } from '@clients/oss-console/common/utils';
import moment from 'moment';
import { FilterOperationName } from '@clients/common/types/adminEntityTypes';
import t from './strings';
import { getRawScheduleStringFromLaunchPlan } from './EntitySchedules';
import { getScheduleStringFromLaunchPlan } from './getScheduleStringFromLaunchPlan';
import { LaunchPlan } from '../../models/Launch/types';
import { useCommonStyles } from '../common/styles';
import { Routes } from '../../routes/routes';
import { executionFilterGenerator } from './generators';
import { useConditionalQuery } from '../hooks/useConditionalQuery';
import { ResourceIdentifier, ResourceType } from '../../models/Common/types';
import { ExecutionMode } from '../../models/Execution/enums';
import { getNextExecutionTimeMilliseconds } from '../LaunchPlan/utils';
import { CREATED_AT_DESCENDING_SORT } from '../../models/Launch/constants';

export interface ScheduleFrequencyProps {
  launchPlan: LaunchPlan;
}
export const ScheduleFrequency = ({ launchPlan }: ScheduleFrequencyProps) => {
  const commonStyles = useCommonStyles();

  const { scheduleDisplayValue, scheduleRawValue } = useMemo(() => {
    const scheduleDisplayValue = getScheduleStringFromLaunchPlan(launchPlan);
    const scheduleRawValue = getRawScheduleStringFromLaunchPlan(launchPlan);
    return { scheduleDisplayValue: scheduleDisplayValue || t('noValue'), scheduleRawValue };
  }, [launchPlan]);

  return (
    <Tooltip title={`${scheduleDisplayValue} (${scheduleRawValue})`} placement="bottom-start">
      <Grid container direction="column">
        <Grid
          item
          className={commonStyles.truncateText}
          sx={{
            width: '100%',
          }}
        >
          <Typography variant="body2" className={commonStyles.truncateText}>
            {scheduleDisplayValue}
          </Typography>
        </Grid>
        <Grid
          item
          className={commonStyles.truncateText}
          sx={{
            width: '100%',
          }}
        >
          <Typography variant="label" color="textSecondary" className={commonStyles.truncateText}>
            {scheduleRawValue}
          </Typography>
        </Grid>
      </Grid>
    </Tooltip>
  );
};

export interface LaunchPlanNameProps {
  launchPlan: LaunchPlan;
}

export const LaunchPlanName = ({ launchPlan }: LaunchPlanNameProps) => {
  const commonStyles = useCommonStyles();
  const url = Routes.LaunchPlanDetails.makeUrl(
    launchPlan.id.project,
    launchPlan.id.domain,
    launchPlan.id.name,
  );
  return (
    <Tooltip title={`${launchPlan.id.name} (${launchPlan.id.version})`} placement="bottom-start">
      <Grid container direction="column">
        <Grid
          item
          className={commonStyles.truncateText}
          sx={{
            width: '100%',
          }}
        >
          <Link
            href={url}
            variant="body2"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {launchPlan.id.name}
          </Link>
        </Grid>
        <Grid
          item
          className={commonStyles.truncateText}
          sx={{
            width: '100%',
          }}
        >
          <Typography variant="label" color="textSecondary" className={commonStyles.truncateText}>
            {launchPlan.id.version}
          </Typography>
        </Grid>
      </Grid>
    </Tooltip>
  );
};

export interface LaunchPlanLastRunProps {
  launchPlan: LaunchPlan;
}

export const LaunchPlanLastRun = ({ launchPlan }: LaunchPlanLastRunProps) => {
  const commonStyles = useCommonStyles();
  const queryClient = useQueryClient();
  const [inViewRef, inView] = useInView();

  const { workflowId } = launchPlan.spec;

  // Build request config for the latest workflow version
  const requestConfig = React.useMemo(() => {
    const filter = executionFilterGenerator[workflowId.resourceType || ResourceType.LAUNCH_PLAN](
      workflowId as ResourceIdentifier,
      workflowId.version,
    );
    filter.push({
      key: 'mode',
      operation: FilterOperationName.EQ,
      value: ExecutionMode.SCHEDULED,
    });
    return {
      filter,
      sort: CREATED_AT_DESCENDING_SORT,
      limit: 1,
    };
  }, [workflowId]);

  const mostRecentlpVersionExecutionsQuery = useConditionalQuery(
    {
      ...makeFilterableWorkflowExecutionsQuery(queryClient, workflowId, requestConfig),
      enabled: inView,
    },
    (prev) => !prev,
  );

  const scheduledExecutions = (mostRecentlpVersionExecutionsQuery.data?.entities || []).filter(
    (e) => e.spec.metadata.mode === ExecutionMode.SCHEDULED,
  );
  const latestScheduledExecution = scheduledExecutions?.[0];

  const createdAt = latestScheduledExecution?.closure.createdAt;
  const relativeStartTime = latestScheduledExecution
    ? moment(timestampToDate(createdAt)).fromNow()
    : undefined;
  const startTime = latestScheduledExecution
    ? formatDateUTC(timestampToDate(createdAt))
    : undefined;

  return (
    <div ref={inViewRef}>
      {mostRecentlpVersionExecutionsQuery.isFetched ? (
        <Tooltip title={`${relativeStartTime} (${startTime})`} placement="bottom-start">
          <Grid container direction="column">
            <Grid
              item
              className={commonStyles.truncateText}
              sx={{
                width: '100%',
              }}
            >
              <Typography variant="body2" className={commonStyles.truncateText}>
                {relativeStartTime}
              </Typography>
            </Grid>
            <Grid
              item
              className={commonStyles.truncateText}
              sx={{
                width: '100%',
              }}
            >
              <Typography
                variant="label"
                className={commonStyles.truncateText}
                color="textSecondary"
              >
                {startTime}
              </Typography>
            </Grid>
          </Grid>
        </Tooltip>
      ) : (
        <Shimmer />
      )}
    </div>
  );
};

type LaunchPlanNextPotentialExecutionProps = {
  launchPlan: LaunchPlan;
};

/** The view component for displaying thelaunch plan's details of last execution or last 10 exeuctions */
export const LaunchPlanNextPotentialExecution = ({
  launchPlan,
}: LaunchPlanNextPotentialExecutionProps) => {
  const commonStyles = useCommonStyles();
  const queryClient = useQueryClient();
  const [inViewRef, inView] = useInView();

  const { workflowId } = launchPlan.spec;

  // Build request config for the latest workflow version
  const requestConfig = React.useMemo(() => {
    const filter = executionFilterGenerator[workflowId.resourceType || ResourceType.LAUNCH_PLAN](
      workflowId as ResourceIdentifier,
      workflowId.version,
    );
    filter.push({
      key: 'mode',
      operation: FilterOperationName.EQ,
      value: ExecutionMode.SCHEDULED,
    });
    return {
      filter,
      sort: CREATED_AT_DESCENDING_SORT,
      limit: 1,
    };
  }, [workflowId]);

  const mostRecentlpVersionExecutionsQuery = useConditionalQuery(
    {
      ...makeFilterableWorkflowExecutionsQuery(queryClient, workflowId, requestConfig),
      enabled: inView,
    },
    (prev) => !prev,
  );

  const scheduledExecutions = (mostRecentlpVersionExecutionsQuery.data?.entities || []).filter(
    (e) => e.spec.metadata.mode === ExecutionMode.SCHEDULED,
  );
  const latestScheduledExecution = scheduledExecutions?.[0];
  // get next potential execution time based on the most recent scheduled execution
  const nextPotentialExecutionTime =
    latestScheduledExecution &&
    getNextExecutionTimeMilliseconds(latestScheduledExecution, launchPlan);
  const nextPotentialExecutionDate =
    nextPotentialExecutionTime && new Date(nextPotentialExecutionTime);
  const nextPotentialExecutionTimeStr = nextPotentialExecutionDate ? (
    formatDateUTC(nextPotentialExecutionDate)
  ) : (
    <em>N/A</em>
  );

  const relativeStartTime = nextPotentialExecutionDate ? (
    moment(nextPotentialExecutionDate).fromNow()
  ) : (
    <em>N/A</em>
  );
  return (
    <div ref={inViewRef}>
      {mostRecentlpVersionExecutionsQuery.isFetched ? (
        <Tooltip
          title={`${relativeStartTime} (${nextPotentialExecutionTimeStr})`}
          placement="bottom-start"
        >
          <Grid container direction="column">
            <Grid
              item
              className={commonStyles.truncateText}
              sx={{
                width: '100%',
              }}
            >
              <Typography variant="body2" className={commonStyles.truncateText}>
                {relativeStartTime}
              </Typography>
            </Grid>
            <Grid
              item
              className={commonStyles.truncateText}
              sx={{
                width: '100%',
              }}
            >
              <Typography
                variant="label"
                className={commonStyles.truncateText}
                color="textSecondary"
              >
                {nextPotentialExecutionTimeStr}
              </Typography>
            </Grid>
          </Grid>
        </Tooltip>
      ) : (
        <Shimmer />
      )}
    </div>
  );
};
