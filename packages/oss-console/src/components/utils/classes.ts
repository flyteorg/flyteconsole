import {
  NodeExecutionPhase,
  TaskExecutionPhase,
  WorkflowExecutionPhase,
} from '../../models/Execution/enums';
import { TargetProperty } from './GlobalStyles';

export const getNodeExecutionStatusClassName = (
  targetProperty: TargetProperty,
  phase?: NodeExecutionPhase,
) => {
  switch (phase) {
    case NodeExecutionPhase.ABORTED:
      return `${targetProperty}-status-aborted`;
    case NodeExecutionPhase.FAILING:
      return `${targetProperty}-status-failing`;
    case NodeExecutionPhase.FAILED:
      return `${targetProperty}-status-failed`;
    case NodeExecutionPhase.QUEUED:
      return `${targetProperty}-status-queued`;
    case NodeExecutionPhase.RUNNING:
      return `${targetProperty}-status-running`;
    case NodeExecutionPhase.DYNAMIC_RUNNING:
      return `${targetProperty}-status-dynamicrunning`;
    case NodeExecutionPhase.SUCCEEDED:
      return `${targetProperty}-status-succeeded`;
    case NodeExecutionPhase.TIMED_OUT:
      return `${targetProperty}-status-timedout`;
    case NodeExecutionPhase.SKIPPED:
      return `${targetProperty}-status-skipped`;
    case NodeExecutionPhase.RECOVERED:
      return `${targetProperty}-status-recovered`;
    case NodeExecutionPhase.PAUSED:
      return `${targetProperty}-status-paused`;
    case NodeExecutionPhase.UNDEFINED:
      return `${targetProperty}-status-undefined`;
    default:
      return `${targetProperty}-status-notrun`;
  }
};

export const getTaskExecutionStatusClassName = (
  targetProperty: TargetProperty,
  phase?: TaskExecutionPhase,
) => {
  switch (phase) {
    case TaskExecutionPhase.UNDEFINED:
      return `${targetProperty}-status-undefined`;
    case TaskExecutionPhase.QUEUED:
      return `${targetProperty}-status-queued`;
    case TaskExecutionPhase.INITIALIZING:
      return `${targetProperty}-status-initializing`;
    case TaskExecutionPhase.RUNNING:
      return `${targetProperty}-status-running`;
    case TaskExecutionPhase.SUCCEEDED:
      return `${targetProperty}-status-succeeded`;
    case TaskExecutionPhase.ABORTED:
      return `${targetProperty}-status-aborted`;
    case TaskExecutionPhase.FAILED:
      return `${targetProperty}-status-failed`;

    default:
      return `${targetProperty}-status-notrun`;
  }
};

export const getExecutionStatusClassName = (
  targetProperty: TargetProperty,
  phase?: WorkflowExecutionPhase,
) => {
  switch (phase) {
    case WorkflowExecutionPhase.UNDEFINED:
      return `${targetProperty}-status-undefined`;
    case WorkflowExecutionPhase.QUEUED:
      return `${targetProperty}-status-queued`;
    case WorkflowExecutionPhase.RUNNING:
      return `${targetProperty}-status-running`;
    case WorkflowExecutionPhase.SUCCEEDING:
      return `${targetProperty}-status-succeeding`;
    case WorkflowExecutionPhase.SUCCEEDED:
      return `${targetProperty}-status-succeeded`;
    case WorkflowExecutionPhase.FAILING:
      return `${targetProperty}-status-failing`;
    case WorkflowExecutionPhase.FAILED:
      return `${targetProperty}-status-failed`;
    case WorkflowExecutionPhase.ABORTED:
      return `${targetProperty}-status-aborted`;
    case WorkflowExecutionPhase.ABORTING:
      return `${targetProperty}-status-aborting`;
    case WorkflowExecutionPhase.TIMED_OUT:
      return `${targetProperty}-status-timedout`;
    default:
      return `${targetProperty}-status-notrun`;
  }
};
