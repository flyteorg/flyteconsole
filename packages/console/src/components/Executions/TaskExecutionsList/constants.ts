import { TaskExecutionPhase } from 'models/Execution/enums';

export const RENDER_ORDER: TaskExecutionPhase[] = [
  TaskExecutionPhase.UNDEFINED, // 0
  TaskExecutionPhase.INITIALIZING, // 6
  TaskExecutionPhase.WAITING_FOR_RESOURCES, // 7
  TaskExecutionPhase.QUEUED, // 1
  TaskExecutionPhase.RUNNING, // 2
  TaskExecutionPhase.SUCCEEDED, // 3
  TaskExecutionPhase.ABORTED, // 4
  TaskExecutionPhase.FAILED, // 5
];
