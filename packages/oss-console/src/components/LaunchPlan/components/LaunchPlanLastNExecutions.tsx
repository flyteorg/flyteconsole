import React, { FC, useMemo } from 'react';
import Shimmer from '@clients/primitives/Shimmer';
import { useQueryClient } from 'react-query';
import { makeFilterableWorkflowExecutionsQuery } from '../../../queries/workflowQueries';
import { LaunchPlan } from '../../../models/Launch/types';
import { formatDateUTC } from '../../../common/formatters';
import { padExecutionPaths, padExecutions, timestampToDate } from '../../../common/utils';
import ProjectStatusBar from '../../ListProjectEntities/ProjectStatusBar';
import { REQUEST_CONFIG } from '../../Entities/EntityDetails';
import { executionFilterGenerator } from '../../Entities/generators';
import { ResourceIdentifier, ResourceType } from '../../../models/Common/types';
import { ExecutionMode } from '../../../models/Execution/enums';
import { useConditionalQuery } from '../../hooks/useConditionalQuery';

type LaunchPlanLastNExecutionsProps = {
  launchPlan?: LaunchPlan;
  showLastExecutionOnly?: boolean;
  inView: boolean;
};

/** The view component for displaying thelaunch plan's details of last execution or last 10 exeuctions */
export const LaunchPlanLastNExecutions: FC<LaunchPlanLastNExecutionsProps> = ({
  launchPlan,
  showLastExecutionOnly = false,
  inView,
}: LaunchPlanLastNExecutionsProps) => {
  const queryClient = useQueryClient();
  const { id } = launchPlan || {};

  // Build request config for the latest workflow version
  const requestConfig = React.useMemo(
    () => ({
      ...REQUEST_CONFIG,
      filter: executionFilterGenerator[id?.resourceType || ResourceType.LAUNCH_PLAN](
        id as ResourceIdentifier,
      ),
    }),
    [id],
  );

  const launchPlanExecutions = useConditionalQuery(
    {
      ...makeFilterableWorkflowExecutionsQuery(queryClient, id!, requestConfig),
      enabled: id && inView,
    },
    (prev) => !prev && inView,
  );

  const executionsMeta = useMemo(() => {
    const returnObj = {
      isLoading: !launchPlanExecutions.isFetched,
      isError: launchPlanExecutions.isError,
      lastExecutionTime: undefined,
      executionStatus: undefined,
      executionIds: undefined,
    };

    const workflowExecutions = (launchPlanExecutions.data?.entities || []).filter(
      (e) => e.spec.metadata.mode === ExecutionMode.SCHEDULED,
    );
    if (!workflowExecutions?.length) {
      return returnObj;
    }

    const mostRecentScheduledexecution = workflowExecutions.at(0);
    const createdAt =
      mostRecentScheduledexecution?.spec.metadata.scheduledAt ||
      mostRecentScheduledexecution?.closure?.createdAt!;
    const lastExecutionTime = formatDateUTC(timestampToDate(createdAt));
    const executionStatus = workflowExecutions.map((execution) => execution.closure.phase);

    const executionIds = workflowExecutions.map((execution) => execution.id);
    return { ...returnObj, lastExecutionTime, executionStatus, executionIds };
  }, [launchPlanExecutions]);

  if (!launchPlan || executionsMeta.isLoading) {
    return <Shimmer />;
  }

  return showLastExecutionOnly ? (
    <>{executionsMeta.lastExecutionTime || <em>No executions found</em>}</>
  ) : (
    <ProjectStatusBar
      items={padExecutions(executionsMeta.executionStatus || [])}
      paths={padExecutionPaths(executionsMeta.executionIds || [])}
    />
  );
};
