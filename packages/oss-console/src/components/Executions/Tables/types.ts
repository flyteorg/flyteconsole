import React from 'react';
import { PaginatedFetchableData } from '../../hooks/types';
import { Execution } from '../../../models/Execution/types';
import { dNode } from '../../../models/Graph/types';
import { Workflow } from '../../../models/Workflow/types';

export interface WorkflowExecutionsTableState {
  selectedIOExecution: Execution | null;
  setSelectedIOExecution(execution: Execution | null): void;
}

export interface ColumnDefinition<CellRendererData> {
  cellRenderer(data: CellRendererData): React.ReactNode;
  className?: string;
  key: string;
  label: string | React.FC;
}

export interface NodeExecutionCellRendererData {
  node: dNode;
  className: string;
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
