import { createContext } from 'react';
import { Execution, MapTaskExecution, NodeExecution } from '../../models/Execution/types';
import { dNode } from '../../models/Graph/types';

export interface ExecutionContextData {
  execution: Execution;
}

export type WorkflowTaskExecution = MapTaskExecution;
export interface WorkflowNodeExecution extends NodeExecution {}

export const ExecutionContext = createContext<ExecutionContextData>({} as ExecutionContextData);

export type NodeExecutionsById = Dictionary<WorkflowNodeExecution>;
export type FilteredNodeExecutions = WorkflowNodeExecution[] | undefined;
export type SetCurrentNodeExecutionsById = (
  currentNodeExecutionsById: Dictionary<WorkflowNodeExecution>,
) => void;

export interface IWorkflowNodeExecutionsContext {
  nodeExecutionsById: NodeExecutionsById;
  setCurrentNodeExecutionsById: SetCurrentNodeExecutionsById;
  // Tabs
  visibleNodes: dNode[];
  dagData: {
    mergedDag: dNode;
    dagError: any;
  };

  // actions
  toggleNode: (node: dNode) => void;
}

export const WorkflowNodeExecutionsContext = createContext<IWorkflowNodeExecutionsContext>({
  nodeExecutionsById: {},
  setCurrentNodeExecutionsById: () => {
    throw new Error('Must use NodeExecutionsByIdContextProvider');
  },
  visibleNodes: [],
  dagData: {
    mergedDag: {} as dNode,
    dagError: null,
  },
  toggleNode: () => {
    throw new Error('Must use NodeExecutionsByIdContextProvider');
  },
});
