import { useQueryClient } from 'react-query';
import { getScheduleFilter } from '../useLaunchPlanScheduledState';
import { CREATED_AT_DESCENDING_SORT } from '../../../models/Launch/constants';
import { makeListLaunchPlansQuery } from '../../../queries/launchPlanQueries';
import { NamedEntityIdentifier, ResourceIdentifier } from '../../../models/Common/types';
import { useConditionalQuery } from '../../hooks/useConditionalQuery';

export interface UseLatestScheduledLaunchPlansProps {
  id: ResourceIdentifier | NamedEntityIdentifier;
  enabled?: boolean;
  limit?: number;
}

export interface UseLatestLaunchPlanVersionsProps {
  id: ResourceIdentifier | NamedEntityIdentifier;
  limit?: number;
  enabled?: boolean;
}

export function useLatestLaunchPlanVersions({
  id,
  enabled = true,
  limit = 10,
}: UseLatestLaunchPlanVersionsProps) {
  const queryClient = useQueryClient();
  const latestScheduledLaunchPlanQuery = useConditionalQuery(
    {
      ...makeListLaunchPlansQuery(queryClient, id, {
        sort: CREATED_AT_DESCENDING_SORT,
        limit,
      }),
      enabled: enabled && !!id,
    },
    (prev) => !prev,
  );

  return latestScheduledLaunchPlanQuery;
}

/** A hook for fetching the list of available projects */
export function useLatestScheduledLaunchPlans({
  id,
  enabled = true,
  limit = 10,
}: UseLatestScheduledLaunchPlansProps) {
  const queryClient = useQueryClient();
  const onlyTriggeredFilter = getScheduleFilter(enabled);
  const latestScheduledLaunchPlanQuery = useConditionalQuery(
    {
      ...makeListLaunchPlansQuery(queryClient, id, {
        sort: CREATED_AT_DESCENDING_SORT,
        limit,
        filter: [onlyTriggeredFilter],
      }),
      enabled: enabled && !!id,
    },
    (prev) => !prev,
  );

  return latestScheduledLaunchPlanQuery;
}
