import { LaunchPlanId } from 'models/Launch/types';
import { LaunchPlanExecutionPhase } from 'models/Execution/enums';
import { LaunchPlanExecutionIdentifier } from 'models/Execution/types';
import { NamedEntityIdentifier } from 'models/Common/types';
import { NamedEntityState } from 'models/enums';

export type LaunchPlanListItem = {
  id: LaunchPlanId;
  inputs?: string;
  outputs?: string;
  latestExecutionTime?: string;
  executionStatus?: LaunchPlanExecutionPhase[];
  executionIds?: LaunchPlanExecutionIdentifier[];
  description?: string;
  state: NamedEntityState;
};

export type LaunchPlanListStructureItem = {
  id: NamedEntityIdentifier;
  description: string;
  state: NamedEntityState;
};
