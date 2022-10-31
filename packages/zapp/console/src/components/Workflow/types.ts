import {
  WorkflowId,
  WorkflowExecutionPhase,
  NamedEntityIdentifier,
  WorkflowExecutionIdentifier,
} from '@flyteconsole/components';
import { NamedEntityState } from 'models/enums';

export type WorkflowListItem = {
  id: WorkflowId;
  inputs?: string;
  outputs?: string;
  latestExecutionTime?: string;
  executionStatus?: WorkflowExecutionPhase[];
  executionIds?: WorkflowExecutionIdentifier[];
  description?: string;
  state: NamedEntityState;
};

export type WorkflowListStructureItem = {
  id: NamedEntityIdentifier;
  description: string;
  state: NamedEntityState;
};
