import Admin from '@clients/common/flyteidl/admin';
import { createPaginationTransformer } from '../AdminEntity/utils';
import { endpointPrefixes } from '../Common/constants';
import { IdentifierScope } from '../Common/types';
import { makeIdentifierPath } from '../Common/utils';
import { CompiledWorkflowClosure, Workflow } from './types';

export function makeWorkflowPath(scope: IdentifierScope) {
  return makeIdentifierPath(endpointPrefixes.workflow, scope);
}

/** Transformer to coerce an `Admin.WorkflowList` into a standard shape */
export const workflowListTransformer = createPaginationTransformer<Workflow, Admin.WorkflowList>(
  'workflows',
);

export const isCompiledWorkflowClosure = (closure: any): closure is CompiledWorkflowClosure => {
  return typeof closure === 'object' && 'primary' in closure;
};
