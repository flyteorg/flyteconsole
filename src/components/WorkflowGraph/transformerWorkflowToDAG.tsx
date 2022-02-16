import {
    DISPLAY_NAME_END,
    DISPLAY_NAME_START
} from 'components/flytegraph/ReactFlow/utils';
import { dTypes, dEdge, dNode } from 'models/Graph/types';
import { startNodeId, endNodeId } from 'models/Node/constants';
import { CompiledNode, ConnectionSet, TaskNode } from 'models/Node/types';
import { CompiledTask } from 'models/Task/types';
import {
    CompiledWorkflow,
    CompiledWorkflowClosure,
    WorkflowTemplate
} from 'models/Workflow/types';
import {
    isEndNode,
    isStartNode,
    isStartOrEndNode,
    getDisplayName,
    getSubWorkflowFromId,
    getNodeTypeFromCompiledNode,
    getTaskTypeFromCompiledNode
} from './utils';

export interface staticNodeExecutionIds {
    staticNodeId: string;
}

export const debugOnName = (compiledNode, name = 'okta') => {
    const displayName = getDisplayName(compiledNode);
    if (displayName == name) {
        console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
        return true;
    } else {
        return false;
    }
};

/**
 * Returns a DAG from Flyte workflow request data
 * @param context input can be either CompiledWorkflow or CompiledNode
 * @returns Display name
 */
export const transformerWorkflowToDAG = (
    workflow: CompiledWorkflowClosure
): any => {
    console.log('@transformerWorkflowToDAG input(workflow):', workflow);
    const { primary } = workflow;
    const staticExecutionIdsMap = {};

    const createDEdge = ({ sourceId, targetId }): dEdge => {
        const id = `${sourceId}->${targetId}`;
        const edge: dEdge = {
            sourceId: sourceId,
            targetId: targetId,
            id: id
        };
        return edge;
    };

    const createDNode = (props): dNode => {
        const { compiledNode, parentDNode, taskTemplate, typeOverride } = props;
        const nodeValue =
            taskTemplate == null
                ? compiledNode
                : { ...compiledNode, ...taskTemplate };

        /* scopedId is used for requests; this creates format used by contract */
        let scopedId = '';
        if (
            isStartOrEndNode(compiledNode) &&
            parentDNode &&
            !isStartOrEndNode(parentDNode)
        ) {
            /* Need to scope ids for start/end nodes for ReactFlow provider refresh */
            scopedId = `${parentDNode.scopedId}-${compiledNode.id}`;
        } else if (parentDNode && parentDNode.type != dTypes.start) {
            if (
                parentDNode.type == dTypes.branch ||
                parentDNode.type == dTypes.subworkflow
            ) {
                /* Note: request contract indicates nested (subworkflow, branch) with -${retries}- */
                const retries = compiledNode.metadata?.retries.retries;
                scopedId = `${parentDNode.scopedId}-${retries}-${compiledNode.id}`;
            } else {
                scopedId = `${parentDNode.scopedId}-${compiledNode.id}`;
            }
        } else {
            /* Case: primary workflow nodes won't have parents */
            scopedId = compiledNode.id;
        }

        /**
         * @TODO decide if we want to nested/standard start/end in
         *       UX; saving untilthat is decided.
         */
        const type =
            typeOverride == null
                ? getNodeTypeFromCompiledNode(compiledNode)
                : typeOverride;

        const output = {
            id: compiledNode.id,
            scopedId: scopedId,
            value: nodeValue,
            type: type,
            name: getDisplayName(compiledNode),
            nodes: [],
            edges: []
        } as dNode;

        staticExecutionIdsMap[output.scopedId] = compiledNode;
        return output;
    };

    const buildBranchStartEndNodes = (root: dNode) => {
        const startNode = createDNode({
            compiledNode: {
                id: `${root.id}-${startNodeId}`,
                metadata: {
                    name: DISPLAY_NAME_START
                }
            } as CompiledNode,
            typeOverride: dTypes.nestedStart
        });

        const endNode = createDNode({
            compiledNode: {
                id: `${root.id}-${endNodeId}`,
                metadata: {
                    name: DISPLAY_NAME_END
                }
            } as CompiledNode,
            typeOverride: dTypes.nestedEnd
        });

        return {
            startNode,
            endNode
        };
    };

    const buildBranchNodeWidthType = (node, root, workflow) => {
        console.log('@buildBranchNodeWidthType:');
        console.log('\t => node', node.id);
        console.log('\t => root', root.id);
        const taskNode = node.taskNode as TaskNode;
        let taskType: CompiledTask | null = null;
        if (taskNode) {
            taskType = getTaskTypeFromCompiledNode(
                taskNode,
                workflow.tasks
            ) as CompiledTask;
        }
        const dNode = createDNode({
            compiledNode: node as CompiledNode,
            parentDNode: root,
            taskTemplate: taskType
        });
        root.nodes.push(dNode);
    };

    /**
     * Will parse values when dealing with a Branch and recursively find and build
     * any other node types.
     * @param root      Parent root for Branch; will render independent DAG and
     *                  add as a child node of root.
     * @param parentCompiledNode   CompiledNode of origin
     */
    const parseBranch = (
        root: dNode,
        parentCompiledNode: CompiledNode,
        workflow: CompiledWorkflowClosure
    ) => {
        const otherNode = parentCompiledNode.branchNode?.ifElse?.other;
        const thenNode = parentCompiledNode.branchNode?.ifElse?.case
            ?.thenNode as CompiledNode;
        const elseNode = parentCompiledNode.branchNode?.ifElse
            ?.elseNode as CompiledNode;

        /* Check: if thenNode has branch : else add theNode */
        if (thenNode.branchNode) {
            console.log('BRANCH CASE 1');
            const thenNodeDNode = createDNode({
                compiledNode: thenNode,
                parentDNode: root
            });
            buildDAG(thenNodeDNode, thenNode, dTypes.branch, workflow);
            root.nodes.push(thenNodeDNode);
        } else {
            console.log('BRANCH CASE 2');
            buildBranchNodeWidthType(thenNode, root, workflow);
        }

        /* Check: else case */
        if (elseNode) {
            console.log('BRANCH CASE 3');
            buildBranchNodeWidthType(elseNode, root, workflow);
        }

        /* Check: other case */
        if (otherNode) {
            otherNode.map(otherItem => {
                const otherCompiledNode: CompiledNode = otherItem.thenNode as CompiledNode;
                if (otherCompiledNode.branchNode) {
                    console.log('BRANCH CASE 4');
                    const otherDNodeBranch = createDNode({
                        compiledNode: otherCompiledNode,
                        parentDNode: root
                    });
                    buildDAG(
                        otherDNodeBranch,
                        otherCompiledNode,
                        dTypes.branch,
                        workflow
                    );
                } else {
                    buildBranchNodeWidthType(otherCompiledNode, root, workflow);
                }
            });
        }

        /* Add edges and add start/end nodes */
        const { startNode, endNode } = buildBranchStartEndNodes(root);
        for (let i = 0; i < root.nodes.length; i++) {
            const startEdge: dEdge = {
                sourceId: startNode.id,
                targetId: root.nodes[i].scopedId
            };
            const endEdge: dEdge = {
                sourceId: root.nodes[i].scopedId,
                targetId: endNode.id
            };
            root.edges.push(startEdge);
            root.edges.push(endEdge);
        }
        root.nodes.push(startNode);
        root.nodes.push(endNode);
    };

    const buildNodesFromWFContext = (
        root: dNode,
        contextWf: WorkflowTemplate,
        type: dTypes,
        workflow: CompiledWorkflowClosure
    ): void => {
        for (let i = 0; i < contextWf.nodes.length; i++) {
            const compiledNode: CompiledNode = contextWf.nodes[i];
            let dNode: dNode;

            if (
                (isStartNode(compiledNode) || isEndNode(compiledNode)) &&
                type == dTypes.subworkflow
            ) {
                dNode = createDNode({
                    compiledNode: compiledNode,
                    parentDNode: root
                });
            } else if (compiledNode.branchNode) {
                /* Case: recurse on branch node */
                dNode = createDNode({
                    compiledNode: compiledNode,
                    parentDNode: root
                });
                buildDAG(dNode, compiledNode, dTypes.branch, workflow);
            } else if (compiledNode.workflowNode) {
                /* Case: recurse on workflow node */
                const id = compiledNode.workflowNode.subWorkflowRef;
                const subworkflow = getSubWorkflowFromId(id, workflow);
                if (!isStartNode(root)) {
                    dNode = createDNode({
                        compiledNode: compiledNode,
                        parentDNode: root
                    });
                } else {
                    /**
                     * @TODO may not need this else case
                     */
                    dNode = createDNode({
                        compiledNode: compiledNode,
                        parentDNode: root
                    });
                }
                buildDAG(dNode, subworkflow, dTypes.subworkflow, workflow);
            } else if (compiledNode.taskNode) {
                /* Case: build task node */
                const taskType = getTaskTypeFromCompiledNode(
                    compiledNode.taskNode,
                    workflow.tasks
                );
                dNode = createDNode({
                    compiledNode: compiledNode,
                    parentDNode: root,
                    taskTemplate: taskType
                });
            } else {
                /* Else: primary start/finish nodes */
                dNode = createDNode({
                    compiledNode: compiledNode,
                    parentDNode: root
                });
            }

            root.nodes.push(dNode);
        }
    };

    const buildOutWorkflowEdges = (
        root,
        context: ConnectionSet,
        ingress,
        nodeMap
    ) => {
        const list = context.downstream[ingress].ids;
        for (let i = 0; i < list.length; i++) {
            const source = nodeMap[ingress].dNode.scopedId;
            const target = nodeMap[list[i]].dNode.scopedId;
            const edge: dEdge = createDEdge({
                sourceId: source,
                targetId: target
            });
            root.edges.push(edge);
            if (context.downstream[list[i]]) {
                buildOutWorkflowEdges(root, context, list[i], nodeMap);
            }
        }
    };

    /**
     * Handles parsing CompiledWorkflow data objects
     *
     * @param root          Root node for the graph that will be rendered
     * @param context       The current workflow (note: could be subworkflow)
     * @param type          Type (sub or primrary)
     * @param workflow      Main parent workflow
     */
    const parseWorkflow = (
        root,
        context: CompiledWorkflow,
        type: dTypes,
        workflow: CompiledWorkflowClosure
    ) => {
        /* Note: only Primary workflow is null, all others have root */
        let contextualRoot;
        if (root) {
            contextualRoot = root;
        } else {
            const primaryStart = createDNode({
                compiledNode: {
                    id: startNodeId
                } as CompiledNode
            });
            contextualRoot = primaryStart;
        }

        /* Build Nodes */
        buildNodesFromWFContext(
            contextualRoot,
            context.template,
            type,
            workflow
        );

        const nodesList = context.template.nodes;
        const nodeMap = {};

        /* Create mapping of id => dNode for all child nodes of root to build edges */
        for (let i = 0; i < contextualRoot.nodes.length; i++) {
            const dNode = contextualRoot.nodes[i];
            nodeMap[dNode.id] = {
                dNode: dNode,
                compiledNode: nodesList[i]
            };
        }

        /* Build Edges */
        buildOutWorkflowEdges(
            contextualRoot,
            context.connections,
            startNodeId,
            nodeMap
        );
        return contextualRoot;
    };

    /**
     * Mutates root (if passed) by recursively rendering DAG of given context.
     *
     * @param root          Root node of DAG
     * @param graphType     DAG type (eg, branch, workflow)
     * @param context       Pointer to current context of response
     */
    const buildDAG = (
        root: dNode | null,
        context: any,
        graphType: dTypes,
        workflow: CompiledWorkflowClosure
    ) => {
        switch (graphType) {
            case dTypes.branch:
                parseBranch(root as dNode, context, workflow);
                break;
            case dTypes.subworkflow:
                parseWorkflow(root, context, graphType, workflow);
                break;
            case dTypes.primary:
                return parseWorkflow(root, context, graphType, workflow);
        }
    };
    const dag: dNode = buildDAG(null, primary, dTypes.primary, workflow);
    console.log('\n\n\n\n\n@workflowToDag =>', dag);
    return { dag, staticExecutionIdsMap };
};
