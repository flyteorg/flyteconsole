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
    getFilters: getTriggerFilters,
  } = useLaunchPlanScheduledState();

  const requestConfigBase: RequestConfig = {
    limit: limits.NONE,
    sort: DEFAULT_SORT,
  };

  const launchPlanEntitiesQuery = useConditionalQuery(
    {
      ...makeListLaunchPlanEntitiesQuery(queryClient, { domain, project }, requestConfigBase),
    },
    (prev) => !prev,
  );

  const launchPlansWithTriggersQuery = useConditionalQuery(
    {
      ...makeListLaunchPlansQuery(
        queryClient,
        { domain, project },
        {
          ...requestConfigBase,
          filter: getTriggerFilters(),
        },
      ),
      enabled: showScheduled,
    },
    (prev) => !prev,
  );
  const { launchPlanEntities, loading } = useMemo(() => {
    return {
      launchPlanEntities: (launchPlanEntitiesQuery.data?.entities || []) as NamedEntity[],
      loading: launchPlanEntitiesQuery.isLoading,
    };
  }, [launchPlanEntitiesQuery]);

  const { onlyScheduledLaunchPlans: onlyLaunchPlansWithTriggers, isLoadingOnlyScheduled } =
    useMemo(() => {
      return {
        onlyScheduledLaunchPlans: (launchPlansWithTriggersQuery.data?.entities ||
          []) as LaunchPlan[],
        isLoadingOnlyScheduled: launchPlansWithTriggersQuery.isLoading,
      };
    }, [launchPlansWithTriggersQuery]);

  return (
    <ResponsiveLaunchPlanList
      placeholder="Search Launch Plan Name"
      domainId={domain}
      projectId={project}
      noDivider
      launchPlanEntities={launchPlanEntities}
      launchPlansWithTriggers={onlyLaunchPlansWithTriggers}
      showScheduled={showScheduled}
      onScheduleFilterChange={setShowScheduled}
      isLoading={loading || isLoadingOnlyScheduled}
    />
  );
};
