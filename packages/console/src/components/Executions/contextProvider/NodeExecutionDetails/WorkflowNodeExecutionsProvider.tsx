import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { NodeExecution, NodeExecutionsById } from 'models/Execution/types';
import {
  IWorkflowNodeExecutionsContext,
  WorkflowNodeExecutionsContext,
} from 'components/Executions/contexts';
import { isEqual, keyBy, merge, mergeWith } from 'lodash';
import { dNode } from 'models/Graph/types';
import {
  NodeExecutionDynamicWorkflowQueryResult,
  makeNodeExecutionDynamicWorkflowQuery,
} from 'components/Workflow/workflowQueries';
import { transformerWorkflowToDag } from 'components/WorkflowGraph/transformerWorkflowToDag';
import { checkForDynamicExecutions } from 'components/common/utils';
import { useQuery } from 'react-query';
import { convertToPlainNodes } from 'components/Executions/ExecutionDetails/Timeline/helpers';
import { useNodeExecutionContext } from './NodeExecutionDetailsContextProvider';
import { mapStringifyReplacer, mergeNodeExecutions } from './utils';

export type WorkflowNodeExecutionsProviderProps = PropsWithChildren<{
  initialNodeExecutions?: NodeExecution[];
}>;

/** Should wrap "top level" component in Execution view, will build a nodeExecutions tree for specific workflow */
export const WorkflowNodeExecutionsProvider = ({
  initialNodeExecutions,
  children,
}: WorkflowNodeExecutionsProviderProps) => {
  const [shouldUpdate, setShouldUpdate] = useState<boolean>(false);
  const { compiledWorkflowClosure } = useNodeExecutionContext();

  const [nodeExecutionsById, setNodeExecutionsById] =
    useState<NodeExecutionsById>({});

  const [dagError, setDagError] = useState(null);
  const [mergedDag, setMergedDag] = useState({});
  const [initialDNodes, setInitialDNodes] = useState<dNode[]>([]);

  const [dynamicWorkflows, setDynamicWorkflows] =
    useState<NodeExecutionDynamicWorkflowQueryResult>({});
  const [staticExecutionIdsMap, setstaticExecutionIdsMap] = useState({});

  const [dynamicParents, setDynamicParents] = useState({});

  const nodeExecutionDynamicWorkflowQuery = useQuery(
    makeNodeExecutionDynamicWorkflowQuery(dynamicParents),
  );

  useEffect(() => {
    const initialNodeExecutionsById = keyBy(initialNodeExecutions, 'scopedId');

    setCurrentNodeExecutionsById(initialNodeExecutionsById, true);
  }, [initialNodeExecutions]);

  useEffect(() => {
    const { staticExecutionIdsMap: newstaticExecutionIdsMap } =
      compiledWorkflowClosure
        ? transformerWorkflowToDag(compiledWorkflowClosure)
        : { staticExecutionIdsMap: {} };

    setstaticExecutionIdsMap(prev => {
      if (isEqual(prev, newstaticExecutionIdsMap)) {
        return prev;
      }

      return newstaticExecutionIdsMap;
    });
  }, [compiledWorkflowClosure]);

  useEffect(() => {
    const newdynamicParents = checkForDynamicExecutions(
      nodeExecutionsById,
      staticExecutionIdsMap,
    );
    setDynamicParents(prev => {
      if (isEqual(prev, newdynamicParents)) {
        return prev;
      }

      return newdynamicParents;
    });
  }, [nodeExecutionsById]);

  useEffect(() => {
    const dagData = compiledWorkflowClosure
      ? transformerWorkflowToDag(
          compiledWorkflowClosure,
          dynamicWorkflows,
          nodeExecutionsById,
        )
      : { dag: {}, staticExecutionIdsMap: {}, error: null };
    const { dag, staticExecutionIdsMap, error } = dagData;
    const nodes = dag.nodes ?? [];

    let newMergedDag = dag;

    for (const dynamicId in dynamicWorkflows) {
      if (staticExecutionIdsMap[dynamicId]) {
        if (compiledWorkflowClosure) {
          const dynamicWorkflow = transformerWorkflowToDag(
            compiledWorkflowClosure,
            dynamicWorkflows,
            nodeExecutionsById,
          );
          newMergedDag = dynamicWorkflow.dag;
        }
      }
    }
    setDagError(error);
    setMergedDag(prev => {
      if (isEqual(prev, newMergedDag)) {
        return prev;
      }
      return newMergedDag;
    });

    // we remove start/end node info in the root dNode list during first assignment
    const plainNodes = convertToPlainNodes(nodes);
    plainNodes.map(node => {
      const initialNode = initialDNodes.find(n => n.scopedId === node.scopedId);
      if (initialNode) {
        node.expanded = initialNode.expanded;
      }
    });
    setInitialDNodes(prev => {
      if (isEqual(prev, plainNodes)) {
        return prev;
      }
      return plainNodes;
    });
  }, [
    compiledWorkflowClosure,
    dynamicWorkflows,
    dynamicParents,
    nodeExecutionsById,
  ]);

  useEffect(() => {
    if (nodeExecutionDynamicWorkflowQuery.isFetching) {
      return;
    }
    setDynamicWorkflows(prev => {
      const newDynamicWorkflows = merge(
        { ...(prev || {}) },
        nodeExecutionDynamicWorkflowQuery.data,
      );
      if (isEqual(prev, newDynamicWorkflows)) {
        return prev;
      }

      return newDynamicWorkflows;
    });
  }, [nodeExecutionDynamicWorkflowQuery]);

  useEffect(() => {
    if (shouldUpdate) {
      const newDynamicParents = checkForDynamicExecutions(
        nodeExecutionsById,
        staticExecutionIdsMap,
      );
      setDynamicParents(prev => {
        if (isEqual(prev, newDynamicParents)) {
          return prev;
        }

        return newDynamicParents;
      });
      setShouldUpdate(false);
    }
  }, [shouldUpdate]);

  const setCurrentNodeExecutionsById = useCallback(
    (
      newNodeExecutionsById: NodeExecutionsById,
      checkForDynamicParents?: boolean,
    ): void => {
      setNodeExecutionsById(prev => {
        const newNodes = mergeWith(
          { ...prev },
          { ...newNodeExecutionsById },
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

        return newNodes;
      });
    },
    [],
  );

  return (
    <WorkflowNodeExecutionsContext.Provider
      value={{
        nodeExecutionsById: nodeExecutionsById!,
        setCurrentNodeExecutionsById,
        shouldUpdate,
        setShouldUpdate,
        initialDNodes,
        dagData: {
          mergedDag,
          dagError,
        },
      }}
    >
      {children}
    </WorkflowNodeExecutionsContext.Provider>
  );
};

export const useNodeExecutionsById = (): IWorkflowNodeExecutionsContext => {
  return useContext(WorkflowNodeExecutionsContext);
};
