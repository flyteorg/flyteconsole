import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import { DescriptionEntity } from '../../models/DescriptionEntity/types';
import { useAPIContext } from '../data/apiContext';
import { usePagination } from './usePagination';
import { IdentifierScope } from '../../models/Common/types';

/** A hook for fetching a paginated list of description entities */
export function useDescriptionEntityList(scope: IdentifierScope, config: RequestConfig) {
  const { listDescriptionEntities } = useAPIContext();
  return usePagination<DescriptionEntity, IdentifierScope>(
    { ...config, cacheItems: true, fetchArg: scope },
    listDescriptionEntities,
  );
}
