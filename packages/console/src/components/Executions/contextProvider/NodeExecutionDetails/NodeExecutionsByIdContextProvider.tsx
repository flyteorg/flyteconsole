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
import { isEqual, keyBy, mergeWith } from 'lodash';
import { FilterOperation } from 'models';
import { UseQueryResult } from 'react-query';
import { mapStringifyReplacer, mergeNodeExecutions } from './utils';

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
  filterState,
  nodeExecutionsQuery,
  filteredNodeExecutionsQuery,
  children,
}: NodeExecutionsByIdContextProviderProps) => {
  const [shouldUpdate, setShouldUpdate] = useState<boolean>(false);

  const [nodeExecutionsById, setNodeExecutionsById] =
    useState<NodeExecutionsById>();

  const [filteredNodeExecutions, setFilteredNodeExecutions] =
    useState<FilteredNodeExecutions>();

  useEffect(() => {
    if (nodeExecutionsQuery.isFetching || !nodeExecutionsQuery.data) {
      return;
    }
    const fetchedNodeExecutionsById = keyBy(
      nodeExecutionsQuery.data,
      'scopedId',
    );

    setCurrentNodeExecutionsById(fetchedNodeExecutionsById);
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
      newNodeExecutionsById: NodeExecutionsById,
      checkForDynamicParents?: boolean,
    ): void => {
      setNodeExecutionsById(prev => {
        const newNodes = mergeWith(
          { ...prev },
          newNodeExecutionsById,
          mergeNodeExecutions,
        );
        if (
          JSON.stringify(prev, mapStringifyReplacer) ===
          JSON.stringify(newNodes, mapStringifyReplacer)
        ) {
          return prev;
        }

        if (checkForDynamicParents) {
          setShouldUpdate(true);
        }

        console.log({
          oldCount: Object.keys(prev || {}).length,
          newCount: Object.keys(newNodes).length,
          old: prev,
          new: newNodes,
        });

        return newNodes;
      });
    },
    [],
  );

  return (
    <NodeExecutionsByIdContext.Provider
      value={{
        nodeExecutionsById: nodeExecutionsById!,
        filteredNodeExecutions,
        setCurrentNodeExecutionsById,
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
