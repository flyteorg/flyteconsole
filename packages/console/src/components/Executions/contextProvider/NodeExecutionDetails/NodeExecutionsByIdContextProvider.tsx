import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { NodeExecutionsById } from 'models/Execution/types';
import { useExecutionNodeViewsState } from 'components/Executions/ExecutionDetails/useExecutionNodeViewsState';
import { ExecutionFiltersState } from 'components/Executions/filters/useExecutionFiltersState';
import {
  ExecutionContext,
  FilteredNodeExecutions,
  INodeExecutionsByIdContext,
  NodeExecutionsByIdContext,
} from 'components/Executions/contexts';
import { clone, isEqual, keyBy, merge } from 'lodash';
import { FilterOperation } from 'models';
import { WaitForQuery } from 'components/common';
import { LargeLoadingSpinner } from 'components/common/LoadingSpinner';
import { DataError } from 'components/Errors/DataError';

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
  setShouldUpdate: (boolean) => void;
}>;

/** Should wrap "top level" component in Execution view, will build a nodeExecutions tree for specific workflow */
export const NodeExecutionsByIdContextProvider = ({
  filterState,
  initialNodeExecutionsById,
  setShouldUpdate,
  children,
}: NodeExecutionsByIdContextProviderProps) => {
  const { execution } = useContext(ExecutionContext);

  const [nodeExecutionsById, setNodeExecutionsById] =
    useState<NodeExecutionsById>(initialNodeExecutionsById ?? DEFAULT_FALUE);

  const [filteredNodeExecutions, setFilteredNodeExecutions] =
    useState<FilteredNodeExecutions>();

  // query to get all data to build Graph and Timeline
  const { nodeExecutionsQuery } = useExecutionNodeViewsState(execution);
  // query to get filtered data to narrow down Table outputs
  const { nodeExecutionsQuery: filteredNodeExecutionsQuery } =
    useExecutionNodeViewsState(execution, filterState.appliedFilters);

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
    setShouldUpdate(true);
    setCurrentNodeExecutionsById(newNodeExecutionsById);
  }, [nodeExecutionsQuery]);

  useEffect(() => {
    if (
      filteredNodeExecutionsQuery.isFetching ||
      !filteredNodeExecutionsQuery.data
    ) {
      return;
    }
    const newFilteredNodeExecutions = isPhaseFilter(filterState.appliedFilters)
      ? undefined
      : filteredNodeExecutions;

    setFilteredNodeExecutions(newFilteredNodeExecutions);
  }, [filteredNodeExecutionsQuery]);

  const setCurrentNodeExecutionsById = useCallback(
    (currentNodeExecutionsById: NodeExecutionsById): void => {
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
      }}
    >
      <WaitForQuery
        errorComponent={DataError}
        query={nodeExecutionsQuery}
        loadingComponent={LoadingComponent}
      >
        {() => (
          <WaitForQuery
            errorComponent={DataError}
            query={filteredNodeExecutionsQuery}
            loadingComponent={LoadingComponent}
          >
            {() => children}
          </WaitForQuery>
        )}
      </WaitForQuery>
    </NodeExecutionsByIdContext.Provider>
  );
};

export const useNodeExecutionsById = (): INodeExecutionsByIdContext => {
  return useContext(NodeExecutionsByIdContext);
};

const LoadingComponent = () => {
  return (
    <div style={{ margin: 'auto' }}>
      <LargeLoadingSpinner />
    </div>
  );
};
