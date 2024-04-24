import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import ArrowBackIos from '@mui/icons-material/ArrowBackIos';
import Close from '@mui/icons-material/Close';
import classnames from 'classnames';
import { LocationDescriptor } from 'history';
import Skeleton from 'react-loading-skeleton';
import { useQueryClient } from 'react-query';
import { Link as RouterLink } from 'react-router-dom';
import isEqual from 'lodash/isEqual';
import values from 'lodash/values';
import styled from '@mui/system/styled';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import { useCommonStyles } from '../../common/styles';
import { ExecutionStatusBadge } from '../ExecutionStatusBadge';
import { useTabState } from '../../hooks/useTabState';
import { Workflow } from '../../../models/Workflow/types';
import {
  MapTaskExecution,
  NodeExecution,
  NodeExecutionIdentifier,
} from '../../../models/Execution/types';
import { Routes } from '../../../routes/routes';
import { NoDataIsAvailable } from '../../Literals/LiteralMapViewer';
import { fetchWorkflow } from '../../../queries/workflowQueries';
import { PanelSection } from '../../common/PanelSection';
import { ReactJsonViewWrapper } from '../../common/ReactJsonView';
import { dNode } from '../../../models/Graph/types';
import { NodeExecutionPhase, TaskExecutionPhase } from '../../../models/Execution/enums';
import { transformWorkflowToKeyedDag, getNodeNameFromDag } from '../../WorkflowGraph/utils';
import { TaskVersionDetailsLink } from '../../Entities/VersionDetails/VersionDetailsLink';
import { Identifier } from '../../../models/Common/types';
import { extractCompiledNodes } from '../../hooks/utils';
import { NodeExecutionCacheStatus } from '../NodeExecutionCacheStatus';
import { NodeExecutionDetails } from '../types';
import { getTaskExecutionDetailReasons } from './utils';
import { fetchWorkflowExecution } from '../useWorkflowExecution';
import { NodeExecutionTabs } from './NodeExecutionTabs';
import { ExecutionDetailsActions } from './ExecutionDetailsActions';
import { getNodeFrontendPhase, isNodeGateNode } from '../utils';
import { useNodeExecutionsById } from '../contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';
import { useNodeExecutionContext } from '../contextProvider/NodeExecutionDetails/NodeExecutionDetailsContextProvider';
import { useWorkflowNodeExecutionTaskExecutionsQuery } from '../../hooks/useWorkflowNodeExecutionTaskExecutionsQuery';
import { nodeExecutionRefreshIntervalMs } from '../constants';
import { ExpandableMonospaceText } from '../../common/ExpandableMonospaceText';

const NodeTypeLink = styled(RouterLink)(() => ({
  fontWeight: 'normal',
}));

const StyledContent = styled('div')(() => ({
  overflowY: 'auto',
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
})) as typeof Tabs;

const CloseButton = styled(IconButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));

const NodeTypeContainer = styled('div')(({ theme }) => ({
  alignItems: 'flex-end',
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'row',
  fontWeight: 'bold',
  justifyContent: 'space-between',
  marginTop: theme.spacing(2),
  paddingTop: theme.spacing(2),
  '& .nodeTypeContent': {
    minWidth: theme.spacing(9),
  },
}));

const StyledContainer = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  paddingTop: theme.spacing(2),
  width: '100%',
  '& .header': {
    borderBottom: `${theme.spacing(1)} solid ${theme.palette.divider}`,
  },
  '& .headerContent': {
    padding: `0 ${theme.spacing(3)} ${theme.spacing(2)} ${theme.spacing(3)}`,
  },
  '& .displayId': {
    marginBottom: theme.spacing(1),
  },
}));

const StatusContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  '& .statusHeaderContainer': {
    display: 'flex',
    alignItems: 'center',
  },
  '& .reasonsIcon': {
    marginLeft: theme.spacing(1),
    cursor: 'pointer',
  },
  '& .statusBody': {
    marginTop: theme.spacing(2),
  },
}));

const NotRunStatus = styled('div')(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: 'gray',
  borderRadius: '4px',
  color: theme.palette.text.primary,
  display: 'flex',
  flex: '0 0 auto',
  height: theme.spacing(3),
  fontSize: CommonStylesConstants.smallFontSize,
  justifyContent: 'center',
  textTransform: 'uppercase',
  width: theme.spacing(11),
  fontFamily: CommonStylesConstants.bodyFontFamily,
  fontWeight: 'bold',
}));

const tabIds = {
  executions: 'executions',
  inputs: 'inputs',
  outputs: 'outputs',
  task: 'task',
};

export interface LocationState {
  backLink?: string;
}

interface NodeExecutionDetailsProps {
  nodeExecutionId: NodeExecutionIdentifier;
  taskPhase: TaskExecutionPhase;
  onClose?: () => void;
}

const NodeExecutionLinkContent: React.FC<{
  execution: NodeExecution;
}> = ({ execution }) => {
  const commonStyles = useCommonStyles();

  const { workflowNodeMetadata } = execution.closure;

  if (!workflowNodeMetadata) {
    return null;
  }
  const linkTarget: LocationDescriptor<LocationState> = {
    pathname: Routes.ExecutionDetails.makeUrl(workflowNodeMetadata.executionId),
    state: {
      backLink: Routes.ExecutionDetails.makeUrl(execution.id.executionId),
    },
  };
  return (
    <NodeTypeLink className={classnames(commonStyles.primaryLinks)} to={linkTarget}>
      View Sub-Workflow
    </NodeTypeLink>
  );
};

const ExecutionTypeDetails: React.FC<{
  details?: NodeExecutionDetails;
  execution: NodeExecution;
}> = ({ details, execution }) => {
  const commonStyles = useCommonStyles();
  return (
    <NodeTypeContainer className={classnames(commonStyles.textSmall)}>
      <div className="nodeTypeContent">
        <div className={classnames(commonStyles.microHeader, commonStyles.textMuted)}>Type</div>
        <div>{details ? details.displayType : <Skeleton />}</div>
      </div>
      <NodeExecutionLinkContent execution={execution} />
    </NodeTypeContainer>
  );
};

const QUERY_PARAM_TAB = 'wtab';
// TODO FC#393: Check if it could be replaced with tabsContent or simplified further.
// Check if we need to request task info instead of relying on dag
// Also check strange setDag pattern
const WorkflowTabs: React.FC<{
  dagData: Record<string, dNode>;
  nodeId: string;
}> = ({ dagData, nodeId }) => {
  const { value, onChange } = useTabState(tabIds.inputs, QUERY_PARAM_TAB);

  let tabContent: JSX.Element | null = null;
  const id = nodeId.slice(nodeId.lastIndexOf('-') + 1);
  const taskTemplate = dagData[id]?.nodeExecutionInfo?.taskTemplate;
  // eslint-disable-next-line default-case
  switch (value) {
    case tabIds.task: {
      tabContent = taskTemplate ? (
        <PanelSection>
          <TaskVersionDetailsLink id={taskTemplate.id as Identifier} />
          <ReactJsonViewWrapper src={taskTemplate} />
        </PanelSection>
      ) : null;
      break;
    }
    case tabIds.inputs:
    default: {
      tabContent = taskTemplate ? (
        <PanelSection>
          <NoDataIsAvailable />
        </PanelSection>
      ) : null;
      break;
    }
  }
  return (
    <>
      <StyledTabs value={value} onChange={onChange}>
        <Tab value={tabIds.inputs} label="Inputs" />
        {!!taskTemplate && <Tab value={tabIds.task} label="Task" />}
      </StyledTabs>
      <StyledContent>{tabContent}</StyledContent>
    </>
  );
};

interface NodeExecutionStatusProps {
  nodeExecution?: NodeExecution;
  frontendPhase: NodeExecutionPhase;
}

const NodeExecutionStatus: FC<NodeExecutionStatusProps> = ({ nodeExecution, frontendPhase }) => {
  const nodeExecutionTasksQuery = useWorkflowNodeExecutionTaskExecutionsQuery({
    nodeExecution,
    refetchInterval: nodeExecutionRefreshIntervalMs,
  });

  const reasons = useMemo(
    () => getTaskExecutionDetailReasons(nodeExecutionTasksQuery.data ?? []),
    [nodeExecutionTasksQuery.data],
  );

  return nodeExecution ? (
    <StatusContainer>
      <div className="statusHeaderContainer">
        <ExecutionStatusBadge phase={frontendPhase} type="node" />
      </div>
      {reasons?.length ? (
        <div className="statusBody">
          <ExpandableMonospaceText text={reasons.join('\n\n')} />
        </div>
      ) : null}
    </StatusContainer>
  ) : (
    <NotRunStatus>NOT RUN</NotRunStatus>
  );
};

/** DetailsPanel content which renders execution information about a given NodeExecution
 */
export const NodeExecutionDetailsPanelContent: React.FC<NodeExecutionDetailsProps> = ({
  nodeExecutionId,
  taskPhase,
  onClose,
}) => {
  const commonStyles = useCommonStyles();
  const queryClient = useQueryClient();

  const { nodeExecutionsById } = useNodeExecutionsById();

  const nodeExecution = useMemo(() => {
    const finalExecution = values(nodeExecutionsById).find((node) =>
      isEqual(node.id, nodeExecutionId),
    );

    return finalExecution;
  }, [nodeExecutionId, nodeExecutionsById]);

  const [dag, setDag] = useState<any>(null);
  const [nodeExecutionDetails, setNodeExecutionDetails] = useState<NodeExecutionDetails>();
  const [selectedTaskExecution, setSelectedTaskExecution] = useState<MapTaskExecution>();

  const { getNodeExecutionDetails, compiledWorkflowClosure } = useNodeExecutionContext();

  const isGateNode = isNodeGateNode(
    extractCompiledNodes(compiledWorkflowClosure),
    nodeExecutionsById[nodeExecutionId.nodeId]?.metadata?.specNodeId || nodeExecutionId.nodeId,
  );

  const [nodeExecutionLoading, setNodeExecutionLoading] = useState<boolean>(false);

  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      setNodeExecutionDetails(undefined);
      isMounted.current = false;
    };
  }, []);

  // TODO: needs to be removed
  useEffect(() => {
    let isCurrent = true;
    getNodeExecutionDetails(nodeExecution).then((res) => {
      if (isCurrent) {
        setNodeExecutionDetails(res);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [nodeExecution]);

  useEffect(() => {
    setSelectedTaskExecution(undefined);
  }, [nodeExecutionId, taskPhase]);

  // TODO: needs to be removed
  const getWorkflowDag = async () => {
    const workflowExecution = await fetchWorkflowExecution(
      queryClient,
      nodeExecutionId.executionId,
    );
    const workflowData: Workflow = await fetchWorkflow(
      queryClient,
      workflowExecution.closure.workflowId,
    );
    if (workflowData) {
      const keyedDag = transformWorkflowToKeyedDag(workflowData);
      if (isMounted.current) setDag(keyedDag);
    }
  };

  if (!nodeExecution) {
    getWorkflowDag();
  } else if (dag) setDag(null);

  const onBackClick = () => {
    setSelectedTaskExecution(undefined);
  };

  const headerTitle = useMemo(() => {
    const mapTaskHeader = `${selectedTaskExecution?.taskIndex} of ${nodeExecutionId.nodeId}`;
    const header = selectedTaskExecution ? mapTaskHeader : nodeExecutionId.nodeId;

    return (
      <Typography
        className={classnames(commonStyles.textWrapped)}
        variant="h3"
        sx={{ alignItems: 'flex-start', display: 'flex', justifyContent: 'space-between' }}
      >
        <div>
          {!!selectedTaskExecution && (
            <IconButton onClick={onBackClick} size="small">
              <ArrowBackIos />
            </IconButton>
          )}
          {header}
        </div>
        <CloseButton onClick={onClose} size="small">
          <Close />
        </CloseButton>
      </Typography>
    );
  }, [nodeExecutionId, selectedTaskExecution]);

  const frontendPhase = useMemo(() => {
    const computedPhase = getNodeFrontendPhase(
      nodeExecution?.closure.phase ?? NodeExecutionPhase.UNDEFINED,
      isGateNode,
    );
    return computedPhase;
  }, [nodeExecution, isGateNode]);

  let detailsContent: JSX.Element | null = null;
  if (nodeExecution) {
    detailsContent = (
      <>
        <NodeExecutionCacheStatus
          execution={nodeExecution}
          selectedTaskExecution={selectedTaskExecution}
        />
        <ExecutionTypeDetails details={nodeExecutionDetails} execution={nodeExecution} />
      </>
    );
  }

  const emptyName = isGateNode ? <></> : <Skeleton />;
  const displayName = nodeExecutionDetails?.displayName ?? emptyName;

  return (
    <StyledContainer>
      <header className="header">
        <div className="headerContent">
          {headerTitle}
          <Typography
            className={classnames(commonStyles.textWrapped, 'displayId')}
            variant="subtitle1"
            color="textSecondary"
          >
            {dag ? getNodeNameFromDag(dag, nodeExecutionId.nodeId) : displayName}
          </Typography>
          <NodeExecutionStatus nodeExecution={nodeExecution!} frontendPhase={frontendPhase} />
          {!dag && detailsContent}
          {nodeExecution?.scopedId === nodeExecutionDetails?.scopedId ? (
            <ExecutionDetailsActions
              nodeExecutionDetails={nodeExecutionDetails}
              nodeExecution={nodeExecution!}
              phase={frontendPhase}
            />
          ) : null}
        </div>
      </header>
      {!nodeExecutionLoading && dag ? (
        <WorkflowTabs nodeId={nodeExecutionId.nodeId} dagData={dag} />
      ) : nodeExecution ? (
        <NodeExecutionTabs
          nodeExecution={nodeExecution}
          selectedTaskExecution={selectedTaskExecution}
          phase={taskPhase}
          taskTemplate={nodeExecutionDetails?.taskTemplate}
          onTaskSelected={setSelectedTaskExecution}
          taskIndex={selectedTaskExecution?.taskIndex!}
        />
      ) : null}
    </StyledContainer>
  );
};
