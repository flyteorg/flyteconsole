import { useState } from 'react';
import { Execution } from '../../../models/Execution/types';
import { WorkflowExecutionsTableState } from './types';

export function useWorkflowExecutionsTableState(): WorkflowExecutionsTableState {
  const [selectedIOExecution, setSelectedIOExecution] = useState<Execution | null>(null);
  return {
    selectedIOExecution,
    setSelectedIOExecution,
  };
}
