import { QueryKey } from 'components/data/queries';
import { QueryInput } from 'components/data/types';
import { getTask, Identifier, TaskTemplate } from 'models';
import { QueryClient } from 'react-query';

export function makeTaskTemplateQuery(
    id: Identifier
): QueryInput<TaskTemplate> {
    return {
        queryKey: [QueryKey.TaskTemplate, id],
        queryFn: async () => (await getTask(id)).closure.compiledTask.template
    };
}

export function fetchTaskTemplate(queryClient: QueryClient, id: Identifier) {
    return queryClient.fetchQuery(makeTaskTemplateQuery(id));
}
