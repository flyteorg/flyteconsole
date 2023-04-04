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
export type FilteredNodeExecutions = WorkflowNodeExecution[] | undefined;
export type SetCurrentNodeExecutionsById = (
  currentNodeExecutionsById: Dictionary<WorkflowNodeExecution>,
  checkForDynamicParents?: boolean,
) => void;

export interface INodeExecutionsByIdContext {
  nodeExecutionsById: NodeExecutionsById;
  filteredNodeExecutions?: FilteredNodeExecutions;
  setCurrentNodeExecutionsById: SetCurrentNodeExecutionsById;
  shouldUpdate: boolean;
  setShouldUpdate: (val: boolean) => void;
}

export const NodeExecutionsByIdContext =
  createContext<INodeExecutionsByIdContext>({
    nodeExecutionsById: {},
    setCurrentNodeExecutionsById: () => {
      throw new Error('Must use NodeExecutionsByIdContextProvider');
    },
    shouldUpdate: false,
    setShouldUpdate: _val => {
      throw new Error('Must use NodeExecutionsByIdContextProvider');
    },
  });
