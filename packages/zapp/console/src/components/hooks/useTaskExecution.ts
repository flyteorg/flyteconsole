import { getTaskExecution } from 'models/Execution/api';
import {
  TaskExecution,
  TaskExecutionIdentifier,
  useFetchableData,
  FetchableData,
} from '@flyteconsole/components';

/** A hook for fetching a TaskExecution */
export function useTaskExecution(id: TaskExecutionIdentifier): FetchableData<TaskExecution> {
  return useFetchableData<TaskExecution, TaskExecutionIdentifier>(
    {
      debugName: 'TaskExecution',
      defaultValue: {} as TaskExecution,
      doFetch: (id) => getTaskExecution(id),
    },
    id,
  );
}
