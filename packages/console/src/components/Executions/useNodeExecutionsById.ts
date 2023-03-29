import { isEqual, merge } from 'lodash';
import { NodeExecution } from 'models/Execution/types';
import { useCallback, useState } from 'react';
import { INodeExecutionsByIdContext } from './contexts';

export const useNodeExecutionsById = (
  initialNodeExecutionsById?: Dictionary<NodeExecution>,
): INodeExecutionsByIdContext => {
  const [nodeExecutionsById, setNodeExecutionsById] = useState(
    initialNodeExecutionsById ?? {},
  );

  const setCurrentNodeExecutionsById = useCallback(
    (currentNodeExecutionsById: Dictionary<NodeExecution>): void => {
      setNodeExecutionsById(prev => {
        const newNodes = merge({ ...prev }, currentNodeExecutionsById);
        if (isEqual(prev, newNodes)) {
          return prev;
        }
        return newNodes;
      });
    },
    [],
  );

  return {
    nodeExecutionsById,
    setCurrentNodeExecutionsById,
  };
};
