import merge from 'lodash/merge';
import mergeWith from 'lodash/mergeWith';
import { isCompiledWorkflowClosure } from '../../../../models/Workflow/utils';
import { CompiledWorkflow, CompiledWorkflowClosure } from '../../../../models/Workflow/types';
import { CompiledNode } from '../../../../models/Node/types';
import { getSubWorkflowFromId } from '../../../WorkflowGraph/utils';

export const mergeNodeExecutions = (val, srcVal, _topkey) => {
  const retVal = mergeWith(val, srcVal, (target, src, _key) => {
    if (!target) {
      return src;
    }
    if (src instanceof Map) {
      return src;
    }
    const finaVal = typeof src === 'object' ? merge(target, src) : src;
    return finaVal;
  });
  return retVal;
};

export const findNodeInWorkflowClosure = (
  scopedId?: string,
  compiledWorkflowClosure?: CompiledWorkflowClosure | CompiledWorkflow,
) => {
  if (!scopedId || !compiledWorkflowClosure) {
    return null;
  }

  const nodePath = scopedId?.split('-0-');
  let currentNode: Partial<CompiledNode> | undefined;
  while (nodePath?.length || 0 > 1) {
    let compiledWorkflow: CompiledWorkflow | undefined = isCompiledWorkflowClosure(
      compiledWorkflowClosure,
    )
      ? compiledWorkflowClosure?.primary
      : compiledWorkflowClosure;
    if (
      currentNode?.workflowNode &&
      getSubWorkflowFromId(currentNode?.workflowNode.subWorkflowRef as any, compiledWorkflowClosure)
    ) {
      compiledWorkflow = getSubWorkflowFromId(
        currentNode?.workflowNode.subWorkflowRef as any,
        compiledWorkflowClosure,
      )!;
    }
    let currentNodeId = nodePath?.shift();
    const nodesToSearch = compiledWorkflow?.template?.nodes;

    currentNode = nodesToSearch
      ?.map((n) => {
        if (n.id === currentNodeId) {
          if (n.branchNode) {
            currentNodeId = nodePath?.shift();
            if (n.branchNode.ifElse?.case?.thenNode?.id === currentNodeId) {
              return n.branchNode.ifElse!.case!.thenNode as CompiledNode;
            }
            if (n.branchNode.ifElse?.elseNode?.id === currentNodeId) {
              return n.branchNode.ifElse?.elseNode as CompiledNode;
            }
          } else {
            return n;
          }
        }

        return undefined;
      })
      ?.filter((n) => !!n)?.[0];
  }

  return currentNode;
};
