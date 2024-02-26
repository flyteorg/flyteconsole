import { QueryClient } from 'react-query';
import { PaginatedEntityResponse, RequestConfig } from '@clients/common/types/adminEntityTypes';
import { QueryInput, QueryType } from '../components/data/types';
import { extractTaskTemplates } from '../components/hooks/utils';

import { ListNamedEntitiesInput, listNamedEntities } from '../models/Common/api';
import { listExecutions } from '../models/Execution/api';
import { getWorkflow, listWorkflows } from '../models/Workflow/api';
import { Workflow, WorkflowId } from '../models/Workflow/types';
import {
  IdentifierScope,
  NamedEntityIdentifier,
  NamedEntity,
  ResourceType,
} from '../models/Common/types';
import { Execution } from '../models/Execution/types';

export function makeListWorkflowsQuery(
  queryClient: QueryClient,
  id: IdentifierScope,
  config?: RequestConfig,
): QueryInput<PaginatedEntityResponse<Workflow>> {
  return {
    queryKey: [QueryType.ListWorkflows, id, config],
    queryFn: async () => {
      const workflows = await listWorkflows(id, config);
      queryClient.setQueryData([QueryType.ListWorkflows, id, config], workflows);

      return workflows;
    },
    // `Workflow` objects (individual versions) are immutable and safe to
    // cache indefinitely once retrieved in full
    staleTime: Infinity,
  };
}

export function makeWorkflowQuery(
  queryClient: QueryClient,
  id: WorkflowId,
  config?: RequestConfig,
): QueryInput<Workflow> {
  return {
    queryKey: [QueryType.Workflow, id, config],
    queryFn: async () => {
      const workflow = await getWorkflow(id, config);

      // On successful workflow fetch, extract and cache all task templates
      // stored on the workflow so that we don't need to fetch them separately
      // if future queries reference them.
      extractTaskTemplates(workflow).forEach((task) =>
        queryClient.setQueryData([QueryType.TaskTemplate, task.id], task),
      );

      return workflow;
    },
    // `Workflow` objects (individual versions) are immutable and safe to
    // cache indefinitely once retrieved in full
    staleTime: Infinity,
  };
}

export async function fetchWorkflow(queryClient: QueryClient, id: WorkflowId): Promise<Workflow> {
  return queryClient.fetchQuery<Workflow>(makeWorkflowQuery(queryClient, id) as any);
}

export function makeFilterableWorkflowExecutionsQuery(
  queryClient: QueryClient,
  scope: NamedEntityIdentifier,
  config?: RequestConfig,
): QueryInput<PaginatedEntityResponse<Execution>> {
  return {
    queryKey: [QueryType.WorkflowExecutionList, scope, config],
    queryFn: async () => {
      const executions = await listExecutions(
        {
          domain: scope.domain,
          project: scope.project,
        },
        config,
      );

      queryClient.setQueryData([QueryType.WorkflowExecutionList, scope, config], executions);
      return executions;
    },
  };
}

export function fetchWorkflowExecutions(
  queryClient: QueryClient,
  scope: NamedEntityIdentifier,
  config?: RequestConfig,
) {
  return queryClient.fetchQuery(makeFilterableWorkflowExecutionsQuery(queryClient, scope, config));
}

export function makeListWorkflowEntitiesQuery(
  scope: ListNamedEntitiesInput,
  config?: RequestConfig,
): QueryInput<PaginatedEntityResponse<NamedEntity>> {
  return {
    queryKey: [QueryType.WorkflowEntitiesList, scope, config],
    queryFn: async () => {
      const workflows = await listNamedEntities(
        {
          domain: scope.domain,
          project: scope.project,
          resourceType: ResourceType.WORKFLOW,
        },
        config,
      );
      return workflows;
    },
  };
}
