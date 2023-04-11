import {
  DISPLAY_NAME_END,
  DISPLAY_NAME_START,
} from 'components/flytegraph/ReactFlow/utils';
import { createDebugLogger } from 'common/log';
import { dTypes, dEdge, dNode } from 'models/Graph/types';
import { startNodeId, endNodeId } from 'models/Node/constants';
import { CompiledNode, ConnectionSet, TaskNode } from 'models/Node/types';
import { CompiledTask } from 'models/Task/types';
import {
  CompiledWorkflow,
  CompiledWorkflowClosure,
} from 'models/Workflow/types';
import { isParentNode } from 'components/Executions/utils';
import { isStartOrEndNode } from 'models/Node/utils';
import { NodeExecutionsById } from 'models';
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
  nodeExecutionsById?: NodeExecutionsById;
  staticExecutionIdsMap?: any;
}
const createDNode = ({
  compiledNode,
  parentDNode,
  taskTemplate,
  typeOverride,
  nodeExecutionsById,
  staticExecutionIdsMap,
}: CreateDNodeProps): dNode => {
  const nodeValue =
    taskTemplate == null ? compiledNode : { ...compiledNode, ...taskTemplate };

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
  if (
    isStartOrEndNode(compiledNode) &&
    parentDNode &&
    !isStartOrEndNode(parentDNode)
  ) {
    scopedId = `${parentDNode.scopedId}-${compiledNode.id}`;
  } else if (parentDNode && parentDNode.type !== dTypes.start) {
    if (
      parentDNode.type === dTypes.branch ||
      parentDNode.type === dTypes.subworkflow
    ) {
      scopedId = `${parentDNode.scopedId}-0-${compiledNode.id}`;
    } else {
      scopedId = `${parentDNode.scopedId}-${compiledNode.id}`;
    }
  } else {
    /* Case: primary workflow nodes won't have parents */
    scopedId = compiledNode.id;
  }
  const type =
    typeOverride == null
      ? getNodeTypeFromCompiledNode(compiledNode)
      : typeOverride;

  const nodeExecution = nodeExecutionsById?.[scopedId];
  const isParent = nodeExecution && isParentNode(nodeExecution);

  const output = {
    id: compiledNode.id,
    scopedId: scopedId,
    value: nodeValue,
    type: type,
    name: getDisplayName(compiledNode),
    nodes: [],
    edges: [],
    gateNode: compiledNode.gateNode,
    isParentNode: isParent,
    ...(nodeExecution ? { execution: nodeExecution } : {}),
  } as dNode;

  staticExecutionIdsMap[output.scopedId] = compiledNode;
  return output;
};

const buildBranchStartEndNodes = (
  root: dNode,
  nodeExecutionsById: NodeExecutionsById = {},
  staticExecutionIdsMap: any = {},
) => {
  const startNode = createDNode({
    compiledNode: {
      id: `${root.id}-${startNodeId}`,
      metadata: {
        name: DISPLAY_NAME_START,
      },
    } as CompiledNode,
    typeOverride: dTypes.nestedStart,
    nodeExecutionsById,
    staticExecutionIdsMap,
  });

  const endNode = createDNode({
    compiledNode: {
      id: `${root.id}-${endNodeId}`,
      metadata: {
        name: DISPLAY_NAME_END,
      },
    } as CompiledNode,
    typeOverride: dTypes.nestedEnd,
    nodeExecutionsById,
    staticExecutionIdsMap,
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
    sourceId: sourceId,
    targetId: targetId,
    id: id,
  };
  return edge;
};

const buildWorkflowEdges = (root, context: ConnectionSet, ingress, nodeMap) => {
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
        buildWorkflowEdges(root, context, downstreamIds[i], nodeMap);
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
  nodeExecutionsById: NodeExecutionsById;
  staticExecutionIdsMap: any;
  dynamicToMerge: any | null;
  workflow: any;
}
const parseNode = ({
  node,
  root,
  nodeExecutionsById,
  staticExecutionIdsMap,
  dynamicToMerge,
  workflow,
}: ParseNodeProps) => {
  let dNode;
  /**
   * Note: if node is dynamic we must add dynamicWorkflow
   * as a subworkflow on the root workflow. We also need to check
   * if the dynamic workflow has any subworkflows and add them too.
   */
  if (dynamicToMerge) {
    const scopedId = `${root?.scopedId}-0-${node.id}`;
    const id = dynamicToMerge[scopedId] != null ? scopedId : node.id;
    if (dynamicToMerge[id]) {
      const dynamicWorkflow = dynamicToMerge[id].dynamicWorkflow;

      if (dynamicWorkflow) {
        const dWorkflowId =
          dynamicWorkflow.metadata?.specNodeId || dynamicWorkflow.id;
        const dPrimaryWorkflow = dynamicWorkflow.compiledWorkflow.primary;

        node['workflowNode'] = {
          subWorkflowRef: dWorkflowId,
        };

        /* 1. Add primary workflow as subworkflow on root */
        if (getSubWorkflowFromId(dWorkflowId, workflow) === false) {
          workflow.subWorkflows?.push(dPrimaryWorkflow);
        }

        /* 2. Add subworkflows as subworkflows on root */
        const dSubWorkflows = dynamicWorkflow.compiledWorkflow.subWorkflows;

        for (let i = 0; i < dSubWorkflows.length; i++) {
          const subworkflow = dSubWorkflows[i];
          const subId = subworkflow.template.id;
          if (getSubWorkflowFromId(subId, workflow) === false) {
            workflow.subWorkflows?.push(subworkflow);
          }
        }
      }
      /* Remove entry when done to prevent infinite loop */
      delete dynamicToMerge[node.id];
    }
  }

  if (node.branchNode) {
    dNode = createDNode({
      compiledNode: node,
      parentDNode: root,
      nodeExecutionsById,
      staticExecutionIdsMap,
    });
    buildDAG(
      dNode,
      node,
      dTypes.branch,
      dynamicToMerge,
      nodeExecutionsById,
      staticExecutionIdsMap,
      workflow,
    );
  } else if (node.workflowNode) {
    if (node.workflowNode.launchplanRef) {
      dNode = createDNode({
        compiledNode: node,
        parentDNode: root,
        nodeExecutionsById,
        staticExecutionIdsMap,
      });
    } else {
      const id = node.workflowNode.subWorkflowRef;
      const subworkflow = getSubWorkflowFromId(id, workflow);
      dNode = createDNode({
        compiledNode: node,
        parentDNode: root,
        nodeExecutionsById,
        staticExecutionIdsMap,
      });
      buildDAG(
        dNode,
        subworkflow,
        dTypes.subworkflow,
        dynamicToMerge,
        nodeExecutionsById,
        staticExecutionIdsMap,
        workflow,
      );
    }
  } else if (node.taskNode) {
    const taskNode = node.taskNode as TaskNode;
    const taskType: CompiledTask = getTaskTypeFromCompiledNode(
      taskNode,
      workflow.tasks,
    ) as CompiledTask;
    dNode = createDNode({
      compiledNode: node as CompiledNode,
      parentDNode: root,
      taskTemplate: taskType,
      nodeExecutionsById,
      staticExecutionIdsMap,
    });
  } else {
    dNode = createDNode({
      compiledNode: node,
      parentDNode: root,
      nodeExecutionsById,
      staticExecutionIdsMap,
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
const buildDAG = (
  root: dNode,
  context: any,
  graphType: dTypes,
  dynamicToMerge,
  nodeExecutionsById,
  staticExecutionIdsMap,
  workflow,
) => {
  switch (graphType) {
    case dTypes.branch:
      parseBranch({
        root,
        context,
        dynamicToMerge,
        nodeExecutionsById,
        staticExecutionIdsMap,
        workflow,
      });
      break;
    case dTypes.subworkflow:
      parseWorkflow(
        root,
        context,
        dynamicToMerge,
        nodeExecutionsById,
        staticExecutionIdsMap,
        workflow,
      );
      break;
    case dTypes.primary:
      return parseWorkflow(
        root,
        context,
        dynamicToMerge,
        nodeExecutionsById,
        staticExecutionIdsMap,
        workflow,
      );
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
  context: CompiledNode;
  nodeExecutionsById: NodeExecutionsById;
  staticExecutionIdsMap: any;
  dynamicToMerge: any | null;
  workflow: any;
}
const parseBranch = ({
  root,
  context,
  dynamicToMerge,
  nodeExecutionsById,
  staticExecutionIdsMap,
  workflow,
}: ParseBranchProps) => {
  const otherNode = context.branchNode?.ifElse?.other;
  const thenNode = context.branchNode?.ifElse?.case?.thenNode as CompiledNode;
  const elseNode = context.branchNode?.ifElse?.elseNode as CompiledNode;

  /* Check: then (if) case */
  if (thenNode) {
    parseNode({
      node: thenNode,
      root: root,
      dynamicToMerge,
      nodeExecutionsById,
      staticExecutionIdsMap,
      workflow,
    });
  }

  /* Check: else case */
  if (elseNode) {
    parseNode({
      node: elseNode,
      root: root,
      dynamicToMerge,
      nodeExecutionsById,
      staticExecutionIdsMap,
      workflow,
    });
  }

  /* Check: other (else-if) case */
  if (otherNode) {
    otherNode.map(otherItem => {
      const otherCompiledNode: CompiledNode =
        otherItem.thenNode as CompiledNode;
      parseNode({
        node: otherCompiledNode,
        root: root,
        dynamicToMerge,
        nodeExecutionsById,
        staticExecutionIdsMap,
        workflow,
      });
    });
  }

  /* Add edges and add start/end nodes */
  const { startNode, endNode } = buildBranchStartEndNodes(
    root,
    nodeExecutionsById,
    staticExecutionIdsMap,
  );
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
const parseWorkflow = (
  root,
  context: CompiledWorkflow,
  dynamicToMerge,
  nodeExecutionsById,
  staticExecutionIdsMap,
  workflow,
) => {
  if (!context?.template?.nodes) {
    return root;
  }

  const templateNodeList = context.template.nodes;

  /* Build Nodes from template */
  for (let i = 0; i < templateNodeList.length; i++) {
    const compiledNode: CompiledNode = templateNodeList[i];
    parseNode({
      node: compiledNode,
      root: root,
      dynamicToMerge,
      nodeExecutionsById,
      staticExecutionIdsMap,
      workflow,
    });
  }

  const nodeMap = {};

  /* Create mapping of CompiledNode.id => dNode.id to build edges */
  for (let i = 0; i < root.nodes.length; i++) {
    const dNode = root.nodes[i];
    nodeMap[dNode.id] = {
      dNode: dNode,
      compiledNode: templateNodeList[i],
    };
  }

  /* Build Edges */
  buildWorkflowEdges(root, context.connections, startNodeId, nodeMap);
  return root;
};

/**
 * Returns a DAG from Flyte workflow request data
 * @param context input can be either CompiledWorkflow or CompiledNode
 * @returns Display name
 */
export const transformerWorkflowToDag = (
  workflow: CompiledWorkflowClosure,
  dynamicToMerge: any | null = null,
  nodeExecutionsById = {},
) => {
  const { primary } = workflow;
  const staticExecutionIdsMap = {};

  const primaryWorkflowRoot = createDNode({
    compiledNode: {
      id: startNodeId,
    } as CompiledNode,
    nodeExecutionsById,
    staticExecutionIdsMap,
  });
  let dag: dNode;

  try {
    dag = buildDAG(
      primaryWorkflowRoot,
      primary,
      dTypes.primary,
      dynamicToMerge,
      nodeExecutionsById,
      staticExecutionIdsMap,
      workflow,
    );
    debug('output:', dag);
    return { dag, staticExecutionIdsMap };
  } catch (error) {
    dag = {} as any;
    debug('output:', dag);
    return { dag, staticExecutionIdsMap, error };
  }
};
