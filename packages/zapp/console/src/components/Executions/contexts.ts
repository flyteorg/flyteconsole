import { Execution, NodeExecution } from 'models/Execution/types';
import { createContext } from 'react';

export interface ExecutionContextData {
  execution: Execution;
}

export const ExecutionContext = createContext<ExecutionContextData>({} as ExecutionContextData);

export interface INodeExecutionsByIdContext {
  nodeExecutionsById: Dictionary<NodeExecution>;
  setCurrentNodeExecutionsById: (currentNodeExecutionsById: Dictionary<NodeExecution>) => void;
}

export const NodeExecutionsByIdContext = createContext<INodeExecutionsByIdContext>({
  nodeExecutionsById: {},
  setCurrentNodeExecutionsById: () => {},
});
