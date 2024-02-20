import Admin from '@clients/common/flyteidl/admin';
import { createPaginationTransformer } from '../AdminEntity/utils';
import { endpointPrefixes } from '../Common/constants';
import { IdentifierScope } from '../Common/types';
import { makeDescriptionEntityPath } from '../Common/utils';
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
