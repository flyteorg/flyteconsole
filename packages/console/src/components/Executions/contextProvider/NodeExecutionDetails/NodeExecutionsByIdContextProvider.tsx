import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { NodeExecution, NodeExecutionsById } from 'models/Execution/types';
import { ExecutionFiltersState } from 'components/Executions/filters/useExecutionFiltersState';
import {
  FilteredNodeExecutions,
  INodeExecutionsByIdContext,
  NodeExecutionsByIdContext,
} from 'components/Executions/contexts';
import { clone, isEqual, keyBy, merge } from 'lodash';
import { FilterOperation } from 'models';
import { UseQueryResult } from 'react-query';

const DEFAULT_FALUE = {};

const isPhaseFilter = (appliedFilters: FilterOperation[]) => {
  if (appliedFilters.length === 1 && appliedFilters[0].key === 'phase') {
    return true;
  }
  return false;
};

export type NodeExecutionsByIdContextProviderProps = PropsWithChildren<{
  initialNodeExecutionsById?: NodeExecutionsById;
  filterState: ExecutionFiltersState;
  nodeExecutionsQuery: UseQueryResult<NodeExecution[], Error>;
  filteredNodeExecutionsQuery: UseQueryResult<NodeExecution[], Error>;
}>;

/** Should wrap "top level" component in Execution view, will build a nodeExecutions tree for specific workflow */
export const NodeExecutionsByIdContextProvider = ({
  initialNodeExecutionsById,
  filterState,
  nodeExecutionsQuery,
  filteredNodeExecutionsQuery,
  children,
}: NodeExecutionsByIdContextProviderProps) => {
  const [shouldUpdate, setShouldUpdate] = useState<boolean>(false);

  const [nodeExecutionsById, setNodeExecutionsById] =
    useState<NodeExecutionsById>(initialNodeExecutionsById ?? DEFAULT_FALUE);

  const [filteredNodeExecutions, setFilteredNodeExecutions] =
    useState<FilteredNodeExecutions>();

  useEffect(() => {
    if (nodeExecutionsQuery.isFetching || !nodeExecutionsQuery.data) {
      return;
    }
    const currentNodeExecutionsById = keyBy(
      nodeExecutionsQuery.data,
      'scopedId',
    );
    const prevNodeExecutionsById = clone(nodeExecutionsById);
    const newNodeExecutionsById = merge(
      prevNodeExecutionsById,
      currentNodeExecutionsById,
    );

    setCurrentNodeExecutionsById(newNodeExecutionsById);
  }, [nodeExecutionsQuery]);

  useEffect(() => {
    if (filteredNodeExecutionsQuery.isFetching) {
      return;
    }

    const newFilteredNodeExecutions = isPhaseFilter(filterState.appliedFilters)
      ? undefined
      : filteredNodeExecutionsQuery.data;

    setFilteredNodeExecutions(prev => {
      if (isEqual(prev, newFilteredNodeExecutions)) {
        return prev;
      }

      setShouldUpdate(true);
      return newFilteredNodeExecutions;
    });
  }, [filteredNodeExecutionsQuery]);

  const setCurrentNodeExecutionsById = useCallback(
    (
      currentNodeExecutionsById: NodeExecutionsById,
      checkForDynamicParents?: boolean,
    ): void => {
      setNodeExecutionsById(prev => {
        const newNodes = merge({ ...prev }, currentNodeExecutionsById);
        if (isEqual(prev, newNodes)) {
          return prev;
        }

        if (checkForDynamicParents) {
          setShouldUpdate(true);
        }
        return newNodes;
      });
    },
    [],
  );

  const resetCurrentNodeExecutionsById = useCallback(
    (currentNodeExecutionsById?: NodeExecutionsById): void => {
      setNodeExecutionsById(currentNodeExecutionsById || DEFAULT_FALUE);
    },
    [],
  );

  return (
    <NodeExecutionsByIdContext.Provider
      value={{
        nodeExecutionsById,
        filteredNodeExecutions,
        setCurrentNodeExecutionsById,
        resetCurrentNodeExecutionsById,
        shouldUpdate,
        setShouldUpdate,
      }}
    >
      {children}
    </NodeExecutionsByIdContext.Provider>
  );
};

export const useNodeExecutionsById = (): INodeExecutionsByIdContext => {
  return useContext(NodeExecutionsByIdContext);
};
