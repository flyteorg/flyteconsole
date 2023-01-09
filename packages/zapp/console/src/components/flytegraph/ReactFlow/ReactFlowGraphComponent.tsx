import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import { ConvertFlyteDagToReactFlows } from 'components/flytegraph/ReactFlow/transformDAGToReactFlowV2';
import { NodeExecutionsByIdContext } from 'components/Executions/contexts';
import { useNodeExecutionContext } from 'components/Executions/contextProvider/NodeExecutionDetails';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { isNodeGateNode } from 'components/Executions/utils';
import { dNode } from 'models/Graph/types';
import { useQueryClient } from 'react-query';
import { fetchTaskExecutionList } from 'components/Executions/taskExecutionQueries';
import { isMapTaskV1 } from 'models/Task/utils';
import { ExternalResource, LogsByPhase } from 'models/Execution/types';
import { getGroupedLogs } from 'components/Executions/TaskExecutionsList/utils';
import { LargeLoadingSpinner } from 'components/common/LoadingSpinner';
import { keyBy, merge } from 'lodash';
import { RFWrapperProps, RFGraphTypes, ConvertDagProps } from './types';
import { getRFBackground } from './utils';
import { ReactFlowWrapper } from './ReactFlowWrapper';
import { Legend } from './NodeStatusLegend';
import { PausedTasksComponent } from './PausedTasksComponent';

const nodeExecutionStatusChanged = (previous, nodeExecutionsById) => {
  for (const exe in nodeExecutionsById) {
    const oldStatus = previous[exe]?.closure.phase;
    const newStatus = nodeExecutionsById[exe]?.closure.phase;
    if (oldStatus !== newStatus) {
      return true;
    }
  }
  return false;
};

const nodeExecutionLogsChanged = (previous, nodeExecutionsById) => {
  for (const exe in nodeExecutionsById) {
    const oldLogs = previous[exe]?.logsByPhase ?? new Map();
    const newLogs = nodeExecutionsById[exe]?.logsByPhase ?? new Map();
    if (oldLogs.size !== newLogs.size) {
      return true;
    }
    for (const phase in newLogs) {
      const oldNumOfLogs = oldLogs.get(phase)?.length ?? 0;
      const newNumOfLogs = newLogs.get(phase)?.length ?? 0;
      if (oldNumOfLogs !== newNumOfLogs) {
        return true;
      }
    }
  }
  return false;
};

const graphNodeCountChanged = (previous, data) => {
  if (previous.nodes.length !== data.nodes.length) {
    return true;
  } else {
    return false;
  }
};

const ReactFlowGraphComponent = ({
  data,
  onNodeSelectionChanged,
  onPhaseSelectionChanged,
  selectedPhase,
  isDetailsTabClosed,
  dynamicWorkflows,
  initialNodes,
}) => {
  const queryClient = useQueryClient();
  const { nodeExecutionsById, setCurrentNodeExecutionsById } =
    useContext(NodeExecutionsByIdContext);
  const { compiledWorkflowClosure } = useNodeExecutionContext();

  const [loading, setLoading] = useState<boolean>(true);
  const [pausedNodes, setPausedNodes] = useState<dNode[]>([]);

  const [state, setState] = useState({
    data,
    dynamicWorkflows,
    currentNestedView: {},
    nodeExecutionsById,
    selectedPhase,
    onNodeSelectionChanged,
    onPhaseSelectionChanged,
    rfGraphJson: null,
  });

  useEffect(() => {
    // fetch map tasks data for all available node executions to display graph nodes properly
    let isCurrent = true;

    async function fetchData(baseNodeExecutions, queryClient) {
      setLoading(true);
      const nodeExecutionsWithResources = await Promise.all(
        baseNodeExecutions.map(async (baseNodeExecution) => {
          if (!nodeExecutionsById[baseNodeExecution.scopedId].tasksFetched) {
            return;
          }
          const taskExecutions = await fetchTaskExecutionList(queryClient, baseNodeExecution.id);

          const useNewMapTaskView = taskExecutions.every((taskExecution) => {
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
            .map((taskExecution) => taskExecution.closure.metadata?.externalResources)
            .flat()
            .filter((resource): resource is ExternalResource => !!resource);

          const logsByPhase: LogsByPhase = getGroupedLogs(externalResources);

          return {
            ...baseNodeExecution,
            ...(useNewMapTaskView && logsByPhase.size > 0 && { logsByPhase }),
          };
        }),
      );

      if (isCurrent) {
        const nodeExecutionsWithResourcesMap = keyBy(nodeExecutionsWithResources, 'scopedId');
        const newNodeExecutionsById = merge(nodeExecutionsById, nodeExecutionsWithResourcesMap);
        setCurrentNodeExecutionsById(newNodeExecutionsById);
        const newRFGraphData = buildReactFlowGraphData();
        setState((state) => ({
          ...state,
          nodeExecutionsById: newNodeExecutionsById,
          rfGraphJson: newRFGraphData,
        }));
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

  const onAddNestedView = (view) => {
    const currentView = state.currentNestedView[view.parent] || [];
    const newView = {
      [view.parent]: [...currentView, view.view],
    };
    setState((state) => ({
      ...state,
      currentNestedView: { ...newView },
    }));
  };

  const onRemoveNestedView = (viewParent, viewIndex) => {
    const currentNestedView: any = { ...state.currentNestedView };
    currentNestedView[viewParent] = currentNestedView[viewParent]?.filter(
      (_item, i) => i <= viewIndex,
    );
    if (currentNestedView[viewParent]?.length < 1) {
      delete currentNestedView[viewParent];
    }
    setState((state) => ({
      ...state,
      currentNestedView,
    }));
  };

  const buildReactFlowGraphData = () => {
    return ConvertFlyteDagToReactFlows({
      root: state.data,
      nodeExecutionsById: state.nodeExecutionsById,
      onNodeSelectionChanged: state.onNodeSelectionChanged,
      onPhaseSelectionChanged: state.onPhaseSelectionChanged,
      selectedPhase,
      onAddNestedView,
      onRemoveNestedView,
      currentNestedView: state.currentNestedView,
      maxRenderDepth: 1,
    } as ConvertDagProps);
  };

  useEffect(() => {
    const newRFGraphData = buildReactFlowGraphData();
    setState((state) => ({
      ...state,
      rfGraphJson: newRFGraphData,
    }));
  }, [state.currentNestedView, state.nodeExecutionsById, isDetailsTabClosed]);

  useEffect(() => {
    if (graphNodeCountChanged(state.data, data)) {
      setState((state) => ({
        ...state,
        data: data,
      }));
    }
    if (
      nodeExecutionStatusChanged(state.nodeExecutionsById, nodeExecutionsById) ||
      nodeExecutionLogsChanged(state.nodeExecutionsById, nodeExecutionsById)
    ) {
      setState((state) => ({
        ...state,
        nodeExecutionsById,
      }));
    }
  }, [data, nodeExecutionsById]);

  useEffect(() => {
    setState((state) => ({
      ...state,
      onNodeSelectionChanged,
      onPhaseSelectionChanged,
      selectedPhase,
    }));
  }, [onNodeSelectionChanged, onPhaseSelectionChanged, selectedPhase]);

  const backgroundStyle = getRFBackground().nested;

  useEffect(() => {
    const updatedPausedNodes: dNode[] = initialNodes.filter((node) => {
      const nodeExecution = nodeExecutionsById[node.id];
      if (nodeExecution) {
        const phase = nodeExecution?.closure.phase;
        const isGateNode = isNodeGateNode(
          compiledWorkflowClosure?.primary.template.nodes ?? [],
          nodeExecution.id,
        );
        return isGateNode && phase === NodeExecutionPhase.RUNNING;
      }
      return false;
    });
    const nodesWithExecutions = updatedPausedNodes.map((node) => {
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
      rfGraphJson: state.rfGraphJson,
      type: RFGraphTypes.main,
      nodeExecutionsById,
      currentNestedView: state.currentNestedView,
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

  return state.rfGraphJson ? renderGraph() : <></>;
};

export default ReactFlowGraphComponent;
