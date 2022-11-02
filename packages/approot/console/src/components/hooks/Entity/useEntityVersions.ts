import { IdentifierScope, ResourceIdentifier, RequestConfig } from '@flyteconsole/components';
import { usePagination } from '../usePagination';
import { EntityType, entityFunctions } from './constants';

/**
 * A hook for fetching a paginated list of entity versions.
 * @param scope
 * @param config
 */
export function useEntityVersions(scope: IdentifierScope, config: RequestConfig) {
  const id = scope as ResourceIdentifier;
  const listEntity = entityFunctions[id.resourceType]?.listEntity;

  return usePagination<EntityType, IdentifierScope>(
    { ...config, cacheItems: true, fetchArg: scope },
    listEntity,
  );
}
