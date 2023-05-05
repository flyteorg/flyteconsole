import React, { useState, useEffect } from 'react';
import { Handle, Position, ReactFlowProps } from 'react-flow-renderer';
import { dTypes } from 'models/Graph/types';
import { NodeExecutionPhase, TaskExecutionPhase } from 'models/Execution/enums';
import { RENDER_ORDER } from 'components/Executions/TaskExecutionsList/constants';
import { whiteColor } from 'components/Theme/constants';
import { PlayCircleOutline } from '@material-ui/icons';
import { Tooltip } from '@material-ui/core';
import { getNodeFrontendPhase } from 'components/Executions/utils';
import { CacheStatus } from 'components/Executions/CacheStatus';
import { LaunchFormDialog } from 'components/Launch/LaunchForm/LaunchFormDialog';
import { useNodeExecutionContext } from 'components/Executions/contextProvider/NodeExecutionDetails';
import { extractCompiledNodes } from 'components/hooks/utils';
import {
  NodeExecutionDynamicProvider,
  useNodeExecutionDynamicContext,
} from 'components/Executions/contextProvider/NodeExecutionDetails/NodeExecutionDynamicProvider';
import {
  COLOR_GRAPH_BACKGROUND,
  getGraphHandleStyle,
  getGraphNodeStyle,
  getStatusColor,
} from './utils';
import { RFHandleProps, RFNode } from './types';
import t from './strings';
import {
  BorderContainer,
  BreadCrumbContainer,
  BreadElement,
} from './BreadCrumb';
import { useReactFlowBreadCrumbContext } from './ReactFlowBreadCrumbProvider';

const taskContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-.55rem',
  zIndex: 0,
  right: '.15rem',
};

const taskTypeStyle: React.CSSProperties = {
  backgroundColor: COLOR_GRAPH_BACKGROUND,
  color: 'white',
  padding: '.1rem .2rem',
  fontSize: '.3rem',
};

const renderTaskType = (taskType: dTypes | undefined) => {
  if (!taskType) {
    return null;
  }
  return (
    <div style={taskContainerStyle}>
      <div style={taskTypeStyle}>{taskType}</div>
    </div>
  );
};

const renderBasicNode = (
  taskType: dTypes | undefined,
  text: string,
  scopedId: string,
  styles: React.CSSProperties,
  onClick?: () => void,
  componentProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >,
) => {
  return (
    <div onClick={onClick} {...(componentProps || {})}>
      {renderTaskType(taskType)}
      <div style={styles}>{text}</div>
      {renderDefaultHandles(
        scopedId,
        getGraphHandleStyle('source'),
        getGraphHandleStyle('target'),
      )}
    </div>
  );
};

export const renderDefaultHandles = (
  id: string,
  sourceStyle: any,
  targetStyle: any,
) => {
  const leftHandleProps: RFHandleProps = {
    id: `edge-left-${id}`,
    type: 'target',
    position: Position.Left,
    style: targetStyle,
  };

  const rightHandleProps: RFHandleProps = {
    id: `edge-right-${id}`,
    type: 'source',
    position: Position.Right,
    style: sourceStyle,
  };
  return (
    <>
      <Handle {...leftHandleProps} />
      <Handle {...rightHandleProps} />
    </>
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
  const style =
    nodeType === dTypes.nestedStart || nodeType === dTypes.nestedEnd
      ? getGraphHandleStyle(type, dTypes.nestedMaxDepth)
      : getGraphHandleStyle(type);

  const handleProps: RFHandleProps = {
    id: `rf-handle-${idPrefix}-${scopedId}`,
    type: type,
    position: position,
    style: style,
  };

  return <Handle {...handleProps} />;
};

/**
 * Styles start/end nodes as a point; used for nested workflows
 * @param props.data data property of ReactFlowGraphNodeData
 */
export const ReactFlowCustomNestedPoint = ({ data }: RFNode) => {
  const { nodeType, scopedId } = data;
  const containerStyle = getGraphNodeStyle(nodeType);
  return (
    <>
      <div style={containerStyle} />
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
  const { text, taskType, scopedId, isParentNode, parentScopedId, node } = data;
  const styles = getGraphNodeStyle(dTypes.nestedMaxDepth);
  const { onAddNestedView } = useReactFlowBreadCrumbContext();
  const { componentProps } = useNodeExecutionDynamicContext();

  return renderBasicNode(
    taskType,
    text,
    scopedId,
    styles,
    () => {
      onAddNestedView(
        {
          parent: isParentNode ? parentScopedId : scopedId,
          view: scopedId,
        },
        node,
      );
    },
    componentProps,
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
  const styles = getGraphNodeStyle(dTypes.staticNestedNode);
  return renderBasicNode(taskType, text, scopedId, styles);
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
  const styles = getGraphNodeStyle(dTypes.staticNode);
  return renderBasicNode(taskType, text, scopedId, styles);
};

/**
 * Component that renders a map task item within the mapped node.
 * @param props.numberOfTasks number of tasks of certain completion phase
 * @param props.color string value of color of the block
 * @param props.phase phase of the current map task item
 * @param props.onPhaseSelectionChanged callback from the parent component
 */

interface TaskPhaseItemProps {
  numberOfTasks: number;
  color: string;
  phase: TaskExecutionPhase;
  setSelectedPhase: (phase: TaskExecutionPhase) => void;
  setSelectedNode: (val: boolean) => void;
}

const TaskPhaseItem = ({
  numberOfTasks,
  color,
  phase,
  setSelectedPhase,
  setSelectedNode,
}: TaskPhaseItemProps) => {
  const taskPhaseStyles: React.CSSProperties = {
    borderRadius: '2px',
    backgroundColor: color,
    color: whiteColor,
    margin: '0 1px',
    padding: '0 2px',
    fontSize: '8px',
    lineHeight: '14px',
    minWidth: '14px',
    textAlign: 'center',
    cursor: 'pointer',
  };

  const handleMapTaskClick = e => {
    e.stopPropagation();
    setSelectedNode(true);
    setSelectedPhase(phase);
  };

  return (
    <div style={taskPhaseStyles} onClick={handleMapTaskClick}>
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
  const { compiledWorkflowClosure } = useNodeExecutionContext();
  const {
    node,
    nodeType,
    nodeExecutionStatus,
    text,
    scopedId,
    onNodeSelectionChanged,
  } = data;
  const { componentProps } = useNodeExecutionDynamicContext();
  const nodeExecution = node.execution;
  const phase = getNodeFrontendPhase(
    nodeExecution?.closure?.phase || nodeExecutionStatus,
    true,
  );
  const styles = getGraphNodeStyle(nodeType, phase);
  const [showResumeForm, setShowResumeForm] = useState<boolean>(false);

  const compiledNode = extractCompiledNodes(compiledWorkflowClosure).find(
    node =>
      node.id === nodeExecution?.metadata?.specNodeId ||
      node.id === nodeExecution?.id?.nodeId,
  );

  const iconStyles: React.CSSProperties = {
    width: '10px',
    height: '10px',
    marginLeft: '4px',
    marginTop: '1px',
    color: COLOR_GRAPH_BACKGROUND,
    cursor: 'pointer',
  };

  const handleNodeClick = e => {
    e.stopPropagation();
    onNodeSelectionChanged(true);
  };

  const onResumeClick = e => {
    e.stopPropagation();
    setShowResumeForm(true);
  };

  return (
    <div onClick={handleNodeClick} {...componentProps}>
      <div style={styles}>
        {text}
        {phase === NodeExecutionPhase.PAUSED && (
          <Tooltip title={t('resumeTooltip')}>
            <PlayCircleOutline onClick={onResumeClick} style={iconStyles} />
          </Tooltip>
        )}
      </div>
      {renderDefaultHandles(
        scopedId,
        getGraphHandleStyle('source'),
        getGraphHandleStyle('target'),
      )}
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
const ReactFlowCustomTaskNodeInner = (props: ReactFlowNodeProps) => {
  const { data } = props;
  const {
    node,
    nodeType,
    nodeExecutionStatus: initialNodeExecutionStatus,
    selectedPhase: initialPhase,
    taskType,
    text,
    nodeLogsByPhase,
    cacheStatus,
    scopedId,
    onNodeSelectionChanged,
    onPhaseSelectionChanged,
  } = data;

  const [selectedNode, setSelectedNode] = useState<boolean>(false);
  const [selectedPhase, setSelectedPhase] = useState<
    TaskExecutionPhase | undefined
  >(initialPhase);
  const { componentProps } = useNodeExecutionDynamicContext();
  const nodeExecution = node.execution;
  const nodeExecutionStatus =
    nodeExecution?.closure?.phase || initialNodeExecutionStatus;
  const styles = getGraphNodeStyle(nodeType, nodeExecutionStatus);

  useEffect(() => {
    // if the node execution isn't there
    // (like in the case of a dynamic flow when the node execution isn't available yet)
    // bringing up the context pane will result in an infinite loop
    // checking if the node execution is present prevents that from happening
    if (selectedNode === true && nodeExecution) {
      onNodeSelectionChanged(selectedNode);
      setSelectedNode(false);
      onPhaseSelectionChanged(selectedPhase);
      setSelectedPhase(selectedPhase);
    }
  }, [selectedNode, selectedPhase]);

  const mapTaskContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-.82rem',
    zIndex: 0,
    right: '.15rem',
  };
  const taskNameStyle: React.CSSProperties = {
    backgroundColor: getStatusColor(nodeExecutionStatus),
    color: 'white',
    padding: '.1rem .2rem',
    fontSize: '.4rem',
    borderRadius: '.15rem',
  };

  const cacheIconStyles: React.CSSProperties = {
    width: '8px',
    height: '8px',
    marginLeft: '4px',
    marginTop: '1px',
    color: COLOR_GRAPH_BACKGROUND,
  };
  const mapTaskWrapper: React.CSSProperties = {
    display: 'flex',
  };

  const handleNodeClick = e => {
    e.stopPropagation();

    if (nodeExecutionStatus === NodeExecutionPhase.SKIPPED) {
      return;
    }
    setSelectedNode(true);
    setSelectedPhase(undefined);
  };

  const renderTaskName = () => {
    return (
      <div style={mapTaskContainerStyle}>
        <div style={taskNameStyle}>{text}</div>
      </div>
    );
  };

  const renderTaskPhases = logsByPhase => {
    return (
      <div style={mapTaskWrapper}>
        {RENDER_ORDER.map((phase, id) => {
          if (!logsByPhase.has(phase)) {
            return null;
          }
          const defaultColor = getStatusColor();
          const phaseColor = getStatusColor(phase);
          const color =
            !selectedPhase || phase === selectedPhase
              ? phaseColor
              : defaultColor;
          const key = `${id}-${phase}`;
          return (
            <TaskPhaseItem
              numberOfTasks={logsByPhase.get(phase).length}
              color={color}
              phase={phase}
              setSelectedPhase={setSelectedPhase}
              setSelectedNode={setSelectedNode}
              key={key}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div onClick={handleNodeClick} {...componentProps}>
      {nodeLogsByPhase ? renderTaskName() : renderTaskType(taskType)}
      <div style={styles}>
        {nodeLogsByPhase ? renderTaskPhases(nodeLogsByPhase) : text}
        <CacheStatus
          cacheStatus={cacheStatus}
          variant="iconOnly"
          iconStyles={cacheIconStyles}
        />
      </div>
      {renderDefaultHandles(
        scopedId,
        getGraphHandleStyle('source'),
        getGraphHandleStyle('target'),
      )}
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
    <NodeExecutionDynamicProvider
      node={props.data.node}
      overrideInViewValue={true}
    >
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
              onClick={e => {
                e.stopPropagation();
                onRemoveNestedView(scopedId, viewIndex);
              }}
            />
          );
        })}
      </BreadCrumbContainer>
      <BorderContainer data={data}>
        {renderDefaultHandles(
          scopedId,
          getGraphHandleStyle('source'),
          getGraphHandleStyle('target'),
        )}
      </BorderContainer>
    </>
  );
};

/**
 * Custom component renders start node
 * @param props.data data property of ReactFlowGraphNodeData
 */
export const ReactFlowCustomStartNode = ({ data }: RFNode) => {
  const { text, nodeType, scopedId } = data;
  const styles = getGraphNodeStyle(nodeType);
  return (
    <>
      <div style={styles}>{text}</div>
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
  const styles = getGraphNodeStyle(nodeType);
  return (
    <>
      <div style={styles}>{text}</div>
      {renderStardEndHandles(nodeType, scopedId)}
    </>
  );
};
