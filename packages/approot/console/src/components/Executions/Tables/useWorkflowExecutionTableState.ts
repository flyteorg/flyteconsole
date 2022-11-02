import { Execution } from '@flyteconsole/components';
import { useState } from 'react';
import { WorkflowExecutionsTableState } from './types';

export function useWorkflowExecutionsTableState(): WorkflowExecutionsTableState {
  const [selectedIOExecution, setSelectedIOExecution] = useState<Execution | null>(null);
  return {
    selectedIOExecution,
    setSelectedIOExecution,
  };
}
