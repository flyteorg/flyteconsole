import { transformerWorkflowToDAG } from './transformerWorkflowToDAG';
import { dNode } from 'models/Graph/types';
import { Workflow } from 'models/Workflow/types';
import * as React from 'react';
import ReactFlowGraphComponent from 'components/flytegraph/ReactFlow/ReactFlowGraphComponent';
import { Error } from 'models/Common/types';
import { NonIdealState } from 'components/common/NonIdealState';
import { DataError } from 'components/Errors/DataError';
import { NodeExecutionsContext } from 'components/Executions/contexts';
import { WaitForQuery } from 'components/common/WaitForQuery';
import { useQuery, useQueryClient } from 'react-query';
import { makeNodeExecutionDynamicWorkflowQuery } from 'components/Workflow/workflowQueries';

export interface WorkflowGraphProps {
    onNodeSelectionChanged: (selectedNodes: string[]) => void;
    selectedNodes?: string[];
    workflow: Workflow;
    nodeExecutionsById?: any;
}

interface PrepareDAGResult {
    dag: dNode | null;
    staticExecutionIdsMap?: any;
    error?: Error;
}

function workflowToDag(workflow: Workflow): PrepareDAGResult {
    try {
        if (!workflow.closure) {
            throw new Error('Workflow has no closure');
        }
        if (!workflow.closure.compiledWorkflow) {
            throw new Error('Workflow closure missing a compiled workflow');
        }
        const { compiledWorkflow } = workflow.closure;
        const { dag, staticExecutionIdsMap } = transformerWorkflowToDAG(
            compiledWorkflow
        );
        return { dag, staticExecutionIdsMap };
    } catch (e) {
        return {
            dag: null,
            error: e as Error
        };
    }
}

export const WorkflowGraph: React.FC<WorkflowGraphProps> = props => {
    const { onNodeSelectionChanged, nodeExecutionsById, workflow } = props;
    const { dag, staticExecutionIdsMap, error } = workflowToDag(workflow);
    /**
     * Note:
     *  Dynamic nodes are deteremined at runtime and thus do not come
     *  down as part of the workflow closure. We can detect and place
     *  dynamic nodes by finding orphan execution id's and then map
     *  those executions into the dag by using the executions 'uniqueParentId'
     *  to render that node as a subworkflow
     */
    const checkForDynamicExeuctions = (allExecutions, staticExecutions) => {
        const parentsToFetch = {};
        for (const executionId in allExecutions) {
            if (!staticExecutions[executionId]) {
                const dynamicExecutionId = allExecutions[executionId];
                parentsToFetch[dynamicExecutionId.fromUniqueParentId] =
                    dynamicExecutionId.id;
            }
        }
        const result = {};
        for (const parentId in parentsToFetch) {
            result[parentId] = allExecutions[parentId];
        }
        return result;
    };

    const dynamicParents = checkForDynamicExeuctions(
        nodeExecutionsById,
        staticExecutionIdsMap
    );

    const dynamicWorkflowQuery = useQuery(
        makeNodeExecutionDynamicWorkflowQuery(useQueryClient(), dynamicParents)
    );

    const renderReactFlowGraph = dynamicWorkflows => {
        console.log('@renderReactFlowGraph');
        console.log('\tworkflow:', workflow);
        console.log('\tdynamicWorkflows', dynamicWorkflows);

        const merged = dag;
        return (
            <ReactFlowGraphComponent
                nodeExecutionsById={nodeExecutionsById}
                data={merged}
                onNodeSelectionChanged={onNodeSelectionChanged}
            />
        );
    };

    if (error) {
        return (
            <NonIdealState
                title="Cannot render Workflow graph"
                description={error.message}
            />
        );
    } else {
        return (
            <NodeExecutionsContext.Provider value={nodeExecutionsById}>
                <WaitForQuery
                    errorComponent={DataError}
                    query={dynamicWorkflowQuery}
                >
                    {renderReactFlowGraph}
                </WaitForQuery>
            </NodeExecutionsContext.Provider>
        );
    }
};
