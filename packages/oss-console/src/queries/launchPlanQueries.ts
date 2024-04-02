import { QueryClient } from 'react-query';
import { PaginatedEntityResponse, RequestConfig } from '@clients/common/types/adminEntityTypes';
import { QueryInput, QueryType } from '../components/data/types';
import { getLaunchPlan, listLaunchPlans } from '../models/Launch/api';
import { LaunchPlan, LaunchPlanId } from '../models/Launch/types';
import {
  IdentifierScope,
  NamedEntity,
  NamedEntityIdentifier,
  ResourceType,
} from '../models/Common/types';
import { ListNamedEntitiesInput, listNamedEntities } from '../models/Common/api';

export const castLaunchPlanIdAsQueryKey = (id: Partial<NamedEntityIdentifier>) => {
  const { domain, project, name } = id || {};
  return !!domain && !!project && { domain, project, name };
};

export function makeLaunchPlanQuery(
  queryClient: QueryClient,
  id: LaunchPlanId,
  config?: RequestConfig,
): QueryInput<LaunchPlan> {
  return {
    queryKey: [QueryType.LaunchPlan, id, config],
    queryFn: async () => {
      const launchPlan = await getLaunchPlan(id);

      queryClient.setQueryData([QueryType.LaunchPlan, id, config], launchPlan);

      return launchPlan;
    },
    // `LaunchPlan` objects (individual versions) are immutable and safe to
    // cache indefinitely once retrieved in full
    staleTime: Infinity,
  };
}

export function makeListLaunchPlansQuery(
  queryClient: QueryClient,
  id: Partial<NamedEntityIdentifier>,
  config?: RequestConfig,
): QueryInput<PaginatedEntityResponse<LaunchPlan>> {
  const castedId = castLaunchPlanIdAsQueryKey(id);
  return {
    enabled: !!castedId,
    queryKey: [QueryType.ListLaunchPlans, castedId, config],
    queryFn: async () => {
      const launchPlans = await listLaunchPlans(castedId as IdentifierScope, config);

      queryClient.setQueryData([QueryType.ListLaunchPlans, castedId, config], launchPlans);

      return launchPlans;
    },
    // `LaunchPlan` objects (individual versions) are immutable and safe to
    // cache indefinitely once retrieved in full
    staleTime: Infinity,
  };
}

export function fetchLaunchPlansList(
  queryClient: QueryClient,
  id: Partial<NamedEntityIdentifier>,
  config?: RequestConfig,
) {
  return queryClient.fetchQuery(makeListLaunchPlansQuery(queryClient, id, config));
}
/**
 *
 * @param queryClient The query client.
 * @param scope Partial<NamedEntityIdentifier>. We only need domain and project, and fill in resourceType: ResourceType.LAUNCH_PLAN.
 * @param config RequestConfig for request.
 * @returns A paginated list of launch plan entities.
 */
export function makeListLaunchPlanEntitiesQuery(
  queryClient: QueryClient,
  scope: Partial<ListNamedEntitiesInput>,
  config?: RequestConfig,
): QueryInput<PaginatedEntityResponse<NamedEntity>> {
  const castedScope = {
    domain: scope.domain,
    project: scope.project,
    resourceType: ResourceType.LAUNCH_PLAN,
  } as ListNamedEntitiesInput;

  return {
    queryKey: [QueryType.LaunchPlanEntitiesList, castedScope, config],
    queryFn: async () => {
      const launchPlans = await listNamedEntities(castedScope, config);

      queryClient.setQueryData(
        [QueryType.LaunchPlanEntitiesList, castedScope, config],
        launchPlans,
      );

      return launchPlans;
    },
  };
}
