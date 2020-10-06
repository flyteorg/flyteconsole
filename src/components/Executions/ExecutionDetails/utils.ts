import { Execution, ResourceType } from 'models';

export function isSingleTaskExecution(execution: Execution) {
    return execution.spec.launchPlan.resourceType === ResourceType.TASK;
}
