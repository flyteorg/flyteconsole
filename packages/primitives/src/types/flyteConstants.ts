export enum WorkflowExecutionPhase {
  UNDEFINED = 'UNDEFINED', // 0
  QUEUED = 'QUEUED', // 1
  RUNNING = 'RUNNING', // 2
  SUCCEEDING = 'SUCCEEDING', // 3
  SUCCEEDED = 'SUCCEEDED', // 4
  FAILING = 'FAILING', // 5
  FAILED = 'FAILED', // 6
  ABORTED = 'ABORTED', // 7
  TIMED_OUT = 'TIMED_OUT', // 8
  ABORTING = 'ABORTING', // 9
}
