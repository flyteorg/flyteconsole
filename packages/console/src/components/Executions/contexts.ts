import { Execution, LogsByPhase, NodeExecution } from 'models/Execution/types';
import { dNode } from 'models/Graph/types';
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

export interface IWorkflowNodeExecutionsContext {
  nodeExecutionsById: NodeExecutionsById;
  setCurrentNodeExecutionsById: SetCurrentNodeExecutionsById;
  shouldUpdate: boolean;
  setShouldUpdate: (val: boolean) => void;
  // Tabs
  initialDNodes: dNode[];
  dagData: {
    mergedDag: any;
    dagError: any;
  };
}

export const WorkflowNodeExecutionsContext =
  createContext<IWorkflowNodeExecutionsContext>({
    nodeExecutionsById: {},
    setCurrentNodeExecutionsById: () => {
      throw new Error('Must use NodeExecutionsByIdContextProvider');
    },
    shouldUpdate: false,
    setShouldUpdate: _val => {
      throw new Error('Must use NodeExecutionsByIdContextProvider');
    },
    initialDNodes: [],
    dagData: {
      mergedDag: {},
      dagError: null,
    },
  });
