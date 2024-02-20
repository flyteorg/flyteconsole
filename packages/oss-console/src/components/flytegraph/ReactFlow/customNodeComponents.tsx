/* eslint-disable no-use-before-define */
import React, { MouseEventHandler, useMemo, useState } from 'react';
import { Handle, HandleProps, Position, ReactFlowProps } from 'react-flow-renderer';
import PlayCircleOutline from '@mui/icons-material/PlayCircleOutline';
import Tooltip from '@mui/material/Tooltip';
import classNames from 'classnames';
import { LoadingSpinner } from '@clients/primitives/LoadingSpinner';
import { dTypes } from '../../../models/Graph/types';
import {
  CatalogCacheStatus,
  NodeExecutionPhase,
  TaskExecutionPhase,
} from '../../../models/Execution/enums';
import { RENDER_ORDER } from '../../Executions/TaskExecutionsList/constants';
import { getNodeFrontendPhase, isParentNode } from '../../Executions/utils';
import { CacheStatus } from '../../Executions/CacheStatus';
import { LaunchFormDialog } from '../../Launch/LaunchForm/LaunchFormDialog';
import { useNodeExecutionsById } from '../../Executions/contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';
import {
  NodeExecutionDynamicProvider,
  useNodeExecutionDynamicContext,
} from '../../Executions/contextProvider/NodeExecutionDetails/NodeExecutionDynamicProvider';
import { useEscapeKey } from '../../hooks/useKeyListener';
import { useDetailsPanel } from '../../Executions/ExecutionDetails/DetailsPanelContext';
import { getGraphNodeClasses } from './utils';
import { RFNode } from './types';
import t from './strings';
import { BorderContainer, BreadCrumbContainer, BreadElement } from './BreadCrumb';
import { useReactFlowBreadCrumbContext } from './ReactFlowBreadCrumbProvider';
import { isMapTaskType } from '../../../models/Task/utils';
import {
  ExternalResource,
  ExternalResourcesByPhase,
  NodeExecutionIdentifier,
} from '../../../models/Execution/types';
import {
  getNodeExecutionStatusClassName,
  getTaskExecutionStatusClassName,
} from '../../utils/classes';
import { useWorkflowNodeExecutionTaskExecutionsQuery } from '../../hooks/useWorkflowNodeExecutionTaskExecutionsQuery';
import { getGroupedExternalResources } from '../../Executions/TaskExecutionsList/utils';
import { nodeExecutionRefreshIntervalMs } from '../../Executions/constants';

const renderTaskType = (taskType: dTypes | undefined) => {
  if (!taskType) {
    return null;
  }
  return (
    <div className="label">
      <div className="taskType">{taskType}</div>
    </div>
  );
};

export const renderDefaultHandles = (id: string) => {
  const leftHandleProps: HandleProps = {
    id: `edge-left-${id}`,
    type: 'target',
    position: Position.Left,
  };

  const rightHandleProps: HandleProps = {
    id: `edge-right-${id}`,
    type: 'source',
    position: Position.Right,
  };
  return (
    <>
      <Handle {...leftHandleProps} />
      <Handle {...rightHandleProps} />
    </>
  );
};

const renderBasicNode = (
  taskType: dTypes | undefined,
  text: string,
  scopedId: string,
  className: string,
  onClick?: () => void,
  componentProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  stillLoading: boolean = false,
) => {
  return (
    <div onClick={onClick} {...(componentProps || {})}>
      {renderTaskType(taskType)}
      <div className={classNames('taskName', className)}>
        {stillLoading ? (
          <div className="loading">
            <LoadingSpinner size="xs" color="inherit" useDelay={false} />
          </div>
        ) : (
          text
        )}
      </div>
      {renderDefaultHandles(scopedId)}
    </div>
  );
};

export const renderStardEndHandles = (nodeType: dTypes, scopedId: string) => {
  const isStart = nodeType === dTypes.nestedStart || nodeType === dTypes.start;
  const idPrefix = isStart ? 'start' : 'end';
  const position = isStart ? Position.Right : Position.Left;
  const type = isStart ? 'source' : 'target';

  /**
   * @TODO
   * Resepect the actual node type once toggle nested graphs is implemented
   * For now we force nestedMaxDepth for any nested types
   */
  const className =
    nodeType === dTypes.nestedStart || nodeType === dTypes.nestedEnd ? 'nestedMaxDepth' : '';

  return (
    <Handle
      id={`rf-handle-${idPrefix}-${scopedId}`}
      type={type}
      position={position}
      className={className}
    />
  );
};

/**
 * Styles start/end nodes as a point; used for nested workflows
 * @param props.data data property of ReactFlowGraphNodeData
 */
export const ReactFlowCustomNestedPoint = ({ data }: RFNode) => {
  const { nodeType, scopedId } = data;
  const classNames = getGraphNodeClasses(nodeType);
  return (
    <>
      <div className={classNames} />
      {renderStardEndHandles(nodeType, scopedId)}
    </>
  );
};

/**
 * @TODO
 * This component used as a stop gap until we support fully nested
 * workflows; renders nested data (branch/workflow) as a single node
 * denoted by solid color.
 * @param props.data data property of ReactFlowGraphNodeData
 */
export const ReactFlowCustomMaxNested = (props: ReactFlowNodeProps) => {
  return (
    <NodeExecutionDynamicProvider node={props.data.node}>
      <ReactFlowCustomMaxNestedInner {...props} />
    </NodeExecutionDynamicProvider>
  );
};
const ReactFlowCustomMaxNestedInner = ({ data }: RFNode) => {
  const { text, taskType, scopedId, parentScopedId, node } = data;
  const { nodeExecutionsById } = useNodeExecutionsById();
  const { onAddNestedView } = useReactFlowBreadCrumbContext();
  const { componentProps } = useNodeExecutionDynamicContext();

  const nodeExecution = useMemo(
    () => nodeExecutionsById[node?.scopedId],
    [nodeExecutionsById[node?.scopedId]],
  );
  const isParent = isParentNode(nodeExecution);
  const stillLoading = isParentNode(nodeExecution) && !node?.nodes?.length;
  const className = getGraphNodeClasses(
    dTypes.nestedMaxDepth,
    nodeExecution?.closure?.phase,
    stillLoading,
  );

  return renderBasicNode(
    taskType,
    text,
    scopedId,
    className,
    () => {
      // Prevent users from clicking a node that doesn't have its children loaded
      if (stillLoading) {
        return;
      }
      onAddNestedView(
        {
          parent: isParent ? parentScopedId : scopedId,
          view: scopedId,
        },
        node,
      );
    },
    componentProps,
    stillLoading,
  );
};

export const ReactFlowStaticNested = (props: ReactFlowNodeProps) => {
  return (
    <NodeExecutionDynamicProvider node={props.data.node}>
      <ReactFlowStaticNestedInner {...props} />
    </NodeExecutionDynamicProvider>
  );
};
const ReactFlowStaticNestedInner = ({ data }: RFNode) => {
  const { text, taskType, scopedId } = data;
  const classNames = getGraphNodeClasses(dTypes.staticNestedNode);
  return renderBasicNode(taskType, text, scopedId, classNames);
};

export const ReactFlowStaticNode = (props: ReactFlowNodeProps) => {
  return (
    <NodeExecutionDynamicProvider node={props.data.node}>
      <ReactFlowStaticNodeInner {...props} />
    </NodeExecutionDynamicProvider>
  );
};
const ReactFlowStaticNodeInner = ({ data }: RFNode) => {
  const { text, taskType, scopedId } = data;
  const className = getGraphNodeClasses(dTypes.staticNode);
  return renderBasicNode(taskType, text, scopedId, className);
};

/**
 * Component that renders a map task item within the mapped node.
 * @param props.numberOfTasks number of tasks of certain completion phase
 * @param props.color string value of color of the block
 * @param props.phase phase of the current map task item
 */

interface TaskPhaseItemProps {
  numberOfTasks: number;
  phase: TaskExecutionPhase;
  setSelectedPhase: (phase: TaskExecutionPhase) => void;
  setSelectedNode: (val: boolean) => void;
}

const TaskPhaseItem = ({
  numberOfTasks,
  phase,
  setSelectedPhase,
  setSelectedNode,
}: TaskPhaseItemProps) => {
  const handleMapTaskClick: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    setSelectedNode(true);
    setSelectedPhase(phase);
  };

  return (
    <div
      className={classNames(getTaskExecutionStatusClassName('background', phase), 'taskPhase')}
      onClick={handleMapTaskClick}
    >
      ×{numberOfTasks}
    </div>
  );
};

/**
 * Custom component used by ReactFlow.  Renders a label (text)
 * and any edge handles.
 * @param props.data data property of ReactFlowGraphNodeData
 */
export const ReactFlowGateNode = (props: ReactFlowNodeProps) => {
  return (
    <NodeExecutionDynamicProvider node={props.data.node}>
      <ReactFlowGateNodeInner {...props} />
    </NodeExecutionDynamicProvider>
  );
};
const ReactFlowGateNodeInner = ({ data }: RFNode) => {
  const { setSelectedExecution } = useDetailsPanel();
  const { componentProps } = useNodeExecutionDynamicContext();
  const { nodeExecutionsById } = useNodeExecutionsById();

  const { node, nodeType, nodeExecutionStatus, text, scopedId } = data;

  const nodeExecution = useMemo(
    () => nodeExecutionsById[node?.scopedId],
    [nodeExecutionsById[node?.scopedId]],
  );
  const phase = getNodeFrontendPhase(nodeExecution?.closure?.phase || nodeExecutionStatus, true);
  const classNames = getGraphNodeClasses(nodeType, phase);
  const [showResumeForm, setShowResumeForm] = useState<boolean>(false);
  useEscapeKey(() => {
    setShowResumeForm(false);
  });

  const compiledNode = node.value;

  const handleNodeClick: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();

    setSelectedExecution(nodeExecution?.id as NodeExecutionIdentifier);
  };

  const onResumeClick: MouseEventHandler<SVGSVGElement> = (e) => {
    e.stopPropagation();
    setShowResumeForm(true);
  };

  return (
    <div onClick={handleNodeClick} {...componentProps}>
      <div className={classNames}>
        {text}
        {phase === NodeExecutionPhase.PAUSED && (
          <Tooltip title={t('resumeTooltip')}>
            <PlayCircleOutline className="icon" onClick={onResumeClick} />
          </Tooltip>
        )}
      </div>
      {renderDefaultHandles(scopedId)}
      {compiledNode && (
        <LaunchFormDialog
          compiledNode={compiledNode}
          initialParameters={undefined}
          nodeExecutionId={nodeExecution?.id}
          showLaunchForm={showResumeForm}
          setShowLaunchForm={setShowResumeForm}
        />
      )}
    </div>
  );
};

/**
 * Custom component used by ReactFlow.  Renders a label (text)
 * and any edge handles.
 * @param props.data data property of ReactFlowGraphNodeData
 */
export type ReactFlowNodeProps = ReactFlowProps & RFNode;
export const ReactFlowCustomTaskNode = (props: ReactFlowNodeProps) => {
  return (
    <NodeExecutionDynamicProvider node={props.data.node}>
      <ReactFlowCustomTaskNodeInner {...props} />
    </NodeExecutionDynamicProvider>
  );
};
const ReactFlowCustomTaskNodeInner = ({ data }: ReactFlowNodeProps) => {
  const { node, nodeType, taskType, text, scopedId } = data;
  const { setSelectedExecution, setSelectedPhase } = useDetailsPanel();
  const { componentProps } = useNodeExecutionDynamicContext();
  const { nodeExecutionsById } = useNodeExecutionsById();

  const nodeExecution = useMemo(
    () => nodeExecutionsById[node?.scopedId],
    [nodeExecutionsById[node?.scopedId]],
  );

  const { nodeExecutionInfo } = node;
  const mapNodeExecutionStatus = () => {
    if (nodeExecution) {
      return (nodeExecution.closure.phase as NodeExecutionPhase) || NodeExecutionPhase.SKIPPED;
    }
    return NodeExecutionPhase.UNDEFINED;
  };
  const nodeExecutionStatus = nodeExecution?.closure?.phase || mapNodeExecutionStatus();
  const className = getGraphNodeClasses(nodeType, nodeExecutionStatus);

  const nodeExecutionTasksQuery = useWorkflowNodeExecutionTaskExecutionsQuery({
    nodeExecution,
    refetchInterval: nodeExecutionRefreshIntervalMs,
  });

  const externalResources = nodeExecutionTasksQuery?.data
    ?.map((taskExecution) => taskExecution.closure.metadata?.externalResources)
    ?.flat()
    ?.filter((resource): resource is ExternalResource => !!resource);

  const externalResourcesByPhase = getGroupedExternalResources(externalResources);

  // get the cache status for mapped task
  const isMapCache =
    isMapTaskType(nodeExecutionInfo?.taskTemplate?.type) &&
    nodeExecutionInfo?.taskTemplate?.metadata?.cacheSerializable;

  const cacheStatus = isMapCache
    ? CatalogCacheStatus.MAP_CACHE
    : (nodeExecution?.closure.taskNodeMetadata?.cacheStatus as CatalogCacheStatus);

  const selectNode = () => {
    if (nodeExecutionStatus === NodeExecutionPhase.SKIPPED) {
      return;
    }
    setSelectedExecution(nodeExecution?.id as NodeExecutionIdentifier);
  };
  const handleNodeClick: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    selectNode();
  };

  const renderTaskName = () => {
    return (
      <div className="mapTaskBreadcrumb">
        <div
          className={classNames(
            'mapTaskName',
            getNodeExecutionStatusClassName('background', nodeExecutionStatus),
          )}
        >
          {text}
        </div>
      </div>
    );
  };

  const renderTaskPhases = (externalResourcesByPhase: ExternalResourcesByPhase) => {
    return (
      <div className="mapTaskWrapper">
        {RENDER_ORDER.map((phase, id) => {
          if (!externalResourcesByPhase.has(phase)) {
            return null;
          }
          const key = `${id}-${phase}`;
          return (
            <TaskPhaseItem
              numberOfTasks={externalResourcesByPhase?.get?.(phase)?.length || 0}
              phase={phase}
              setSelectedPhase={setSelectedPhase}
              setSelectedNode={selectNode}
              key={key}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div onClick={handleNodeClick} {...componentProps}>
      {externalResourcesByPhase ? renderTaskName() : renderTaskType(taskType)}
      <div className={classNames('mapTask', className)}>
        {externalResourcesByPhase ? renderTaskPhases(externalResourcesByPhase) : text}
        <CacheStatus className="cacheStatus" cacheStatus={cacheStatus} variant="iconOnly" />
      </div>
      {renderDefaultHandles(scopedId)}
    </div>
  );
};

/**
 * Custom component renders subworkflows as indepdenet flow
 * and any edge handles.
 * @param props.data data property of ReactFlowGraphNodeData
 */
export const ReactFlowSubWorkflowContainer = (props: ReactFlowNodeProps) => {
  return (
    <NodeExecutionDynamicProvider node={props.data.node}>
      <ReactFlowSubWorkflowContainerInner {...props} />
    </NodeExecutionDynamicProvider>
  );
};
export const ReactFlowSubWorkflowContainerInner = ({ data }: RFNode) => {
  const { text, scopedId, currentNestedView } = data;

  const { onRemoveNestedView } = useReactFlowBreadCrumbContext();

  const handleRootClick = () => {
    onRemoveNestedView(scopedId, -1);
  };

  const currentNestedDepth = currentNestedView?.length || 0;
  return (
    <>
      <BreadCrumbContainer
        currentNestedDepth={currentNestedDepth}
        text={text}
        handleRootClick={handleRootClick}
      >
        {currentNestedView?.map((nestedView, viewIndex) => {
          return (
            <BreadElement
              nestedView={nestedView}
              index={viewIndex}
              key={nestedView}
              currentNestedDepth={currentNestedDepth}
              scopedId={scopedId}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveNestedView(scopedId, viewIndex);
              }}
            />
          );
        })}
      </BreadCrumbContainer>
      <BorderContainer data={data}>{renderDefaultHandles(scopedId)}</BorderContainer>
    </>
  );
};

/**
 * Custom component renders start node
 * @param props.data data property of ReactFlowGraphNodeData
 */
export const ReactFlowCustomStartNode = ({ data }: RFNode) => {
  const { text, nodeType, scopedId } = data;
  const className = getGraphNodeClasses(nodeType);
  return (
    <>
      <div className={className}>{text}</div>
      {renderStardEndHandles(nodeType, scopedId)}
    </>
  );
};

/**
 * Custom component renders start node
 * @param props.data data property of ReactFlowGraphNodeData
 */
export const ReactFlowCustomEndNode = ({ data }: RFNode) => {
  const { text, nodeType, scopedId } = data;
  const className = getGraphNodeClasses(nodeType);
  return (
    <>
      <div className={className}>{text}</div>
      {renderStardEndHandles(nodeType, scopedId)}
    </>
  );
};
