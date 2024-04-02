import React, { FC, useMemo } from 'react';
import Shimmer from '@clients/primitives/Shimmer';
import { useQueryClient } from 'react-query';
import { makeFilterableWorkflowExecutionsQuery } from '../../../queries/workflowQueries';
import { formatDateUTC } from '../../../common/formatters';
import { padExecutionPaths, padExecutions, timestampToDate } from '../../../common/utils';
import ProjectStatusBar from '../../ListProjectEntities/ProjectStatusBar';
import { REQUEST_CONFIG } from '../../Entities/EntityDetails';
import { executionFilterGenerator } from '../../Entities/generators';
import { NamedEntityIdentifier, ResourceType } from '../../../models/Common/types';
import { useConditionalQuery } from '../../hooks/useConditionalQuery';

type LaunchPlanLastNExecutionsProps = {
  id: NamedEntityIdentifier;
  showLastExecutionOnly?: boolean;
  inView: boolean;
};

/** The view component for displaying thelaunch plan's details of last execution or last 10 exeuctions */
export const LaunchPlanLastNExecutions: FC<LaunchPlanLastNExecutionsProps> = ({
  id,
  showLastExecutionOnly = false,
  inView,
}: LaunchPlanLastNExecutionsProps) => {
  const queryClient = useQueryClient();

  const filter = executionFilterGenerator[ResourceType.LAUNCH_PLAN](id as any);
  // Build request config for the latest workflow version
  const requestConfig = React.useMemo(
    () => ({
      ...REQUEST_CONFIG,
      filter,
    }),
    [id],
  );

  const launchPlanExecutionsQuery = useConditionalQuery(
    {
      ...makeFilterableWorkflowExecutionsQuery(queryClient, id!, requestConfig),
      enabled: id && inView,
    },
    (prev) => !prev && inView,
  );

  const executionsMeta = useMemo(() => {
    const returnObj = {
      isLoading: !launchPlanExecutionsQuery.isFetched,
      isError: launchPlanExecutionsQuery.isError,
      lastExecutionTime: undefined,
      executionStatus: undefined,
      executionIds: undefined,
    };

    const launchPlanExecutions = launchPlanExecutionsQuery.data?.entities || [];
    if (!launchPlanExecutions?.length) {
      return returnObj;
    }

    const mostRecentScheduledexecution = launchPlanExecutions.at(0);
    const createdAt =
      mostRecentScheduledexecution?.spec.metadata.scheduledAt ||
      mostRecentScheduledexecution?.closure?.createdAt!;
    const lastExecutionTime = formatDateUTC(timestampToDate(createdAt));
    const executionStatus = launchPlanExecutions.map((execution) => execution.closure.phase);

    const executionIds = launchPlanExecutions.map((execution) => execution.id);
    return { ...returnObj, lastExecutionTime, executionStatus, executionIds };
  }, [launchPlanExecutionsQuery]);

  return executionsMeta.isLoading ? (
    <Shimmer />
  ) : showLastExecutionOnly ? (
    <>{executionsMeta.lastExecutionTime || <em>No executions found</em>}</>
  ) : (
    <ProjectStatusBar
      items={padExecutions(executionsMeta.executionStatus || [])}
      paths={padExecutionPaths(executionsMeta.executionIds || [])}
    />
  );
};
