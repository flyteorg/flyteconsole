import React, { FC, useMemo } from 'react';

import Shimmer from '@clients/primitives/Shimmer';
import { useQueryClient } from 'react-query';
import { LaunchPlan, LaunchPlanState } from '../../../models/Launch/types';
import { formatDateUTC } from '../../../common/formatters';
import { REQUEST_CONFIG } from '../../Entities/EntityDetails';
import { getNextExecutionTimeMilliseconds } from '../utils';
import { executionFilterGenerator } from '../../Entities/generators';
import { ResourceIdentifier, ResourceType } from '../../../models/Common/types';
import { ExecutionMode } from '../../../models/Execution/enums';
import { useConditionalQuery } from '../../hooks/useConditionalQuery';
import { makeFilterableWorkflowExecutionsQuery } from '../../../queries/workflowQueries';

type LaunchPlanNextPotentialExecutionProps = {
  launchPlan: LaunchPlan;
};

/** The view component for displaying thelaunch plan's details of last execution or last 10 exeuctions */
export const LaunchPlanNextPotentialExecution: FC<LaunchPlanNextPotentialExecutionProps> = ({
  launchPlan,
}: LaunchPlanNextPotentialExecutionProps) => {
  const queryClient = useQueryClient();
  const { id } = launchPlan || {};

  // Build request config for the latest workflow version
  const requestConfig = React.useMemo(
    () => ({
      ...REQUEST_CONFIG,
      filter: executionFilterGenerator[id.resourceType || ResourceType.LAUNCH_PLAN](
        id as ResourceIdentifier,
        id.version,
      ),
    }),
    [id],
  );

  const mostRecentlpVersionExecutionsQuery = useConditionalQuery(
    { ...makeFilterableWorkflowExecutionsQuery(queryClient, id, requestConfig) },
    (prev) => !prev,
  );

  const executionsMeta = useMemo(() => {
    const returnObj = {
      isLoading: !mostRecentlpVersionExecutionsQuery.isFetched,
      isError: mostRecentlpVersionExecutionsQuery.isError,
      nextPotentialExecutionTime: undefined,
    };

    // filter only scheduled executions
    const lpExecutions = (mostRecentlpVersionExecutionsQuery.data?.entities || []).filter(
      (e) => e.spec.metadata.mode === ExecutionMode.SCHEDULED,
    );

    // get next potential execution time based on the most recent scheduled execution
    const nextPotentialExecutionTime = getNextExecutionTimeMilliseconds(
      lpExecutions?.[0],
      launchPlan,
    );

    return { ...returnObj, isActive: launchPlan.closure?.state, nextPotentialExecutionTime };
  }, [mostRecentlpVersionExecutionsQuery, launchPlan]);

  if (executionsMeta.isLoading) {
    return <Shimmer />;
  }

  const isActive = launchPlan?.closure?.state === LaunchPlanState.ACTIVE;
  const nextPotentialExecutionTimeStr = executionsMeta.nextPotentialExecutionTime ? (
    formatDateUTC(new Date(executionsMeta.nextPotentialExecutionTime))
  ) : isActive ? (
    <em>N/A</em>
  ) : (
    <em>Determined upon activation</em>
  );
  return <>{nextPotentialExecutionTimeStr}</>;
};
