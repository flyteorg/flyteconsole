import { Admin } from '@flyteorg/flyteidl-types';
import { createPaginationTransformer } from 'models/AdminEntity/utils';
import { endpointPrefixes } from 'models/Common/constants';
import { IdentifierScope } from 'models/Common/types';
import { makeDescriptionEntityPath } from 'models/Common/utils';
import { DescriptionEntity } from './types';

/** Generate the correct path for retrieving a DescriptionEntity or list of DescriptionEntities based on the
 * given scope.
 */
export function makeDescriptionPath(scope: IdentifierScope) {
  return makeDescriptionEntityPath(endpointPrefixes.descriptionEntity, scope);
}

/** Transformer to coerce an `Admin.DescriptionEntityList` into a standard shape */
export const descriptionEntityListTransformer = createPaginationTransformer<
  DescriptionEntity,
  Admin.DescriptionEntityList
>('descriptionEntities');
