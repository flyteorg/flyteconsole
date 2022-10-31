import { createPaginationQuery } from 'components/data/queryUtils';
import { InfiniteQueryInput, QueryType } from 'components/data/types';
import { RequestConfig } from '@flyteconsole/flyteidl';
import { DomainIdentifierScope, Execution } from '@flyteconsole/components';
import { listExecutions } from 'models/Execution/api';

/** A query for fetching a list of workflow executions belonging to a project/domain */
export function makeWorkflowExecutionListQuery(
  { domain, project }: DomainIdentifierScope,
  config?: RequestConfig,
): InfiniteQueryInput<Execution> {
  return createPaginationQuery({
    queryKey: [QueryType.WorkflowExecutionList, { domain, project }, config],
    queryFn: async ({ pageParam }) => {
      const finalConfig = pageParam ? { ...config, token: pageParam } : config;
      const { entities: data, token } = await listExecutions({ domain, project }, finalConfig);
      return { data, token };
    },
  });
}
