import { Admin } from '@flyteorg/flyteidl-types';
import { getAdminEntity } from 'models/AdminEntity/AdminEntity';
import { defaultPaginationConfig } from 'models/AdminEntity/constants';
import { RequestConfig } from 'models/AdminEntity/types';
import { Identifier, IdentifierScope } from 'models/Common/types';
import { DescriptionEntity } from './types';
import { makeDescriptionPath, descriptionEntityListTransformer } from './utils';

/** Fetches a list of `DescriptionEntity` records matching the provided `scope` */
export const listDescriptionEntities = (
  scope: IdentifierScope,
  config?: RequestConfig,
) =>
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
