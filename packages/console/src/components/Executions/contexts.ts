import { Execution, LogsByPhase, NodeExecution } from 'models/Execution/types';
import { createContext } from 'react';

export interface ExecutionContextData {
  execution: Execution;
}

export interface WorkflowNodeExecution extends NodeExecution {
  tasksFetched?: boolean;
  logsByPhase?: LogsByPhase;
}

export const ExecutionContext = createContext<ExecutionContextData>(
  {} as ExecutionContextData,
);

export interface INodeExecutionsByIdContext {
  nodeExecutionsById: Dictionary<WorkflowNodeExecution>;
  setCurrentNodeExecutionsById: (
    currentNodeExecutionsById: Dictionary<NodeExecution>,
  ) => void;
}

export const NodeExecutionsByIdContext =
  createContext<INodeExecutionsByIdContext>({
    nodeExecutionsById: {},
    setCurrentNodeExecutionsById: () => {},
  });
