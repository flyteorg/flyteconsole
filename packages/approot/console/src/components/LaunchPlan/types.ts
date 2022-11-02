import { NamedEntityIdentifier } from '@flyteconsole/components';
import { NamedEntityState } from 'models/enums';

export type LaunchPlanListStructureItem = {
  id: NamedEntityIdentifier;
  description: string;
  state: NamedEntityState;
};
