import { TaskExecutionPhase } from '@flyteconsole/components';

export const RENDER_ORDER: TaskExecutionPhase[] = [
  TaskExecutionPhase.UNDEFINED,
  TaskExecutionPhase.INITIALIZING,
  TaskExecutionPhase.WAITING_FOR_RESOURCES,
  TaskExecutionPhase.QUEUED,
  TaskExecutionPhase.RUNNING,
  TaskExecutionPhase.SUCCEEDED,
  TaskExecutionPhase.ABORTED,
  TaskExecutionPhase.FAILED,
];
