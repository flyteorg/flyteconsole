import { GloballyUniqueNode, TaskTemplate, Workflow } from 'models';

export function extractTaskTemplates(workflow: Workflow): TaskTemplate[] {
    if (!workflow.closure || !workflow.closure.compiledWorkflow) {
        return [];
    }
    return workflow.closure.compiledWorkflow.tasks.map(t => t.template);
}

export function extractAndIdentifyNodes(
    workflow: Workflow
): GloballyUniqueNode[] {
    if (!workflow.closure || !workflow.closure.compiledWorkflow) {
        return [];
    }
    return workflow.closure.compiledWorkflow.primary.template.nodes.map(
        node => ({
            node,
            id: {
                nodeId: node.id,
                workflowId: workflow.id
            }
        })
    );
}
