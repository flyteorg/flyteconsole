import { CompiledNode } from '../../../../models/Node/types';
import { transformerWorkflowToDag } from '../../../WorkflowGraph/transformerWorkflowToDag';
import { getTaskDisplayType } from '../../utils';
import { NodeExecutionDetails, NodeExecutionDisplayType } from '../../types';
import { Workflow } from '../../../../models/Workflow/types';
import { Identifier } from '../../../../models/Common/types';
import { CompiledTask } from '../../../../models/Task/types';
import { dNode } from '../../../../models/Graph/types';
import { isEndNode, isStartNode } from '../../../../models/Node/utils';
import { getTaskTypeFromCompiledNode } from '../../../WorkflowGraph/utils';

interface NodeExecutionInfo extends NodeExecutionDetails {
  scopedId?: string;
}

export interface CurrentExecutionDetails {
  executionId: Identifier;
  nodes: NodeExecutionInfo[];
}

function convertToPlainNodes(nodes: dNode[], level = 0): dNode[] {
  const result: dNode[] = [];
  if (!nodes || nodes.length === 0) {
    return result;
  }
  nodes.forEach((node) => {
    if (isStartNode(node) || isEndNode(node)) {
      return;
    }
    result.push({ ...node, level });
    if (node.nodes.length > 0) {
      result.push(...convertToPlainNodes(node.nodes, level + 1));
    }
  });
  return result;
}

export function createExecutionDetails(workflow: Workflow): CurrentExecutionDetails {
  const result: CurrentExecutionDetails = {
    executionId: workflow.id,
    nodes: [],
  };

  if (!workflow.closure?.compiledWorkflow) {
    return result;
  }

  const compiledWorkflow = workflow.closure?.compiledWorkflow;
  const { tasks = [] } = compiledWorkflow;

  let dNodes = transformerWorkflowToDag(compiledWorkflow).dag.nodes ?? [];
  dNodes = convertToPlainNodes(dNodes);

  dNodes.forEach((n) => {
    const details = getNodeExecutionDetails(n, tasks);
    result.nodes.push({
      ...details,
    });
  });

  return result;
}

export const getNodeDetails = (
  scopedId: string,
  compiledNode?: Partial<CompiledNode>,
  task?: CompiledTask,
): NodeExecutionInfo => {
  const templateName = compiledNode?.taskNode?.referenceId?.name;
  const taskType = getTaskDisplayType(task?.template.type);

  let returnVal: NodeExecutionInfo = {
    scopedId,
    displayId: compiledNode?.id ?? 'unknownNode',
    displayName: templateName,
    taskTemplate: task?.template,
    displayType: taskType ?? NodeExecutionDisplayType.Unknown,
  };

  if (compiledNode?.workflowNode) {
    const { workflowNode } = compiledNode;
    const info = workflowNode.launchplanRef ?? workflowNode.subWorkflowRef;
    returnVal = {
      ...returnVal,
      subWorkflowName: info?.name ?? 'N/A',
      displayType: NodeExecutionDisplayType.Workflow,
    };
  }

  // TODO: https://github.com/flyteorg/flyteconsole/issues/274
  if (compiledNode?.branchNode) {
    returnVal = {
      ...returnVal,
      displayType: NodeExecutionDisplayType.BranchNode,
    };
  }

  if (compiledNode?.gateNode) {
    returnVal = {
      ...returnVal,
      displayType:
        returnVal.displayType !== NodeExecutionDisplayType.Unknown
          ? returnVal.displayType
          : NodeExecutionDisplayType.GateNode,
    };
  }

  if (compiledNode?.arrayNode) {
    returnVal = {
      ...returnVal,
      displayType:
        returnVal.displayType !== NodeExecutionDisplayType.Unknown
          ? returnVal.displayType
          : NodeExecutionDisplayType.ArrayNode,
    };
  }

  return returnVal;
};

export const getNodeDetailsFromTask = (node: dNode, task?: CompiledTask): NodeExecutionInfo => {
  const templateName = node?.value?.taskNode?.referenceId?.name ?? node?.name;
  const taskType = getTaskDisplayType(task?.template.type);

  let returnVal: NodeExecutionInfo = {
    scopedId: node.scopedId,
    displayId: node?.value?.id ?? node.id ?? 'unknownNode',
    displayName: templateName ?? node.name,
    taskTemplate: task?.template,
    displayType: taskType ?? NodeExecutionDisplayType.Unknown,
  };

  if (node.value?.arrayNode) {
    returnVal = {
      ...returnVal,
      displayType: NodeExecutionDisplayType.ArrayNode,
    };
  }

  if (node.value?.workflowNode) {
    const { workflowNode } = node.value;
    const info = workflowNode.launchplanRef ?? workflowNode.subWorkflowRef;
    returnVal = {
      ...returnVal,
      subWorkflowName: info?.name ?? 'N/A',
      displayType: NodeExecutionDisplayType.Workflow,
    };
  }

  // TODO: https://github.com/flyteorg/flyteconsole/issues/274
  if (node.value?.branchNode) {
    returnVal = {
      ...returnVal,
      displayType: NodeExecutionDisplayType.BranchNode,
    };
  }

  if (node.value?.gateNode) {
    returnVal = {
      ...returnVal,
      displayType:
        returnVal.displayType !== NodeExecutionDisplayType.Unknown
          ? returnVal.displayType
          : NodeExecutionDisplayType.GateNode,
    };
  }

  return returnVal;
};

/**
 *
 * @param node The node to get details for
 * @param tasks The list of tasks for the current workflow
 * @returns
 */
export const getNodeExecutionDetails = (
  node: dNode,
  tasks: CompiledTask[] = [],
): NodeExecutionInfo => {
  const taskNode = node?.value?.arrayNode?.node?.taskNode || node?.value?.taskNode;
  const task = getTaskTypeFromCompiledNode(taskNode!, tasks);
  return getNodeDetailsFromTask(node, task);
};
