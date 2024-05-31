/* eslint-disable no-use-before-define */
// TODO: Fix, this is causing problems

import cloneDeep from 'lodash/cloneDeep';
import { DISPLAY_NAME_END, DISPLAY_NAME_START } from '../flytegraph/ReactFlow/utils';
import { createDebugLogger } from '../../common/log';
import { dTypes, dEdge, dNode } from '../../models/Graph/types';
import { startNodeId, endNodeId } from '../../models/Node/constants';
import { ArrayNode, CompiledNode, ConnectionSet, TaskNode } from '../../models/Node/types';
import { CompiledTask } from '../../models/Task/types';
import { CompiledWorkflow, CompiledWorkflowClosure } from '../../models/Workflow/types';
import { isStartOrEndNode } from '../../models/Node/utils';
import { getNodeExecutionDetails } from '../Executions/contextProvider/NodeExecutionDetails/createExecutionArray';
import {
  getDisplayName,
  getSubWorkflowFromId,
  getNodeTypeFromCompiledNode,
  getTaskTypeFromCompiledNode,
} from './utils';

export interface staticNodeExecutionIds {
  staticNodeId: string;
}

const debug = createDebugLogger('@transformerWorkflowToDag');

interface CreateDNodeProps {
  compiledNode: CompiledNode;
  parentDNode?: dNode;
  taskTemplate?: CompiledTask;
  typeOverride?: dTypes;
  nodeMetadataMap: ScopedIdExpandedMap;
  staticExecutionIdsMap?: any;
  compiledWorkflowClosure: CompiledWorkflowClosure;
}
const createDNode = ({
  compiledNode,
  parentDNode,
  taskTemplate,
  typeOverride,
  nodeMetadataMap,
  staticExecutionIdsMap,
  compiledWorkflowClosure: workflowClosure,
}: CreateDNodeProps): dNode => {
  const nodeValue = taskTemplate == null ? compiledNode : { ...compiledNode, ...taskTemplate };

  /**
   * Note on scopedId:
   * We need to be able to map nodeExecution's to their corresponding nodes. The problem is that nodeExecutions come
   * back with a scoped id's (eg, {parentId}-{retry}-{childId}) while nodes are contextual (eg, 'n3' vs 'n0-0-n1-0-n3').
   * Further, even if we try to construct these values here we cannot know the actual retry value until run-time.
   *
   * To mitigate this we've added a new property on NodeExecutions that is the same as an executions scopedId but
   * assuming '0' for each retry. We then construct that same scopedId here with the same solution of '0' for retries
   * which allows us to map them regardless of what the actual retry value is.
   */
  let scopedId = '';
  if (isStartOrEndNode(compiledNode) && parentDNode && !isStartOrEndNode(parentDNode)) {
    scopedId = `${parentDNode.scopedId}-${compiledNode.id}`;
  } else if (parentDNode && parentDNode.type !== dTypes.start) {
    if (parentDNode.type === dTypes.branch || parentDNode.type === dTypes.subworkflow) {
      scopedId = `${parentDNode.scopedId}-0-${compiledNode.id}`;
    } else {
      scopedId = `${parentDNode.scopedId}-${compiledNode.id}`;
    }
  } else {
    /* Case: primary workflow nodes won't have parents */
    scopedId = compiledNode.id;
  }
  const type = typeOverride == null ? getNodeTypeFromCompiledNode(compiledNode) : typeOverride;

  const nodeMetadata = nodeMetadataMap[scopedId] || {};
  const output = {
    id: compiledNode.id,
    scopedId,
    value: nodeValue,
    type,
    name: getDisplayName(compiledNode),
    nodes: [],
    edges: [],
    gateNode: compiledNode.gateNode,
    level: parentDNode?.level !== undefined ? parentDNode.level + 1 : 0,
    ...nodeMetadata,
    ...(compiledNode.arrayNode ? { arrayNode: compiledNode.arrayNode } : {}),
    ...(compiledNode.workflowNode ? { workflowNode: compiledNode.workflowNode } : {}),
    ...(compiledNode.gateNode ? { gateNode: compiledNode.gateNode } : {}),
    ...(compiledNode.branchNode ? { taskNode: compiledNode.taskNode } : {}),
    ...(compiledNode.taskNode ? { taskNode: compiledNode.taskNode } : {}),
  } as dNode;

  if (!isStartOrEndNode(compiledNode)) {
    const nodeExecutionInfo = getNodeExecutionDetails(output, workflowClosure?.tasks);
    Object.assign(output, { nodeExecutionInfo });
  }

  staticExecutionIdsMap[output.scopedId] = compiledNode;
  return output;
};

const buildBranchStartEndNodes = (
  root: dNode,
  nodeMetadataMap: ScopedIdExpandedMap = {},
  staticExecutionIdsMap: any = {},
  workflowClosure: CompiledWorkflowClosure = {} as CompiledWorkflowClosure,
) => {
  const startNode = createDNode({
    compiledNode: {
      id: `${root.id}-${startNodeId}`,
      metadata: {
        name: DISPLAY_NAME_START,
      },
    } as CompiledNode,
    typeOverride: dTypes.nestedStart,
    nodeMetadataMap,
    staticExecutionIdsMap,
    compiledWorkflowClosure: workflowClosure,
  });

  const endNode = createDNode({
    compiledNode: {
      id: `${root.id}-${endNodeId}`,
      metadata: {
        name: DISPLAY_NAME_END,
      },
    } as CompiledNode,
    typeOverride: dTypes.nestedEnd,
    nodeMetadataMap,
    staticExecutionIdsMap,
    compiledWorkflowClosure: workflowClosure,
  });

  return {
    startNode,
    endNode,
  };
};

interface CreateDEdgeProps {
  sourceId: string;
  targetId: string;
}
const createDEdge = ({ sourceId, targetId }: CreateDEdgeProps): dEdge => {
  const id = `${sourceId}->${targetId}`;
  const edge: dEdge = {
    sourceId,
    targetId,
    id,
  };
  return edge;
};

type NodeMap = Record<
  string,
  {
    dNode: dNode;
    compiledNode: CompiledNode;
  }
>;
interface ParseWorkflowEdgesProps {
  root: dNode;
  context: ConnectionSet;
  ingress: string;
  nodeMap: NodeMap;
}
const buildWorkflowEdges = ({ root, context, ingress, nodeMap }: ParseWorkflowEdgesProps) => {
  const downstreamIds = context.downstream[ingress].ids;

  for (let i = 0; i < downstreamIds.length; i++) {
    const source = nodeMap[ingress]?.dNode.scopedId;
    const target = nodeMap[downstreamIds[i]]?.dNode.scopedId;
    if (source && target) {
      const edge: dEdge = createDEdge({
        sourceId: source,
        targetId: target,
      });
      root.edges.push(edge);
      if (context.downstream[downstreamIds[i]]) {
        buildWorkflowEdges({ root, context, ingress: downstreamIds[i], nodeMap });
      }
    }
  }
};

/**
 * Handles parsing CompiledNode
 *
 * @param node           CompiledNode to parse
 * @param root          Root node for the graph that will be rendered
 * @param workflow      Main/root workflow
 */
interface ParseNodeProps {
  node: CompiledNode;
  root?: dNode;
  nodeMetadataMap?: any;
  staticExecutionIdsMap: any;
  compiledWorkflowClosure: CompiledWorkflowClosure;
}
const parseNode = ({
  node,
  root,
  nodeMetadataMap,
  staticExecutionIdsMap,
  compiledWorkflowClosure,
}: ParseNodeProps) => {
  let dNode;

  if (node.branchNode) {
    dNode = createDNode({
      compiledNode: node,
      parentDNode: root,
      nodeMetadataMap,
      staticExecutionIdsMap,
      compiledWorkflowClosure,
    });
    buildDAG({
      root: dNode,
      contextCompiledNode: node,
      graphType: dTypes.branch,
      nodeMetadataMap,
      staticExecutionIdsMap,
      compiledWorkflowClosure,
    });
  } else if (node.workflowNode) {
    if (node.workflowNode.launchplanRef) {
      dNode = createDNode({
        compiledNode: node,
        parentDNode: root,
        nodeMetadataMap,
        staticExecutionIdsMap,
        compiledWorkflowClosure,
      });
    } else {
      const id = node.workflowNode.subWorkflowRef;
      const subworkflow = getSubWorkflowFromId(id as any, compiledWorkflowClosure);
      dNode = createDNode({
        compiledNode: node,
        parentDNode: root,
        nodeMetadataMap,
        staticExecutionIdsMap,
        compiledWorkflowClosure,
      });
      buildDAG({
        root: dNode,
        contextWorkflow: subworkflow,
        graphType: dTypes.subworkflow,
        nodeMetadataMap,
        staticExecutionIdsMap,
        compiledWorkflowClosure,
      });
    }
  } else if (node?.arrayNode) {
    const arrayNode = (node.arrayNode as ArrayNode).node;
    const taskNode = arrayNode.taskNode as TaskNode;
    const taskType: CompiledTask = getTaskTypeFromCompiledNode(
      taskNode,
      compiledWorkflowClosure.tasks,
    ) as CompiledTask;
    dNode = createDNode({
      compiledNode: node,
      parentDNode: root,
      taskTemplate: taskType,
      nodeMetadataMap,
      staticExecutionIdsMap,
      compiledWorkflowClosure,
    });
  } else if (node.taskNode) {
    const taskNode = node.taskNode as TaskNode;
    const taskType: CompiledTask = getTaskTypeFromCompiledNode(
      taskNode,
      compiledWorkflowClosure.tasks,
    ) as CompiledTask;
    dNode = createDNode({
      compiledNode: node as CompiledNode,
      parentDNode: root,
      taskTemplate: taskType,
      nodeMetadataMap,
      staticExecutionIdsMap,
      compiledWorkflowClosure,
    });
  } else {
    dNode = createDNode({
      compiledNode: node,
      parentDNode: root,
      nodeMetadataMap,
      staticExecutionIdsMap,
      compiledWorkflowClosure,
    });
  }
  root?.nodes.push(dNode);
};

/**
 * Recursively renders DAG of given context.
 *
 * @param root          Root node of DAG (note: will mutate root)
 * @param graphType     DAG type (eg, branch, workflow)
 * @param context       Pointer to current context of response
 */
interface BuildDAGProps {
  contextWorkflow?: CompiledWorkflow;
  contextCompiledNode?: CompiledNode;
  compiledWorkflowClosure: CompiledWorkflowClosure;
  graphType: dTypes;
  nodeMetadataMap: ScopedIdExpandedMap;
  root: dNode;
  staticExecutionIdsMap: any;
}
// @ts-ignore
const buildDAG = ({
  contextWorkflow,
  contextCompiledNode,
  compiledWorkflowClosure,
  graphType,
  nodeMetadataMap,
  root,
  staticExecutionIdsMap,
}: BuildDAGProps) => {
  switch (graphType) {
    case dTypes.branch:
      parseBranch({
        root,
        contextCompiledNode: contextCompiledNode!,
        nodeMetadataMap,
        staticExecutionIdsMap,
        workflow: compiledWorkflowClosure,
      });
      break;
    case dTypes.subworkflow:
      parseWorkflow({
        root,
        context: contextWorkflow!,
        nodeMetadataMap,
        staticExecutionIdsMap,
        compiledWorkflowClosure,
      });
      break;
    case dTypes.primary:
      return parseWorkflow({
        root,
        context: contextWorkflow!,
        nodeMetadataMap,
        staticExecutionIdsMap,
        compiledWorkflowClosure,
      });
    default: {
      throw new Error('unhandled case');
    }
  }
};

/**
 * Handles parsing branch from CompiledNode
 *
 * @param root          Root node for the branch that will be rendered
 * @param context       Current branch node being parsed
 */
interface ParseBranchProps {
  root: dNode;
  contextCompiledNode: CompiledNode;
  nodeMetadataMap: ScopedIdExpandedMap;
  staticExecutionIdsMap: any;
  workflow: any;
}
const parseBranch = ({
  root,
  contextCompiledNode,
  nodeMetadataMap,
  staticExecutionIdsMap,
  workflow,
}: ParseBranchProps) => {
  const otherNode = contextCompiledNode.branchNode?.ifElse?.other;
  const thenNode = contextCompiledNode.branchNode?.ifElse?.case?.thenNode as CompiledNode;
  const elseNode = contextCompiledNode.branchNode?.ifElse?.elseNode as CompiledNode;

  /* Check: then (if) case */
  if (thenNode) {
    parseNode({
      node: thenNode,
      root,
      nodeMetadataMap,
      staticExecutionIdsMap,
      compiledWorkflowClosure: workflow,
    });
  }

  /* Check: else case */
  if (elseNode) {
    parseNode({
      node: elseNode,
      root,
      nodeMetadataMap,
      staticExecutionIdsMap,
      compiledWorkflowClosure: workflow,
    });
  }

  /* Check: other (else-if) case */
  if (otherNode) {
    otherNode.map((otherItem) => {
      const otherCompiledNode: CompiledNode = otherItem.thenNode as CompiledNode;
      parseNode({
        node: otherCompiledNode,
        root,
        nodeMetadataMap,
        staticExecutionIdsMap,
        compiledWorkflowClosure: workflow,
      });
    });
  }

  /* Add edges and add start/end nodes */
  const { startNode, endNode } = buildBranchStartEndNodes(root, staticExecutionIdsMap);
  for (let i = 0; i < root.nodes.length; i++) {
    const startEdge: dEdge = createDEdge({
      sourceId: startNode.id,
      targetId: root.nodes[i].scopedId,
    });
    const endEdge: dEdge = createDEdge({
      sourceId: root.nodes[i].scopedId,
      targetId: endNode.id,
    });
    root.edges.push(startEdge);
    root.edges.push(endEdge);
  }
  root.nodes.push(startNode);
  root.nodes.push(endNode);
};

/**
 * Handles parsing CompiledWorkflow
 *
 * @param root          Root node for the graph that will be rendered
 * @param context       The current workflow being parsed
 */
interface ParseWorkflowProps {
  root: dNode;
  context: CompiledWorkflow;
  nodeMetadataMap: ScopedIdExpandedMap;
  staticExecutionIdsMap: any;
  compiledWorkflowClosure: CompiledWorkflowClosure;
}
const parseWorkflow = ({
  root,
  context,
  nodeMetadataMap,
  staticExecutionIdsMap,
  compiledWorkflowClosure,
}: ParseWorkflowProps) => {
  if (!context?.template?.nodes) {
    return root;
  }

  const templateNodeList = context.template.nodes;
  /* Build Nodes from template */
  for (let i = 0; i < templateNodeList.length; i++) {
    const compiledNode: CompiledNode = templateNodeList[i];
    parseNode({
      node: compiledNode,
      root,
      nodeMetadataMap,
      staticExecutionIdsMap,
      compiledWorkflowClosure,
    });
  }

  const nodeMap: NodeMap = {};

  /* Create mapping of CompiledNode.id => dNode.id to build edges */
  for (let i = 0; i < root.nodes.length; i++) {
    const dNode = root.nodes[i];
    nodeMap[dNode.id] = {
      dNode,
      compiledNode: templateNodeList[i],
    };
  }

  /* Build failure node and add downstream connection for edges building */
  const failureNode = { ...context.template.failureNode, failureNode: true };
  if (failureNode && failureNode.id) {
    parseNode({
      node: failureNode as CompiledNode,
      root,
      nodeMetadataMap,
      staticExecutionIdsMap,
      compiledWorkflowClosure,
    });
    nodeMap[failureNode.id] = {
      dNode: root.nodes[root.nodes.length - 1],
      compiledNode: failureNode as CompiledNode,
    };
    if (!context.connections.downstream[startNodeId].ids.includes(failureNode.id)) {
      context.connections.downstream[startNodeId].ids.push(failureNode.id);
      context.connections.downstream[failureNode.id] = {
        ids: [endNodeId],
      };
    }
  }

  /* Build Edges */
  buildWorkflowEdges({
    root,
    context: context.connections,
    ingress: startNodeId,
    nodeMap,
  });
  return root;
};

/**
 * Returns a DAG from Flyte workflow request data
 * @param context input can be either CompiledWorkflow or CompiledNode
 * @returns Display name
 */
export interface TransformerWorkflowToDag {
  dag: dNode;
  staticExecutionIdsMap: {};
  error?: Error;
}
export interface ScopedIdExpandedMap {
  [key: string]: Pick<dNode, 'expanded' | 'isParentNode'>;
}
export const transformerWorkflowToDag = (
  workflowClosure: CompiledWorkflowClosure,
  nodeMetadataMap: ScopedIdExpandedMap = {},
): TransformerWorkflowToDag => {
  // clone workflowClosure to prevent mutation
  const workflowClosureCopy = cloneDeep(workflowClosure);
  const { primary } = workflowClosureCopy;
  const staticExecutionIdsMap = {};

  const primaryWorkflowRoot = createDNode({
    compiledNode: {
      id: startNodeId,
    } as CompiledNode,
    nodeMetadataMap,
    staticExecutionIdsMap,
    compiledWorkflowClosure: workflowClosureCopy,
  });
  let dag: dNode;

  try {
    dag = buildDAG({
      root: primaryWorkflowRoot,
      contextWorkflow: primary,
      graphType: dTypes.primary,
      nodeMetadataMap,
      staticExecutionIdsMap,
      compiledWorkflowClosure: workflowClosureCopy,
    })!;
    debug('output:', dag);
    return { dag, staticExecutionIdsMap };
  } catch (error) {
    dag = {} as any;
    debug('output:', dag);
    return { dag, staticExecutionIdsMap, error };
  }
};
