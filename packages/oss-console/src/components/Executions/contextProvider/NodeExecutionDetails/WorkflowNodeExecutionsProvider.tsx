import React, { PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
import keyBy from 'lodash/keyBy';
import mergeWith from 'lodash/mergeWith';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import values from 'lodash/values';
import { NodeExecution } from '../../../../models/Execution/types';
import {
  IWorkflowNodeExecutionsContext,
  NodeExecutionsById,
  WorkflowNodeExecutionsContext,
} from '../../contexts';
import { dNode } from '../../../../models/Graph/types';
import {
  ScopedIdExpandedMap,
  transformerWorkflowToDag,
} from '../../../WorkflowGraph/transformerWorkflowToDag';
import { isStartOrEndNodeId } from '../../../../models/Node/utils';
import { isParentNode } from '../../utils';
import { stringifyIsEqual } from '../../../../common/stringifyIsEqual';
import { useNodeExecutionContext } from './NodeExecutionDetailsContextProvider';
import { mergeNodeExecutions } from './utils';

export type WorkflowNodeExecutionsProviderProps = PropsWithChildren<{
  initialNodeExecutions?: NodeExecution[];
}>;

/** Should wrap "top level" component in Execution view, will build a nodeExecutions tree for specific workflow */
export const WorkflowNodeExecutionsProvider = ({
  initialNodeExecutions,
  children,
}: WorkflowNodeExecutionsProviderProps) => {
  // const [shouldUpdate, setShouldUpdate] = useState<boolean>(false);
  const { compiledWorkflowClosure } = useNodeExecutionContext();

  const [nodeExecutionsById, setNodeExecutionsById] = useState<NodeExecutionsById>({});

  const [dagError, setDagError] = useState<Error>();
  const [mergedDag, setMergedDag] = useState<dNode>({} as dNode);
  const [visibleNodes, setVisibleNodes] = useState<dNode[]>([]);

  const [nodeMetadataMap, setNodeMetadataMap] = useState<ScopedIdExpandedMap>({});

  const setCurrentNodeExecutionsById = useCallback(
    (newNodeExecutionsById: NodeExecutionsById): void => {
      setNodeExecutionsById((prev) => {
        const mergedNodes = mergeWith(
          cloneDeep(prev),
          cloneDeep(newNodeExecutionsById),
          mergeNodeExecutions,
        );

        if (stringifyIsEqual(prev, mergedNodes)) {
          return prev;
        }

        // console.log(' dag:', mergedNodes)
        return mergedNodes;
      });
    },
    [nodeExecutionsById, setNodeExecutionsById],
  );

  /**
   * Set initial node executions by id
   */
  useEffect(() => {
    const initialNodeExecutionsById = keyBy(initialNodeExecutions, 'scopedId');

    setCurrentNodeExecutionsById(initialNodeExecutionsById);
  }, [initialNodeExecutions]);

  useEffect(() => {
    setNodeMetadataMap((prev) => {
      const newNodes = values(nodeExecutionsById).reduce((acc, nodeExecution) => {
        acc[nodeExecution.scopedId!] = {
          ...(prev[nodeExecution.scopedId!] || {}),
          isParentNode: isParentNode(nodeExecution),
        };

        return acc;
      }, {} as ScopedIdExpandedMap);
      if (stringifyIsEqual(prev, newNodes)) {
        return prev;
      }

      return newNodes;
    });
  }, [nodeExecutionsById, setNodeMetadataMap]);

  useEffect(() => {
    if (isEmpty(compiledWorkflowClosure)) {
      return;
    }
    const dagData = transformerWorkflowToDag(compiledWorkflowClosure, nodeMetadataMap);

    const { dag, error } = dagData;

    if (error) {
      // if an error occured, stop processing
      setDagError(error);
      return;
    }

    setMergedDag((prev) => {
      if (stringifyIsEqual(prev, dag)) {
        return prev;
      }

      return dag;
    });

    // we remove start/end node info in the root dNode list during first assignment
    const nodes = (cloneDeep(dag?.nodes) ?? []).filter((node) => !isStartOrEndNodeId(node.id));

    setVisibleNodes((prev) => {
      if (stringifyIsEqual(prev, nodes)) {
        return prev;
      }
      return nodes;
    });
  }, [compiledWorkflowClosure, nodeMetadataMap]);

  const toggleNode = useCallback(
    (node: dNode) => {
      setNodeMetadataMap((prev) => ({
        ...prev,
        [node.scopedId]: {
          ...(prev[node.scopedId] || {}),
          expanded: !prev[node.scopedId]?.expanded,
        },
      }));
    },
    [setNodeMetadataMap],
  );

  return (
    <WorkflowNodeExecutionsContext.Provider
      value={{
        nodeExecutionsById: nodeExecutionsById!,
        setCurrentNodeExecutionsById,
        visibleNodes,
        dagData: {
          mergedDag,
          dagError,
        },
        toggleNode,
      }}
    >
      {children}
    </WorkflowNodeExecutionsContext.Provider>
  );
};

export const useNodeExecutionsById = (): IWorkflowNodeExecutionsContext => {
  return useContext(WorkflowNodeExecutionsContext);
};
