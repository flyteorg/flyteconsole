import { NamedEntity } from '../../models/Common/types';
import { NamedEntityState } from '../../models/enums';

function isWorkflowStateArchive(workflow: NamedEntity): boolean {
  const state = workflow?.metadata.state ?? null;
  return !!state && state === NamedEntityState.NAMED_ENTITY_ARCHIVED;
}

export function isWorkflowArchived(workflow: NamedEntity): boolean {
  return isWorkflowStateArchive(workflow);
}
