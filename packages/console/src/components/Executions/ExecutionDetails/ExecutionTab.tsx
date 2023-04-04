import * as React from 'react';
import { dNode } from 'models/Graph/types';
import { isEqual } from 'lodash';
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
import { ScaleProvider } from './Timeline/scaleContext';
import {
  useNodeExecutionContext,
  useNodeExecutionsById,
} from '../contextProvider/NodeExecutionDetails';
import { ExecutionTimelineContainer } from './Timeline/ExecutionTimelineContainer';

interface ExecutionTabProps {
  tabType: string;
}

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
      const initialNode = initialNodes.find(n => n.scopedId === node.scopedId);
      if (initialNode) {
        node.expanded = initialNode.expanded;
      }
    });
    setInitialNodes(prev => {
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
