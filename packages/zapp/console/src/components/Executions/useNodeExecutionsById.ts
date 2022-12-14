import { NodeExecution } from 'models/Execution/types';
import { useCallback, useState } from 'react';
import { INodeExecutionsByIdContext } from './contexts';

export const useNodeExecutionsById = (
  initialNodeExecutionsById?: Dictionary<NodeExecution>,
): INodeExecutionsByIdContext => {
  const [nodeExecutionsById, setNodeExecutionsById] = useState(initialNodeExecutionsById ?? {});

  const setCurrentNodeExecutionsById = useCallback(
    (currentNodeExecutionsById: Dictionary<NodeExecution>): void => {
      setNodeExecutionsById(currentNodeExecutionsById);
    },
    [],
  );

  return {
    nodeExecutionsById,
    setCurrentNodeExecutionsById,
  };
};
