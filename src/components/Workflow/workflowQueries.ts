import { QueryKey } from 'components/data/queries';
import { QueryInput } from 'components/data/types';
import { getWorkflow, Workflow, WorkflowId } from 'models';
import { QueryClient } from 'react-query';

export function makeWorkflowQuery(id: WorkflowId): QueryInput<Workflow> {
    return {
        queryKey: [QueryKey.Workflow, id],
        queryFn: () => getWorkflow(id),
        // `Workflow` objects (individual versions) are immutable and safe to
        // cache indefinitely once retrieved in full
        staleTime: Infinity
    };
}

export async function fetchWorkflow(queryClient: QueryClient, id: WorkflowId) {
    return queryClient.fetchQuery(makeWorkflowQuery(id));
}
