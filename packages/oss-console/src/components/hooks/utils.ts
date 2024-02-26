import { isCompiledWorkflowClosure } from '../../models/Workflow/utils';
import { CompiledNode, GloballyUniqueNode } from '../../models/Node/types';
import { TaskTemplate } from '../../models/Task/types';
import { CompiledWorkflow, CompiledWorkflowClosure, Workflow } from '../../models/Workflow/types';

export function extractCompiledNodes(
  compiledWorkflowClosure?: CompiledWorkflowClosure | CompiledWorkflow,
): CompiledNode[] {
  if (!compiledWorkflowClosure) return [];

  const nodesToAdd = isCompiledWorkflowClosure(compiledWorkflowClosure)
    ? compiledWorkflowClosure?.primary?.template?.nodes
    : compiledWorkflowClosure?.template?.nodes;
  const subWorkflows = isCompiledWorkflowClosure(compiledWorkflowClosure)
    ? compiledWorkflowClosure.subWorkflows
    : [];

  return (subWorkflows || []).reduce(
    (out, subWorkflow) => {
      return [...out, ...subWorkflow.template.nodes];
    },
    [...nodesToAdd],
  );
}

export function extractTaskTemplates(workflow: Workflow): TaskTemplate[] {
  if (!workflow.closure || !workflow.closure.compiledWorkflow) {
    return [];
  }
  return workflow.closure.compiledWorkflow.tasks.map((t) => t.template);
}

export function extractAndIdentifyNodes(workflow: Workflow): GloballyUniqueNode[] {
  if (!workflow.closure || !workflow.closure.compiledWorkflow) {
    return [];
  }
  const { primary = {} as CompiledWorkflow, subWorkflows = [] } = workflow.closure.compiledWorkflow;
  const nodes = subWorkflows.reduce(
    (out, subWorkflow) => [...out, ...subWorkflow.template.nodes],
    primary?.template?.nodes || [],
  );

  return nodes.map((node) => ({
    node,
    id: {
      nodeId: node.id,
      // TODO: This is technically incorrect, as sub-workflow nodes
      // will use the wrong parent workflow id. This is done intentionally
      // to make sure that looking up the node information for a NodeExecution
      // finds the entry successfully.
      // When we are rendering sub-workflow nodes correctly, this should
      // be updated to use the proper parent workflow id
      // (subWorkflow.template.id)
      // See https://github.com/flyteorg/flyte/issues/357
      workflowId: workflow.id,
    },
  }));
}
