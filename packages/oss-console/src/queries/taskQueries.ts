import { QueryClient } from 'react-query';
import { RequestConfig, PaginatedEntityResponse } from '@clients/common/types/adminEntityTypes';
import { QueryInput, QueryType } from '../components/data/types';
import { ListNamedEntitiesInput, listNamedEntities } from '../models/Common/api';
import { Identifier, NamedEntity, ResourceType } from '../models/Common/types';
import { getTask } from '../models/Task/api';
import { Task, TaskTemplate } from '../models/Task/types';

export function makeTaskQuery(
  queryClient: QueryClient,
  id: Identifier,
  config?: RequestConfig,
): QueryInput<Task> {
  return {
    queryKey: [QueryType.Task, id, config],
    queryFn: async () => {
      const task = await getTask(id);
      queryClient.setQueryData([QueryType.Task, id, config], task);
      return task;
    },
    // Task templates are immutable and safe to cache indefinitely
    staleTime: Infinity,
  };
}

export function fetchTask(queryClient: QueryClient, id: Identifier, config?: RequestConfig) {
  return queryClient.fetchQuery(makeTaskQuery(queryClient, id, config));
}

export function makeTaskTemplateQuery(
  queryClient: QueryClient,
  id: Identifier,
  config?: RequestConfig,
): QueryInput<TaskTemplate> {
  return {
    queryKey: [QueryType.TaskTemplate, id, config],
    queryFn: async () => {
      const task = await fetchTask(queryClient, id, config);
      const taskTemplate = task.closure.compiledTask.template;
      queryClient.setQueryData([QueryType.TaskTemplate, id, config], taskTemplate);

      return taskTemplate;
    },
    // Task templates are immutable and safe to cache indefinitely
    staleTime: Infinity,
  };
}

export function fetchTaskTemplate(
  queryClient: QueryClient,
  id: Identifier,
  config?: RequestConfig,
) {
  return queryClient.fetchQuery(makeTaskTemplateQuery(queryClient, id, config));
}

export function makeListTaskEntitiesQuery(
  scope: ListNamedEntitiesInput,
  config?: RequestConfig,
): QueryInput<PaginatedEntityResponse<NamedEntity>> {
  return {
    queryKey: [QueryType.TaskEntitiesList, scope, config],
    queryFn: async () => {
      const tasks = await listNamedEntities(
        {
          domain: scope.domain,
          project: scope.project,
          resourceType: ResourceType.TASK,
        },
        config,
      );
      return tasks;
    },
  };
}
