import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { Core } from 'flyteidl';
import { Identifier } from 'models/Common/types';
import { NodeExecution } from 'models/Execution/types';
import { NodeExecutionDetails } from '../../types';
import { useQueryClient } from 'react-query';
import { fetchWorkflow } from 'components/Workflow/workflowQueries';
import { isIdEqual, UNKNOWN_DETAILS } from './types';
import {
    createExecutionDetails,
    CurrentExecutionDetails
} from './createExecutionArray';

interface NodeExecutionDetailsState {
    getNodeExecutionDetails: (
        nodeExecution?: NodeExecution
    ) => NodeExecutionDetails;
}

/** Use this Context to redefine Provider returns in storybooks */
export const NodeExecutionDetailsContext = createContext<
    NodeExecutionDetailsState
>({
    /** Default values used if ContextProvider wasn't initialized. */
    getNodeExecutionDetails: () => {
        console.error(
            'ERROR: No NodeExecutionDetailsContextProvider was find in parent components.'
        );
        return UNKNOWN_DETAILS;
    }
});

/**  Should be used to get NodeExecutionDetails for a specific nodeExecution. */
export const useNodeExecutionDetails = (nodeExecution?: NodeExecution) =>
    useContext(NodeExecutionDetailsContext).getNodeExecutionDetails(
        nodeExecution
    );

/** Could be used to access the whole NodeExecutionDetailsState */
export const useNodeExecutionContext = (): NodeExecutionDetailsState =>
    useContext(NodeExecutionDetailsContext);

interface ExecutionDetailsProviderProps {
    workflowId: Identifier;
    children?: React.ReactNode;
}

/** Should wrap "top level" component in Execution view, will build a nodeExecutions tree for specific workflow*/
export const NodeExecutionDetailsContextProvider = (
    props: ExecutionDetailsProviderProps
) => {
    const queryClient = useQueryClient();
    // workflow Identifier - separated to parameters, to minimize re-render count
    // as useEffect doesn't know how to do deep comparison
    const { resourceType, project, domain, name, version } = props.workflowId;

    const [
        executionTree,
        setExecutionTree
    ] = useState<CurrentExecutionDetails | null>(null);
    const [parentMap, setParentMap] = useState<Map<string, Core.IIdentifier>>(
        new Map<string, Core.IIdentifier>()
    );

    const resetState = () => {
        setExecutionTree(null);
        setParentMap(new Map<string, Core.IIdentifier>());
    };

    useEffect(() => {
        let isCurrent = true;
        async function fetchData() {
            const workflowId: Identifier = {
                resourceType,
                project,
                domain,
                name,
                version
            };
            const workflow = await fetchWorkflow(queryClient, workflowId);
            if (!workflow) {
                resetState();
                return;
            }

            const { nodes: tree, map } = createExecutionDetails(workflow);
            if (isCurrent) {
                setExecutionTree(tree);
                setParentMap(map);
            }
        }

        fetchData();

        // This handles the unmount case
        return () => {
            isCurrent = false;
            resetState();
        };
    }, [queryClient, resourceType, project, domain, name, version]);

    const getDetails = (
        nodeExecution?: NodeExecution
    ): NodeExecutionDetails => {
        if (!executionTree || !nodeExecution) {
            return UNKNOWN_DETAILS;
        }

        const specId =
            nodeExecution.metadata?.specNodeId || nodeExecution.id.nodeId;
        const parentId = nodeExecution.parentId;

        let nodeDetail = executionTree.nodes.filter(
            n => n.displayId === specId
        );
        if (nodeDetail.length > 1) {
            // more than one result - we will try to filter by parent info
            // if there is no parent_id - we are dealing with the root.
            const parentTemplate = parentId
                ? parentMap.get(parentId) ?? executionTree.executionId
                : executionTree.executionId;
            nodeDetail = nodeDetail.filter(n =>
                isIdEqual(n.parentTemplate, parentTemplate)
            );
        }

        return nodeDetail?.[0] ?? UNKNOWN_DETAILS;
    };

    return (
        <NodeExecutionDetailsContext.Provider
            value={{ getNodeExecutionDetails: getDetails }}
        >
            {props.children}
        </NodeExecutionDetailsContext.Provider>
    );
};

/*
narusina - to check:

6. Check tests

Test view: 
https://localhost.demo.nuclyde.io:3000/projects/flytesnacks/domains/development/executions/rnktdb3skr?duration=all
https://demo.nuclyde.io/api/v1/workflows/flytesnacks/development/core.control_flow.subworkflows.other_root_wf/nested_example_1

https://localhost.demo.nuclyde.io:3000/projects/flytesnacks/domains/development/executions/ubcn6jgs59?duration=all
https://demo.nuclyde.io/api/v1/workflows/flytesnacks/development/core.control_flow.subworkflows.nested_parent_wf/demo-9-1-core-2

Branch 
https://localhost.demo.nuclyde.io:3000/projects/flytesnacks/domains/development/executions/ynbgv5b4ar?duration=all
https://demo.nuclyde.io/api/v1/workflows/flytesnacks/development/core.control_flow.run_conditions.so_nested/d8cb4e7c43adbeccc02a6ac322eff49f94d57fe3


Show info Branch Nodes:
https://github.com/flyteorg/flyte/issues/655

Ideally code should use WorkflowToDAG.tsx
src/components/WorkflowGraph/transformerWorkflowToDAG.tsx

*/
