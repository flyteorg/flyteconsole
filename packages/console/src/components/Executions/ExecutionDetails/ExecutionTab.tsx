import * as React from 'react';
import {
  FilterOperation,
  FilterOperationName,
  FilterOperationValueList,
  NodeExecution,
  NodeExecutionsById,
} from 'models';
import { dNode } from 'models/Graph/types';
import { cloneDeep, isEqual } from 'lodash';
import { transformerWorkflowToDag } from 'components/WorkflowGraph/transformerWorkflowToDag';
import { useEffect, useState } from 'react';
import { checkForDynamicExecutions } from 'components/common/utils';
import { useQuery } from 'react-query';
import { makeNodeExecutionDynamicWorkflowQuery } from 'components/Workflow/workflowQueries';
import { WorkflowGraph } from 'components/WorkflowGraph/WorkflowGraph';
import { convertToPlainNodes } from './Timeline/helpers';
import { tabs } from './constants';
import { NodeExecutionsTable } from '../Tables/NodeExecutionsTable';
import { DetailsPanelContextProvider } from './DetailsPanelContext';
import { useNodeExecutionFiltersState } from '../filters/useExecutionFiltersState';
import { nodeExecutionPhaseConstants } from '../constants';
import { ScaleProvider } from './Timeline/scaleContext';
import {
  useNodeExecutionContext,
  useNodeExecutionsById,
} from '../contextProvider/NodeExecutionDetails';
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

/** Contains the available ways to visualize the nodes of a WorkflowExecution */
export const ExecutionTab: React.FC<ExecutionTabProps> = ({ tabType }) => {
  const { compiledWorkflowClosure } = useNodeExecutionContext();
  const { nodeExecutionsById, setShouldUpdate, shouldUpdate } =
    useNodeExecutionsById();
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
  const [dagError, setDagError] = useState(null);
  const [mergedDag, setMergedDag] = useState(null);

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

  const renderContent = () => {
    switch (tabType) {
      case tabs.nodes.id:
        return <NodeExecutionsTable initialNodes={initialNodes} />;
      case tabs.graph.id:
        return (
          <WorkflowGraph
            mergedDag={mergedDag}
            error={dagError as any}
            initialNodes={initialNodes}
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
      <DetailsPanelContextProvider>
        {renderContent()}
      </DetailsPanelContextProvider>
      {/* Side panel, shows information for specific node */}
    </ScaleProvider>
  );
};
