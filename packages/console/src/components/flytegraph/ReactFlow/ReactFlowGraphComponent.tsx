import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ConvertFlyteDagToReactFlows } from 'components/flytegraph/ReactFlow/transformDAGToReactFlowV2';
import { NodeExecutionsByIdContext } from 'components/Executions/contexts';
import { useNodeExecutionContext } from 'components/Executions/contextProvider/NodeExecutionDetails';
import { NodeExecutionPhase } from 'models/Execution/enums';
import {
  fetchChildrenExecutions,
  isNodeGateNode,
} from 'components/Executions/utils';
import { dNode } from 'models/Graph/types';
import { useQueryClient } from 'react-query';
import { fetchTaskExecutionList } from 'components/Executions/taskExecutionQueries';
import { isMapTaskV1 } from 'models/Task/utils';
import { extractCompiledNodes } from 'components/hooks/utils';
import { ExternalResource, LogsByPhase } from 'models/Execution/types';
import { getGroupedLogs } from 'components/Executions/TaskExecutionsList/utils';
import { LargeLoadingSpinner } from 'components/common/LoadingSpinner';
import { keyBy, merge } from 'lodash';
import { RFWrapperProps, RFGraphTypes, ConvertDagProps } from './types';
import { getRFBackground, isUnFetchedDynamicNode } from './utils';
import { ReactFlowWrapper } from './ReactFlowWrapper';
import { Legend } from './NodeStatusLegend';
import { PausedTasksComponent } from './PausedTasksComponent';

export const ReactFlowGraphComponent = ({
  data,
  onNodeSelectionChanged,
  onPhaseSelectionChanged,
  selectedPhase,
  isDetailsTabClosed,
  initialNodes,
  shouldUpdate,
  setShouldUpdate,
}) => {
  const queryClient = useQueryClient();
  const { nodeExecutionsById, setCurrentNodeExecutionsById } = useContext(
    NodeExecutionsByIdContext,
  );
  const { compiledWorkflowClosure } = useNodeExecutionContext();

  const [loading, setLoading] = useState<boolean>(true);
  const [pausedNodes, setPausedNodes] = useState<dNode[]>([]);
  const [currentNestedView, setcurrentNestedView] = useState({});

  const onAddNestedView = async (view, sourceNode: any = null) => {
    if (sourceNode && isUnFetchedDynamicNode(sourceNode)) {
      await fetchChildrenExecutions(
        queryClient,
        sourceNode.scopedId,
        nodeExecutionsById,
        setCurrentNodeExecutionsById,
        setShouldUpdate,
      );
    }

    const currentView = currentNestedView[view.parent] || [];
    const newView = {
      [view.parent]: [...currentView, view.view],
    };
    setcurrentNestedView(newView);
  };

  const onRemoveNestedView = (viewParent, viewIndex) => {
    const newcurrentNestedView: any = { ...currentNestedView };
    newcurrentNestedView[viewParent] = newcurrentNestedView[viewParent]?.filter(
      (_item, i) => i <= viewIndex,
    );
    if (newcurrentNestedView[viewParent]?.length < 1) {
      delete newcurrentNestedView[viewParent];
    }
    setcurrentNestedView(newcurrentNestedView);
  };

  const rfGraphJson = useMemo(() => {
    return ConvertFlyteDagToReactFlows({
      root: data,
      nodeExecutionsById,
      onNodeSelectionChanged,
      onPhaseSelectionChanged,
      selectedPhase,
      onAddNestedView,
      onRemoveNestedView,
      currentNestedView,
      maxRenderDepth: 1,
    } as ConvertDagProps);
  }, [
    data,
    isDetailsTabClosed,
    shouldUpdate,
    nodeExecutionsById,
    onNodeSelectionChanged,
    onPhaseSelectionChanged,
    selectedPhase,
    onAddNestedView,
    onRemoveNestedView,
    currentNestedView,
  ]);

  useEffect(() => {
    // fetch map tasks data for all available node executions to display graph nodes properly
    let isCurrent = true;

    async function fetchData(baseNodeExecutions, queryClient) {
      setLoading(true);
      const nodeExecutionsWithResources = await Promise.all(
        baseNodeExecutions.map(async baseNodeExecution => {
          if (
            !baseNodeExecution ||
            nodeExecutionsById?.[baseNodeExecution.scopedId]?.tasksFetched
          ) {
            return;
          }
          const taskExecutions = await fetchTaskExecutionList(
            queryClient,
            baseNodeExecution.id,
          );

          const useNewMapTaskView = taskExecutions.every(taskExecution => {
            const {
              closure: { taskType, metadata, eventVersion = 0 },
            } = taskExecution;
            return isMapTaskV1(
              eventVersion,
              metadata?.externalResources?.length ?? 0,
              taskType ?? undefined,
            );
          });
          const externalResources: ExternalResource[] = taskExecutions
            .map(
              taskExecution =>
                taskExecution.closure.metadata?.externalResources,
            )
            .flat()
            .filter((resource): resource is ExternalResource => !!resource);

          const logsByPhase: LogsByPhase = getGroupedLogs(externalResources);

          return {
            ...baseNodeExecution,
            ...(useNewMapTaskView && logsByPhase.size > 0 && { logsByPhase }),
            tasksFetched: true,
          };
        }),
      );

      if (isCurrent) {
        const nodeExecutionsWithResourcesMap = keyBy(
          nodeExecutionsWithResources,
          'scopedId',
        );
        const newNodeExecutionsById = merge(
          nodeExecutionsById,
          nodeExecutionsWithResourcesMap,
        );
        setCurrentNodeExecutionsById(newNodeExecutionsById);
        setLoading(false);
      }
    }

    const nodeExecutions = Object.values(nodeExecutionsById);
    if (nodeExecutions.length > 0) {
      fetchData(nodeExecutions, queryClient);
    } else {
      if (isCurrent) {
        setLoading(false);
      }
    }
    return () => {
      isCurrent = false;
    };
  }, [initialNodes]);

  const backgroundStyle = getRFBackground().nested;

  useEffect(() => {
    const updatedPausedNodes: dNode[] = initialNodes.filter(node => {
      const nodeExecution = nodeExecutionsById[node.id];
      if (nodeExecution) {
        const phase = nodeExecution?.closure.phase;
        const isGateNode = isNodeGateNode(
          extractCompiledNodes(compiledWorkflowClosure),
          nodeExecution.metadata?.specNodeId || nodeExecution.id.nodeId,
        );
        return isGateNode && phase === NodeExecutionPhase.RUNNING;
      }
      return false;
    });
    const nodesWithExecutions = updatedPausedNodes.map(node => {
      const execution = nodeExecutionsById[node.scopedId];
      return {
        ...node,
        startedAt: execution?.closure.startedAt,
        execution,
      };
    });
    setPausedNodes(nodesWithExecutions);
  }, [initialNodes]);

  if (loading) {
    return (
      <div style={{ margin: 'auto' }}>
        <LargeLoadingSpinner />
      </div>
    );
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flex: `1 1 100%`,
    flexDirection: 'column',
    minHeight: '100px',
    minWidth: '200px',
    height: '100%',
  };

  const renderGraph = () => {
    const ReactFlowProps: RFWrapperProps = {
      backgroundStyle,
      rfGraphJson,
      type: RFGraphTypes.main,
      nodeExecutionsById,
      currentNestedView: currentNestedView,
      setShouldUpdate,
    };
    return (
      <div style={containerStyle}>
        {pausedNodes && pausedNodes.length > 0 && (
          <PausedTasksComponent pausedNodes={pausedNodes} />
        )}
        <Legend />
        <ReactFlowWrapper {...ReactFlowProps} />
      </div>
    );
  };

  return rfGraphJson ? renderGraph() : <></>;
};
