import { useContext, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useAPIContext } from '../../data/apiContext';
import { waitForQueryState } from '../../data/queryUtils';
import { QueryType } from '../../data/types';
import { Execution } from '../../../models/Execution/types';
import { ExecutionContext } from '../contexts';
import { executionIsTerminal } from '../utils';

interface TerminateExecutionVariables {
  cause: string;
}

/** Holds state for `TerminateExecutionForm` */
export function useTerminateExecutionState(onClose: () => void) {
  const { getExecution, terminateWorkflowExecution } = useAPIContext();
  const [cause, setCause] = useState('');
  const {
    execution: { id },
  } = useContext(ExecutionContext);
  const queryClient = useQueryClient();

  const { mutate, ...terminationState } = useMutation<
    Execution,
    Error,
    TerminateExecutionVariables
  >(
    async ({ cause }: TerminateExecutionVariables) => {
      await terminateWorkflowExecution(id, cause);
      return waitForQueryState<Execution>({
        queryClient,
        queryKey: [QueryType.WorkflowExecution, id],
        queryFn: () => getExecution(id),
        valueCheckFn: executionIsTerminal,
      });
    },
    {
      onSuccess: (updatedExecution) => {
        queryClient.setQueryData([QueryType.WorkflowExecution, id], updatedExecution);
        onClose();
      },
    },
  );

  const terminateExecution = async (cause: string) => mutate({ cause });

  return {
    cause,
    setCause,
    terminationState,
    terminateExecution,
  };
}
