import { FilterOperationName } from '@flyteconsole/flyteidl';
import { NamedEntityIdentifier, FetchableData } from '@flyteconsole/components';
import { LaunchPlan, LaunchPlanState } from 'models/Launch/types';
import { useLaunchPlans } from './useLaunchPlans';

function activeLaunchPlansForWorkflowIdFilter(workflowId: NamedEntityIdentifier) {
  const { project, domain, name } = workflowId;
  return [
    {
      key: 'workflow.project',
      operation: FilterOperationName.EQ,
      value: project,
    },
    {
      key: 'workflow.domain',
      operation: FilterOperationName.EQ,
      value: domain,
    },
    {
      key: 'workflow.name',
      operation: FilterOperationName.EQ,
      value: name,
    },
    {
      key: 'state',
      operation: FilterOperationName.EQ,
      value: LaunchPlanState.ACTIVE,
    },
  ];
}

export function useWorkflowSchedules(
  workflowId: NamedEntityIdentifier,
): FetchableData<LaunchPlan[]> {
  const { project, domain } = workflowId;
  return useLaunchPlans(
    { project, domain },
    {
      filter: activeLaunchPlansForWorkflowIdFilter(workflowId),
    },
  );
}
