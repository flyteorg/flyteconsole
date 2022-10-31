import {
  PaginatedFetchableData,
  Workflow,
  Execution,
  NodeExecution,
  NodeExecutionIdentifier,
} from '@flyteconsole/components';

export interface WorkflowExecutionsTableState {
  selectedIOExecution: Execution | null;
  setSelectedIOExecution(execution: Execution | null): void;
}
export interface NodeExecutionsTableState {
  selectedExecution?: NodeExecutionIdentifier | null;
  setSelectedExecution: (selectedExecutionId: NodeExecutionIdentifier | null) => void;
}

export interface ColumnDefinition<CellRendererData> {
  cellRenderer(data: CellRendererData): React.ReactNode;
  className?: string;
  key: string;
  label: string | React.FC;
}

export interface NodeExecutionCellRendererData {
  execution: NodeExecution;
  state: NodeExecutionsTableState;
}
export type NodeExecutionColumnDefinition = ColumnDefinition<NodeExecutionCellRendererData>;

export interface WorkflowExecutionCellRendererData {
  execution: Execution;
  state: WorkflowExecutionsTableState;
}
export type WorkflowExecutionColumnDefinition = ColumnDefinition<WorkflowExecutionCellRendererData>;

export interface WorkflowVersionCellRendererData {
  workflow: Workflow;
  state: WorkflowExecutionsTableState;
  executions: PaginatedFetchableData<Execution>;
}

export type WorkflowVersionColumnDefinition = ColumnDefinition<WorkflowVersionCellRendererData>;
