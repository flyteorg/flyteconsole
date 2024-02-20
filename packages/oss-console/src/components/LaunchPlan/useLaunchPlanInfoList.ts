import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import { DomainIdentifierScope, NamedEntity, ResourceType } from '../../models/Common/types';
import { usePagination } from '../hooks/usePagination';
import { useAPIContext } from '../data/apiContext';

export const useLaunchPlanInfoList = (scope: DomainIdentifierScope, config?: RequestConfig) => {
  const { listNamedEntities } = useAPIContext();

  return usePagination<NamedEntity, DomainIdentifierScope>(
    { ...config, fetchArg: scope },
    (scope, requestConfig) =>
      listNamedEntities({ ...scope, resourceType: ResourceType.LAUNCH_PLAN }, requestConfig),
  );
};
