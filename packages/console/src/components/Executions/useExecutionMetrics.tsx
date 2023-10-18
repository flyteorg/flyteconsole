import { Admin } from '@flyteorg/flyteidl-types';
import { APIContextValue, useAPIContext } from 'components/data/apiContext';
import { useFetchableData } from 'components/hooks/useFetchableData';
import { WorkflowExecutionIdentifier } from 'models';

export const fetchExecutionMetrics = async (
  id: WorkflowExecutionIdentifier,
  depth: number,
  apiContext: APIContextValue,
) => {
  const { getExecutionMetrics } = apiContext;
  const metrics = await getExecutionMetrics(id, {
    params: {
      depth,
    },
  });
  return metrics;
};

export function useExecutionMetrics(
  id: WorkflowExecutionIdentifier,
  depth = 0,
) {
  const apiContext = useAPIContext();

  return useFetchableData<
    Admin.WorkflowExecutionGetMetricsResponse,
    WorkflowExecutionIdentifier
  >(
    {
      debugName: 'ExecutionMetrics',
      defaultValue: [] as Admin.WorkflowExecutionGetMetricsResponse,
      doFetch: id => fetchExecutionMetrics(id, depth, apiContext),
    },
    id,
  );
}
