/* eslint-disable guard-for-in */

import isEqual from 'lodash/isEqual';
import { isCompiledWorkflowClosure } from '@clients/oss-console/models/Workflow/utils';
import { Identifier } from '../../models/Common/types';
import { CompiledWorkflow, CompiledWorkflowClosure, Workflow } from '../../models/Workflow/types';
import { CompiledNode, TaskNode } from '../../models/Node/types';
import { CompiledTask, TaskTemplate } from '../../models/Task/types';
import { dTypes, dNode } from '../../models/Graph/types';
import { isEndNode, isEndNodeId, isStartNode, isStartNodeId } from '../../models/Node/utils';
import { NodeExecutionDetails } from '../Executions/types';
import { transformerWorkflowToDag } from './transformerWorkflowToDag';

/**
 * TODO FC#393: these are dupes for testing, remove once tests fixed
 */
export const DISPLAY_NAME_START = 'start';
export const DISPLAY_NAME_END = 'end';

export interface NodeExecutionInfo extends NodeExecutionDetails {
  scopedId?: string;
}

/**
 * Returns a display name from either workflows or nodes
 * @param context input can be either CompiledWorkflow or CompiledNode
 * @returns Display name
 */
export const getDisplayName = (context: any, truncate = true): string => {
  let displayName = '';
  if (context.metadata) {
    // Compiled Node with Meta
    displayName = context.metadata.name;
  } else if (context.displayId) {
    // NodeExecutionDetails
    displayName = context.displayId;
  } else if (context.template?.id?.name) {
    // CompiledWorkflow
    displayName = context.template.id.name;
  } else if (context.id) {
    // Compiled Node (start/end)
    displayName = context.id;
  }

  if (isStartNodeId(displayName)) {
    return DISPLAY_NAME_START;
  }
  if (isEndNodeId(displayName)) {
    return DISPLAY_NAME_END;
  }
  if (displayName.indexOf('.') > 0 && truncate) {
    /* Note: for displaying truncated task name */
    return displayName.substring(displayName.lastIndexOf('.') + 1, displayName.length);
  }

  return displayName;
};

export const getNodeTypeFromCompiledNode = (node: CompiledNode): dTypes => {
  if (isStartNode(node)) {
    return dTypes.start;
  }
  if (isEndNode(node)) {
    return dTypes.end;
  }
  if (node.branchNode) {
    return dTypes.subworkflow;
  }
  if (node.workflowNode) {
    /* Workflow prop can mean either launchplanReft or subworklow */
    if (node.workflowNode.launchplanRef) {
      return dTypes.task;
    }
    return dTypes.subworkflow;
  }
  if (node.gateNode) {
    return dTypes.gateNode;
  }
  return dTypes.task;
};

export const getSubWorkflowFromId = (
  id: Identifier,
  workflow: CompiledWorkflowClosure | CompiledWorkflow,
) => {
  const { subWorkflows } = isCompiledWorkflowClosure(workflow)
    ? workflow
    : {
        subWorkflows: [],
      };
  /* Find current matching entitity from subWorkflows */
  // eslint-disable-next-line no-restricted-syntax
  for (const k in subWorkflows) {
    const subWorkflowId = subWorkflows[k as any as number].template.id;
    if (isEqual(subWorkflowId, id)) {
      return subWorkflows[k as any as number];
    }
  }
  return undefined;
};

export const getTaskTypeFromCompiledNode = (taskNode: TaskNode, tasks: CompiledTask[]) => {
  if (!taskNode?.referenceId) {
    return undefined;
  }
  for (let i = 0; i < tasks.length; i++) {
    const compiledTask: CompiledTask = tasks[i];
    const taskTemplate: TaskTemplate = compiledTask.template;
    const templateId: Identifier = taskTemplate.id;
    if (isEqual(templateId, taskNode.referenceId)) {
      return compiledTask;
    }
  }
  return undefined;
};

export const getNodeNameFromDag = (dagData: dNode, nodeId: string) => {
  const id = nodeId.slice(nodeId.lastIndexOf('-') + 1);
  const node = dagData[id];

  return getNodeTemplateName(node);
};

export const getNodeTemplateName = (node: dNode | CompiledNode): string | undefined => {
  const value = (node as dNode)?.value || (node as CompiledNode);
  if (value?.workflowNode) {
    const { launchplanRef, subWorkflowRef } = value?.workflowNode || {};
    const identifier = (launchplanRef || subWorkflowRef) as Identifier;
    return identifier.name;
  }

  if (value?.taskNode) {
    return value.taskNode.referenceId.name;
  }

  return undefined;
};

export const transformWorkflowToKeyedDag = (workflow: Workflow) => {
  if (!workflow.closure?.compiledWorkflow) return {};

  const { dag } = transformerWorkflowToDag(workflow.closure?.compiledWorkflow);
  const data = {};
  dag.nodes.forEach((node) => {
    data[`${node.id}`] = node;
  });
  return data;
};
