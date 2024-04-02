import { useQueryClient } from 'react-query';
import { FilterOperation, FilterOperationName } from '@clients/common/types/adminEntityTypes';
import { LaunchPlanState } from '../../../models/Launch/types';
import { CREATED_AT_DESCENDING_SORT } from '../../../models/Launch/constants';
import { makeListLaunchPlansQuery } from '../../../queries/launchPlanQueries';
import { NamedEntityIdentifier, ResourceIdentifier } from '../../../models/Common/types';
import { useConditionalQuery } from '../../hooks/useConditionalQuery';

export const getActiveLaunchPlan = (showScheduled: boolean): FilterOperation => {
  return {
    key: 'state',
    operation: FilterOperationName.EQ,
    value: showScheduled ? LaunchPlanState.ACTIVE : LaunchPlanState.INACTIVE,
  };
};

export interface useLatestActiveLaunchPlanProps {
  id: ResourceIdentifier | NamedEntityIdentifier;
  enabled?: boolean;
  limit?: number;
  additionalFilters?: FilterOperation[];
}
/** A hook for fetching all active launch plans */
export function useLatestActiveLaunchPlan({
  id,
  enabled = true,
  limit = 1,
  additionalFilters = [],
}: useLatestActiveLaunchPlanProps) {
  const queryClient = useQueryClient();
  const onlyActiveLaunchPlanFilter = getActiveLaunchPlan(true);
  const latestScheduledLaunchPlanQuery = useConditionalQuery(
    {
      ...makeListLaunchPlansQuery(queryClient, id, {
        sort: CREATED_AT_DESCENDING_SORT,
        limit,
        filter: [onlyActiveLaunchPlanFilter, ...additionalFilters],
      }),
      enabled: enabled && !!id,
    },
    (prev) => !prev,
  );

  return latestScheduledLaunchPlanQuery;
}
