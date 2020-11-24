import { QueryKey } from 'components/data/queries';
import { QueryInput } from 'components/data/types';
import { extractTaskTemplates } from 'components/hooks/utils';
import { getWorkflow, Workflow, WorkflowId } from 'models';
import { QueryClient } from 'react-query';

export function makeWorkflowQuery(id: WorkflowId): QueryInput<Workflow> {
    return {
        queryKey: [QueryKey.Workflow, id],
        queryFn: () => getWorkflow(id)
    };
}

export async function fetchWorkflow(queryClient: QueryClient, id: WorkflowId) {
    const options = makeWorkflowQuery(id);
    options.onSuccess = (workflow: Workflow) => {
        if (workflow.closure != null) {
            // TODO: not sure if this is needed anymore?
            // extractAndIdentifyNodes(workflow).forEach(node => queryClient.setQueryData([QueryKey.NodeSpec, node.id], node));
            extractTaskTemplates(workflow).forEach(task =>
                queryClient.setQueryData([QueryKey.TaskTemplate, task.id], task)
            );
        }
    };
    return queryClient.fetchQuery(options);
}
