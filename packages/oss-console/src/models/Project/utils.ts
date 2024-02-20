import compact from 'lodash/compact';
import { Identifier } from '../Common/types';

export function makeProjectDomainAttributesPath(
  prefix: string,
  { project, domain }: Partial<Identifier>,
) {
  return compact([prefix, project, domain]).join('/');
}
