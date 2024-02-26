import { QueryClient } from 'react-query';
import { RequestConfig, PaginatedEntityResponse } from '@clients/common/types/adminEntityTypes';
import { QueryInput, QueryType } from '../components/data/types';
import { Identifier, IdentifierScope } from '../models/Common/types';
import { getDescriptionEntity, listDescriptionEntities } from '../models/DescriptionEntity/api';
import { DescriptionEntity } from '../models/DescriptionEntity/types';

export function makeListDescriptionEntitiesQuery(
  queryClient: QueryClient,
  scope: IdentifierScope,
  config?: RequestConfig,
): QueryInput<PaginatedEntityResponse<DescriptionEntity>> {
  return {
    queryKey: [QueryType.ListDescriptionEntities, scope, config],
    queryFn: async () => {
      const descriptionEntities = await listDescriptionEntities(scope, config);

      queryClient.setQueryData(
        [QueryType.ListDescriptionEntities, scope, config],
        descriptionEntities,
      );

      return descriptionEntities;
    },
    // Task templates are immutable and safe to cache indefinitely
    staleTime: Infinity,
  };
}

export function fetchListDescriptionEntities(
  queryClient: QueryClient,
  scope: IdentifierScope,
  config?: RequestConfig,
) {
  return queryClient.fetchQuery(makeListDescriptionEntitiesQuery(queryClient, scope, config));
}

export function makeDescriptionEntityQuery(
  queryClient: QueryClient,
  id: Identifier,
  config?: RequestConfig,
): QueryInput<DescriptionEntity> {
  return {
    queryKey: [QueryType.DescriptionEntity, id, config],
    queryFn: async () => {
      const descriptionEntity = await getDescriptionEntity(id, config);

      queryClient.setQueryData([QueryType.DescriptionEntity, id, config], descriptionEntity);

      return descriptionEntity;
    },
    // Task templates are immutable and safe to cache indefinitely
    staleTime: Infinity,
  };
}

export function fetchDescriptionEntity(
  queryClient: QueryClient,
  id: Identifier,
  config?: RequestConfig,
) {
  return queryClient.fetchQuery(makeDescriptionEntityQuery(queryClient, id, config));
}
