import { QueryInput, QueryType } from 'components/data/types';
import { Identifier, TaskTemplate } from '@flyteconsole/components';
import { getTask } from 'models/Task/api';
import { QueryClient } from 'react-query';

export function makeTaskTemplateQuery(id: Identifier): QueryInput<TaskTemplate> {
  return {
    queryKey: [QueryType.TaskTemplate, id],
    queryFn: async () => (await getTask(id)).closure.compiledTask.template,
    // Task templates are immutable and safe to cache indefinitely
    staleTime: Infinity,
  };
}

export function fetchTaskTemplate(queryClient: QueryClient, id: Identifier) {
  return queryClient.fetchQuery(makeTaskTemplateQuery(id));
}
