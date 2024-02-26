import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import { IdentifierScope } from '../../models/Common/types';
import { listLaunchPlans } from '../../models/Launch/api';
import { LaunchPlan } from '../../models/Launch/types';
import { usePagination } from './usePagination';

/** A hook for fetching a paginated list of launch plans */
export function useLaunchPlans(scope: IdentifierScope, config: RequestConfig) {
  return usePagination<LaunchPlan, IdentifierScope>(
    { ...config, cacheItems: true, fetchArg: scope },
    listLaunchPlans,
  );
}
