import * as React from 'react';
import {
  FilterOperation,
  FilterOperationName,
  FilterOperationValueList,
  NodeExecution,
  NodeExecutionIdentifier,
  NodeExecutionsById,
  TaskExecutionPhase,
} from 'models';
import { dNode } from 'models/Graph/types';
import { cloneDeep, isEqual } from 'lodash';
import { transformerWorkflowToDag } from 'components/WorkflowGraph/transformerWorkflowToDag';
import { useEffect, useMemo, useState } from 'react';
import { checkForDynamicExecutions } from 'components/common/utils';
import { useQuery } from 'react-query';
import { makeNodeExecutionDynamicWorkflowQuery } from 'components/Workflow/workflowQueries';
import { endNodeId, startNodeId } from 'models/Node/constants';
import { WorkflowGraph } from 'components/WorkflowGraph/WorkflowGraph';
import { DetailsPanel } from 'components/common/DetailsPanel';
import { convertToPlainNodes, TimeZone } from './Timeline/helpers';
import { tabs } from './constants';
import { NodeExecutionsTable } from '../Tables/NodeExecutionsTable';
import { DetailsPanelContext } from './DetailsPanelContext';
import { useNodeExecutionFiltersState } from '../filters/useExecutionFiltersState';
import { nodeExecutionPhaseConstants } from '../constants';
import { ScaleProvider } from './Timeline/scaleContext';
import {
  useNodeExecutionContext,
  useNodeExecutionsById,
} from '../contextProvider/NodeExecutionDetails';
import { NodeExecutionDetailsPanelContent } from './NodeExecutionDetailsPanelContent';
import { ExecutionTimelineContainer } from './Timeline/ExecutionTimelineContainer';

interface ExecutionTabProps {
  tabType: string;
}

const executionMatchesPhaseFilter = (
  nodeExecution: NodeExecution,
  { key, value, operation }: FilterOperation,
) => {
  if (key === 'phase' && operation === FilterOperationName.VALUE_IN) {
    // default to UNKNOWN phase if the field does not exist on a closure
    const itemValue =
      nodeExecutionPhaseConstants()[nodeExecution?.closure[key]]?.value ??
      nodeExecutionPhaseConstants()[0].value;
    // phase check filters always return values in an array
    const valuesArray = value as FilterOperationValueList;
    return valuesArray.includes(itemValue);
  }
  return false;
};

const filterNodes = (
  initialNodes: dNode[],
  nodeExecutionsById: NodeExecutionsById,
  appliedFilters: FilterOperation[],
) => {
  if (!initialNodes?.length) {
    return [];
  }

  let initialClone = cloneDeep(initialNodes);

  initialClone.forEach(n => {
    n.nodes = filterNodes(n.nodes, nodeExecutionsById, appliedFilters);
  });

  initialClone = initialClone.filter(node => {
    const hasFilteredChildren = node.nodes?.length;
    const shouldBeIncluded = executionMatchesPhaseFilter(
      nodeExecutionsById[node.scopedId],
      appliedFilters[0],
    );
    const result = hasFilteredChildren || shouldBeIncluded;

    if (hasFilteredChildren && !shouldBeIncluded) {
      node.grayedOut = true;
    }

    return result;
  });

  return initialClone;
};

export const useExecutionTabData = () => {
  const { compiledWorkflowClosure } = useNodeExecutionContext();
  const { appliedFilters } = useNodeExecutionFiltersState();
  const {
    nodeExecutionsById,
    filteredNodeExecutions,
    setShouldUpdate,
    shouldUpdate,
  } = useNodeExecutionsById();
  const { staticExecutionIdsMap } = compiledWorkflowClosure
    ? transformerWorkflowToDag(compiledWorkflowClosure)
    : { staticExecutionIdsMap: {} };
  const [dynamicParents, setDynamicParents] = useState(
    checkForDynamicExecutions(nodeExecutionsById, staticExecutionIdsMap),
  );
  const { data: dynamicWorkflows } = useQuery(
    makeNodeExecutionDynamicWorkflowQuery(dynamicParents),
  );

  const [initialNodes, setInitialNodes] = useState<dNode[]>([]);
  const [initialFilteredNodes, setInitialFilteredNodes] = useState<
    dNode[] | undefined
  >(undefined);
  const [dagError, setDagError] = useState(null);
  const [mergedDag, setMergedDag] = useState(null);
  const [filters, setFilters] = useState<FilterOperation[]>(appliedFilters);
  const [isFiltersChanged, setIsFiltersChanged] = useState<boolean>(false);

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

  useEffect(() => {
    const { dag, staticExecutionIdsMap, error } = compiledWorkflowClosure
      ? transformerWorkflowToDag(
          compiledWorkflowClosure,
          dynamicWorkflows,
          nodeExecutionsById,
        )
      : { dag: {}, staticExecutionIdsMap: {}, error: null };

    const nodes = dag.nodes ?? [];

    // we remove start/end node info in the root dNode list during first assignment
    const plainNodes = convertToPlainNodes(nodes);

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
    setMergedDag(newMergedDag);
    plainNodes.map(node => {
      const initialNode = initialNodes.find(n => n.scopedId === node.scopedId);
      if (initialNode) {
        node.expanded = initialNode.expanded;
      }
    });
    setInitialNodes(plainNodes);
  }, [
    compiledWorkflowClosure,
    dynamicWorkflows,
    dynamicParents,
    nodeExecutionsById,
  ]);

  useEffect(() => {
    if (!isEqual(filters, appliedFilters)) {
      setFilters(appliedFilters);
      setIsFiltersChanged(true);
    } else {
      setIsFiltersChanged(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    if (appliedFilters.length > 0) {
      // if filter was apllied, but filteredNodeExecutions is empty, we only appliied Phase filter,
      // and need to clear out items manually
      if (!filteredNodeExecutions) {
        // top level
        const filteredNodes = filterNodes(
          initialNodes,
          nodeExecutionsById,
          appliedFilters,
        );

        setInitialFilteredNodes(filteredNodes);
      } else {
        const filteredNodes = initialNodes.filter((node: dNode) =>
          filteredNodeExecutions.find(
            (execution: NodeExecution) => execution.scopedId === node.scopedId,
          ),
        );
        setInitialFilteredNodes(filteredNodes);
      }
    }
  }, [initialNodes, filteredNodeExecutions, isFiltersChanged]);

  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  // Note: flytegraph allows multiple selection, but we only support showing
  // a single item in the details panel
  const [selectedExecution, setSelectedExecution] =
    useState<NodeExecutionIdentifier | null>(
      selectedNodes.length
        ? nodeExecutionsById[selectedNodes[0]]
          ? nodeExecutionsById[selectedNodes[0]].id
          : {
              nodeId: selectedNodes[0],
              executionId:
                nodeExecutionsById[Object.keys(nodeExecutionsById)[0]].id
                  .executionId,
            }
        : null,
    );

  const [selectedPhase, setSelectedPhase] = useState<
    TaskExecutionPhase | undefined
  >(undefined);
  const [isDetailsTabClosed, setIsDetailsTabClosed] = useState<boolean>(
    !selectedExecution,
  );

  useEffect(() => {
    setIsDetailsTabClosed(!selectedExecution);
  }, [selectedExecution]);

  const onCloseDetailsPanel = () => {
    setSelectedExecution(null);
    setSelectedPhase(undefined);
    setSelectedNodes([]);
  };

  const detailsPanelContext = useMemo(
    () => ({ selectedExecution, setSelectedExecution }),
    [selectedExecution, setSelectedExecution],
  );

  const onNodeSelectionChanged = (newSelection: string[]) => {
    const validSelection = newSelection.filter(nodeId => {
      if (nodeId === startNodeId || nodeId === endNodeId) {
        return false;
      }
      return true;
    });
    setSelectedNodes(validSelection);
    const newSelectedExecution = validSelection.length
      ? nodeExecutionsById[validSelection[0]]
        ? nodeExecutionsById[validSelection[0]].id
        : {
            nodeId: validSelection[0],
            executionId:
              nodeExecutionsById[Object.keys(nodeExecutionsById)[0]].id
                .executionId,
          }
      : null;
    setSelectedExecution(newSelectedExecution);
  };

  return {
    dagError,
    detailsPanelContext,
    dynamicWorkflows,
    initialFilteredNodes,
    initialNodes,
    isDetailsTabClosed,
    mergedDag,
    onCloseDetailsPanel,
    onNodeSelectionChanged,
    selectedExecution,
    selectedPhase,
    setSelectedPhase,
  };
};
/** Contains the available ways to visualize the nodes of a WorkflowExecution */
export const ExecutionTab2: React.FC<ExecutionTabProps> = ({ tabType }) => {
  const {
    dagError,
    detailsPanelContext,
    dynamicWorkflows,
    initialFilteredNodes,
    initialNodes,
    isDetailsTabClosed,
    mergedDag,
    onCloseDetailsPanel,
    onNodeSelectionChanged,
    selectedExecution,
    selectedPhase,
    setSelectedPhase,
  } = useExecutionTabData();

  const renderContent = () => {
    switch (tabType) {
      case tabs.nodes.id:
        return (
          <NodeExecutionsTable
            initialNodes={initialNodes}
            filteredNodes={initialFilteredNodes}
          />
        );
      case tabs.graph.id:
        return (
          <WorkflowGraph
            mergedDag={mergedDag}
            error={dagError}
            dynamicWorkflows={dynamicWorkflows}
            initialNodes={initialNodes}
            onNodeSelectionChanged={onNodeSelectionChanged}
            selectedPhase={selectedPhase}
            onPhaseSelectionChanged={setSelectedPhase}
            isDetailsTabClosed={isDetailsTabClosed}
          />
        );
      case tabs.timeline.id:
        return <ExecutionTimelineContainer initialNodes={initialNodes} />;
      default:
        return null;
    }
  };

  return (
    <ScaleProvider>
      <DetailsPanelContext.Provider value={detailsPanelContext}>
        {renderContent()}
        <DetailsPanel open={!isDetailsTabClosed} onClose={onCloseDetailsPanel}>
          {!isDetailsTabClosed && selectedExecution && (
            <NodeExecutionDetailsPanelContent
              onClose={onCloseDetailsPanel}
              taskPhase={selectedPhase ?? TaskExecutionPhase.UNDEFINED}
              nodeExecutionId={selectedExecution}
            />
          )}
        </DetailsPanel>
      </DetailsPanelContext.Provider>
      {/* Side panel, shows information for specific node */}
    </ScaleProvider>
  );
};
