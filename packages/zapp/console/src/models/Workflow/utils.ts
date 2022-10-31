import { Admin } from '@flyteconsole/flyteidl';
import {
  createPaginationTransformer,
  IdentifierScope,
  Workflow,
  endpointPrefixes,
} from '@flyteconsole/components';
import { makeIdentifierPath } from 'models/Common/utils';

export function makeWorkflowPath(scope: IdentifierScope) {
  return makeIdentifierPath(endpointPrefixes.workflow, scope);
}

/** Transformer to coerce an `Admin.WorkflowList` into a standard shape */
export const workflowListTransformer = createPaginationTransformer<Workflow, Admin.WorkflowList>(
  'workflows',
);
