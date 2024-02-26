import { NamedEntityIdentifier } from '../../models/Common/types';
import { NamedEntityState } from '../../models/enums';

export type WorkflowListStructureItem = {
  id: NamedEntityIdentifier;
  description: string;
  state: NamedEntityState;
};
