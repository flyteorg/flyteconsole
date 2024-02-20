import Admin from '@clients/common/flyteidl/admin';
import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import { getAdminEntity } from '../AdminEntity/AdminEntity';
import { defaultPaginationConfig } from '../AdminEntity/constants';
import { Identifier, IdentifierScope } from '../Common/types';
import { DescriptionEntity } from './types';
import { makeDescriptionPath, descriptionEntityListTransformer } from './utils';

/** Fetches a list of `DescriptionEntity` records matching the provided `scope` */
export const listDescriptionEntities = (scope: IdentifierScope, config?: RequestConfig) =>
  getAdminEntity(
    {
      path: makeDescriptionPath(scope),
      messageType: Admin.DescriptionEntityList,
      transform: descriptionEntityListTransformer,
    },
    { ...defaultPaginationConfig, ...config },
  );

/** Fetches an individual `DescriptionEntity` record */
export const getDescriptionEntity = (id: Identifier, config?: RequestConfig) =>
  getAdminEntity<Admin.DescriptionEntity, DescriptionEntity>(
    {
      path: makeDescriptionPath(id),
      messageType: Admin.DescriptionEntity,
    },
    config,
  );
