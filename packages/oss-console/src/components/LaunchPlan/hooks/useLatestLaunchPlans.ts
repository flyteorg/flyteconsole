import { useQueryClient } from 'react-query';
import { FilterOperationList } from '@clients/common/types/adminEntityTypes';
import { CREATED_AT_DESCENDING_SORT } from '../../../models/Launch/constants';
import { makeListLaunchPlansQuery } from '../../../queries/launchPlanQueries';
import { NamedEntityIdentifier, ResourceIdentifier } from '../../../models/Common/types';
import { useConditionalQuery } from '../../hooks/useConditionalQuery';

export interface UseLatestLaunchPlansProps {
  id: ResourceIdentifier | NamedEntityIdentifier;
  enabled?: boolean;
  limit?: number;
  filter?: FilterOperationList;
}
/** A hook for fetching the list of available projects */
export function useLatestLaunchPlans({
  id,
  enabled = true,
  limit = 1,
  filter,
}: UseLatestLaunchPlansProps) {
  const queryClient = useQueryClient();
  const latestScheduledLaunchPlanQuery = useConditionalQuery(
    {
      ...makeListLaunchPlansQuery(queryClient, id, {
        sort: CREATED_AT_DESCENDING_SORT,
        limit,
        filter,
      }),
      enabled: enabled && !!id,
    },
    (prev) => !prev,
  );

  return latestScheduledLaunchPlanQuery;
}
