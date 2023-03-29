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

export type NodeExecutionsById = Dictionary<WorkflowNodeExecution>;
export type SetCurrentNodeExecutionsById = (
  currentNodeExecutionsById: Dictionary<NodeExecution>,
) => void;
export interface INodeExecutionsByIdContext {
  nodeExecutionsById: NodeExecutionsById;
  setCurrentNodeExecutionsById: SetCurrentNodeExecutionsById;
}

export const NodeExecutionsByIdContext =
  createContext<INodeExecutionsByIdContext>({
    nodeExecutionsById: {},
    setCurrentNodeExecutionsById: () => {},
  });
