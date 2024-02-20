import React, { FC, useMemo } from 'react';

import { useQueryClient } from 'react-query';
import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import { limits, DEFAULT_SORT } from '../../models/AdminEntity/constants';
import { LaunchPlan } from '../../models/Launch/types';
import {
  makeListLaunchPlanEntitiesQuery,
  makeListLaunchPlansQuery,
} from '../../queries/launchPlanQueries';
import { ResponsiveLaunchPlanList } from './ResponsiveLaunchPlanList';
import { NamedEntity } from '../../models/Common/types';
import { useConditionalQuery } from '../hooks/useConditionalQuery';
import { useLaunchPlanScheduledState } from './useLaunchPlanScheduledState';

interface LaunchPlanListProps {
  projectId: string;
  domainId: string;
}

/**
 * Renders a searchable list of LaunchPlan names, with associated descriptions
 * @param launchPlans
 * @constructor
 */
export const LaunchPlanList: FC<LaunchPlanListProps> = ({
  domainId: domain,
  projectId: project,
}) => {
  const queryClient = useQueryClient();
  const {
    showScheduled,
    setShowScheduled,
    getFilter: getScheduleFilter,
  } = useLaunchPlanScheduledState();

  const requestConfigBase: RequestConfig = {
    limit: limits.NONE,
    sort: DEFAULT_SORT,
  };

  const launchplansQuery = useConditionalQuery(
    {
      ...makeListLaunchPlansQuery(
        queryClient,
        { domain, project },
        {
          ...requestConfigBase,
          filter: [getScheduleFilter()],
        },
      ),
      enabled: showScheduled,
    },
    (prev) => !prev,
  );

  const launchPlanEntitiesQuery = useConditionalQuery(
    {
      ...makeListLaunchPlanEntitiesQuery(queryClient, { domain, project }, requestConfigBase),
    },
    (prev) => !prev,
  );

  const { launchPlanEntities, loading } = useMemo(() => {
    return {
      launchPlanEntities: (launchPlanEntitiesQuery.data?.entities || []) as NamedEntity[],
      loading: launchPlanEntitiesQuery.isLoading,
    };
  }, [launchPlanEntitiesQuery]);

  const { onlyScheduledLaunchPlans, isLoadingOnlyScheduled } = useMemo(() => {
    return {
      onlyScheduledLaunchPlans: (launchplansQuery.data?.entities || []) as LaunchPlan[],
      isLoadingOnlyScheduled: launchplansQuery.isLoading,
    };
  }, [launchplansQuery]);

  return (
    <ResponsiveLaunchPlanList
      placeholder="Search Launch Plan Name"
      domainId={domain}
      projectId={project}
      noDivider
      launchPlanEntities={launchPlanEntities}
      scheduledLaunchPlans={onlyScheduledLaunchPlans}
      showScheduled={showScheduled}
      onScheduleFilterChange={setShowScheduled}
      isLoading={loading || isLoadingOnlyScheduled}
    />
  );
};
