import { QueryInput, QueryType } from 'components/data/types';
import { getLaunchPlan } from 'models/Launch/api';
import { LaunchPlan, LaunchPlanId } from 'models/Launch/types';
import { QueryClient } from 'react-query';

export function makeLaunchPlanQuery(
  queryClient: QueryClient,
  id: LaunchPlanId,
): QueryInput<LaunchPlan> {
  return {
    queryKey: [QueryType.LaunchPlan, id],
    queryFn: async () => {
      const launchPlan = await getLaunchPlan(id);
      // On successful launchPlan fetch, extract and cache all task templates
      // stored on the launchPlan so that we don't need to fetch them separately
      // if future queries reference them.
      // Todo or missing

      return launchPlan;
    },
    // `LaunchPlan` objects (individual versions) are immutable and safe to
    // cache indefinitely once retrieved in full
    staleTime: Infinity,
  };
}

export async function fetchLaunchPlan(queryClient: QueryClient, id: LaunchPlanId) {
  return queryClient.fetchQuery(makeLaunchPlanQuery(queryClient, id));
}
