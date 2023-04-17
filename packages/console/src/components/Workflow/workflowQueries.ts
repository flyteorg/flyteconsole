import { log } from 'common/log';
import { QueryInput, QueryType } from 'components/data/types';
import { extractTaskTemplates } from 'components/hooks/utils';
import { ExecutionData } from 'models';
import { getNodeExecutionData } from 'models/Execution/api';
import { getWorkflow } from 'models/Workflow/api';
import { Workflow, WorkflowId } from 'models/Workflow/types';
import { QueryClient } from 'react-query';

export function makeWorkflowQuery(
  queryClient: QueryClient,
  id: WorkflowId,
): QueryInput<Workflow> {
  return {
    queryKey: [QueryType.Workflow, id],
    queryFn: async () => {
      const workflow = await getWorkflow(id);
      // On successful workflow fetch, extract and cache all task templates
      // stored on the workflow so that we don't need to fetch them separately
      // if future queries reference them.
      extractTaskTemplates(workflow).forEach(task =>
        queryClient.setQueryData([QueryType.TaskTemplate, task.id], task),
      );

      return workflow;
    },
    // `Workflow` objects (individual versions) are immutable and safe to
    // cache indefinitely once retrieved in full
    staleTime: Infinity,
  };
}

export interface NodeExecutionDynamicWorkflowQueryResult {
  [key: string]: ExecutionData;
}
export function makeNodeExecutionDynamicWorkflowQuery(
  parentsToFetch,
): QueryInput<NodeExecutionDynamicWorkflowQueryResult> {
  const parentsIds = Object.keys(parentsToFetch);
  return {
    queryKey: [QueryType.DynamicWorkflowFromNodeExecution, parentsToFetch],
    // don't make any requests as long as there are no dynamic node executions to fetch
    enabled: !!parentsIds?.length,
    queryFn: async () => {
      return await Promise.all(
        parentsIds
          .filter(id => parentsToFetch[id])
          .map(id => {
            const executionId = parentsToFetch[id];
            if (!executionId) {
              // TODO FC#377: This check and filter few lines abode need to be deleted
              // when Branch node support would be added
              log.error(`Graph missing info for ${id}`);
            }
            return getNodeExecutionData(executionId.id).then(value => {
              return { key: id, value: value };
            });
          }),
      ).then(values => {
        const output: { [key: string]: any } = {};
        for (let i = 0; i < values.length; i++) {
          /* Filter to only include dynamicWorkflow */
          if (values[i].value.dynamicWorkflow) {
            output[values[i].key] = values[i].value;
          }
        }
        return output;
      });
    },
  };
}

export async function fetchWorkflow(queryClient: QueryClient, id: WorkflowId) {
  return queryClient.fetchQuery(makeWorkflowQuery(queryClient, id));
}
