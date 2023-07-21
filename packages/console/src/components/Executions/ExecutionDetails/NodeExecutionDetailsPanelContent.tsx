import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IconButton, Typography, Tab, Tabs } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { ArrowBackIos, Close } from '@material-ui/icons';
import classnames from 'classnames';
import { useCommonStyles } from 'components/common/styles';
import { InfoIcon } from 'components/common/Icons/InfoIcon';
import { bodyFontFamily, smallFontSize } from 'components/Theme/constants';
import { ExecutionStatusBadge } from 'components/Executions/ExecutionStatusBadge';
import { LocationState } from 'components/hooks/useLocationState';
import { useTabState } from 'components/hooks/useTabState';
import { LocationDescriptor } from 'history';
import { Workflow } from 'models/Workflow/types';
import {
  MapTaskExecution,
  NodeExecution,
  NodeExecutionIdentifier,
} from 'models/Execution/types';
import Skeleton from 'react-loading-skeleton';
import { useQueryClient } from 'react-query';
import { Link as RouterLink } from 'react-router-dom';
import { Routes } from 'routes/routes';
import { NoDataIsAvailable } from 'components/Literals/LiteralMapViewer';
import { fetchWorkflow } from 'components/Workflow/workflowQueries';
import { PanelSection } from 'components/common/PanelSection';
import { DumpJSON } from 'components/common/DumpJSON';
import { ScrollableMonospaceText } from 'components/common/ScrollableMonospaceText';
import { dNode } from 'models/Graph/types';
import { NodeExecutionPhase, TaskExecutionPhase } from 'models/Execution/enums';
import {
  transformWorkflowToKeyedDag,
  getNodeNameFromDag,
} from 'components/WorkflowGraph/utils';
import { TaskVersionDetailsLink } from 'components/Entities/VersionDetails/VersionDetailsLink';
import { Identifier } from 'models/Common/types';
import { isEqual, values } from 'lodash';
import { extractCompiledNodes } from 'components/hooks/utils';
import { NodeExecutionCacheStatus } from '../NodeExecutionCacheStatus';
import { getTaskExecutions } from '../nodeExecutionQueries';
import { NodeExecutionDetails } from '../types';
import {
  useNodeExecutionContext,
  useNodeExecutionsById,
} from '../contextProvider/NodeExecutionDetails';
import { getTaskExecutionDetailReasons } from './utils';
import { fetchWorkflowExecution } from '../useWorkflowExecution';
import { NodeExecutionTabs } from './NodeExecutionTabs';
import { ExecutionDetailsActions } from './ExecutionDetailsActions';
import { getNodeFrontendPhase, isNodeGateNode } from '../utils';
import { WorkflowNodeExecution } from '../contexts';

const useStyles = makeStyles((theme: Theme) => {
  const paddingVertical = `${theme.spacing(2)}px`;
  const paddingHorizontal = `${theme.spacing(3)}px`;
  return {
    notRunStatus: {
      alignItems: 'center',
      backgroundColor: 'gray',
      borderRadius: '4px',
      color: theme.palette.text.primary,
      display: 'flex',
      flex: '0 0 auto',
      height: theme.spacing(3),
      fontSize: smallFontSize,
      justifyContent: 'center',
      textTransform: 'uppercase',
      width: theme.spacing(11),
      fontFamily: bodyFontFamily,
      fontWeight: 'bold',
    },
    closeButton: {
      marginLeft: theme.spacing(1),
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      paddingTop: theme.spacing(2),
      width: '100%',
    },
    content: {
      overflowY: 'auto',
    },
    displayId: {
      marginBottom: theme.spacing(1),
    },
    header: {
      borderBottom: `${theme.spacing(1)}px solid ${theme.palette.divider}`,
    },
    headerContent: {
      padding: `0 ${paddingHorizontal} ${paddingVertical} ${paddingHorizontal}`,
    },
    nodeTypeContainer: {
      alignItems: 'flex-end',
      borderTop: `1px solid ${theme.palette.divider}`,
      display: 'flex',
      flexDirection: 'row',
      fontWeight: 'bold',
      justifyContent: 'space-between',
      marginTop: theme.spacing(2),
      paddingTop: theme.spacing(2),
    },
    actionsContainer: {
      borderTop: `1px solid ${theme.palette.divider}`,
      marginTop: theme.spacing(2),
      paddingTop: theme.spacing(2),
    },
    nodeTypeContent: {
      minWidth: theme.spacing(9),
    },
    nodeTypeLink: {
      fontWeight: 'normal',
    },
    tabs: {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    title: {
      alignItems: 'flex-start',
      display: 'flex',
      justifyContent: 'space-between',
    },
    statusContainer: {
      display: 'flex',
      flexDirection: 'column',
    },
    statusHeaderContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    reasonsIcon: {
      marginLeft: theme.spacing(1),
      cursor: 'pointer',
    },
    statusBody: {
      marginTop: theme.spacing(2),
    },
  };
});

const tabIds = {
  executions: 'executions',
  inputs: 'inputs',
  outputs: 'outputs',
  task: 'task',
};

interface NodeExecutionDetailsProps {
  nodeExecutionId: NodeExecutionIdentifier;
  taskPhase: TaskExecutionPhase;
  onClose?: () => void;
}

const NodeExecutionLinkContent: React.FC<{
  execution: NodeExecution;
}> = ({ execution }) => {
  const commonStyles = useCommonStyles();
  const styles = useStyles();
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
    <RouterLink
      className={classnames(commonStyles.primaryLink, styles.nodeTypeLink)}
      to={linkTarget}
    >
      View Sub-Workflow
    </RouterLink>
  );
};

const ExecutionTypeDetails: React.FC<{
  details?: NodeExecutionDetails;
  execution: NodeExecution;
}> = ({ details, execution }) => {
  const styles = useStyles();
  const commonStyles = useCommonStyles();
  return (
    <div
      className={classnames(commonStyles.textSmall, styles.nodeTypeContainer)}
    >
      <div className={styles.nodeTypeContent}>
        <div
          className={classnames(
            commonStyles.microHeader,
            commonStyles.textMuted,
          )}
        >
          Type
        </div>
        <div>{details ? details.displayType : <Skeleton />}</div>
      </div>
      <NodeExecutionLinkContent execution={execution} />
    </div>
  );
};

// TODO FC#393: Check if it could be replaced with tabsContent or simplified further.
// Check if we need to request task info instead of relying on dag
// Also check strange setDag pattern
const WorkflowTabs: React.FC<{
  dagData: dNode;
  nodeId: string;
}> = ({ dagData, nodeId }) => {
  const styles = useStyles();
  const tabState = useTabState(tabIds, tabIds.inputs);

  let tabContent: JSX.Element | null = null;
  const id = nodeId.slice(nodeId.lastIndexOf('-') + 1);
  const taskTemplate = dagData[id]?.value.template;
  switch (tabState.value) {
    case tabIds.inputs: {
      tabContent = taskTemplate ? (
        <PanelSection>
          <NoDataIsAvailable />
        </PanelSection>
      ) : null;
      break;
    }
    case tabIds.task: {
      tabContent = taskTemplate ? (
        <PanelSection>
          <TaskVersionDetailsLink id={taskTemplate.id as Identifier} />
          <DumpJSON value={taskTemplate} />
        </PanelSection>
      ) : null;
      break;
    }
  }
  return (
    <>
      <Tabs {...tabState} className={styles.tabs}>
        <Tab value={tabIds.inputs} label="Inputs" />
        {!!taskTemplate && <Tab value={tabIds.task} label="Task" />}
      </Tabs>
      <div className={styles.content}>{tabContent}</div>
    </>
  );
};

/** DetailsPanel content which renders execution information about a given NodeExecution
 */
export const NodeExecutionDetailsPanelContent: React.FC<
  NodeExecutionDetailsProps
> = ({ nodeExecutionId, taskPhase, onClose }) => {
  const commonStyles = useCommonStyles();
  const styles = useStyles();
  const queryClient = useQueryClient();

  const { nodeExecutionsById, setCurrentNodeExecutionsById } =
    useNodeExecutionsById();

  const nodeExecution = useMemo(() => {
    return values(nodeExecutionsById).find(node =>
      isEqual(node.id, nodeExecutionId),
    );
  }, [nodeExecutionId, nodeExecutionsById]);

  const [isReasonsVisible, setReasonsVisible] = useState<boolean>(false);
  const [dag, setDag] = useState<any>(null);
  const [details, setDetails] = useState<NodeExecutionDetails | undefined>();
  const [selectedTaskExecution, setSelectedTaskExecution] =
    useState<MapTaskExecution>();

  const { getNodeExecutionDetails, compiledWorkflowClosure } =
    useNodeExecutionContext();

  const isGateNode = isNodeGateNode(
    extractCompiledNodes(compiledWorkflowClosure),
    nodeExecutionsById[nodeExecutionId.nodeId]?.metadata?.specNodeId ||
      nodeExecutionId.nodeId,
  );

  const [nodeExecutionLoading, setNodeExecutionLoading] =
    useState<boolean>(false);

  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;
    getNodeExecutionDetails(nodeExecution).then(res => {
      if (isCurrent) {
        setDetails(res);
      }
    });

    return () => {
      isCurrent = false;
    };
  });

  useEffect(() => {
    let isCurrent = true;

    async function fetchTasksData(queryClient) {
      setNodeExecutionLoading(true);
      const newNode = await getTaskExecutions(queryClient, nodeExecution!);

      if (isCurrent && newNode) {
        const {
          closure: _,
          metadata: __,
          ...parentLight
        } = newNode || ({} as WorkflowNodeExecution);

        setCurrentNodeExecutionsById({
          [newNode.scopedId!]: parentLight as WorkflowNodeExecution,
        });
        setNodeExecutionLoading(false);
      }
    }

    if (nodeExecution && !nodeExecution?.tasksFetched) {
      fetchTasksData(queryClient);
    } else {
      if (isCurrent) {
        setNodeExecutionLoading(false);
      }
    }
    return () => {
      isCurrent = false;
    };
  }, [nodeExecution]);

  useEffect(() => {
    setReasonsVisible(false);
  }, [nodeExecutionId]);

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
  } else {
    if (dag) setDag(null);
  }

  const reasons = getTaskExecutionDetailReasons(
    nodeExecution?.taskExecutions ?? [],
  );

  const onBackClick = () => {
    setSelectedTaskExecution(undefined);
  };

  const headerTitle = useMemo(() => {
    const mapTaskHeader = `${selectedTaskExecution?.taskIndex} of ${nodeExecutionId.nodeId}`;
    const header = selectedTaskExecution
      ? mapTaskHeader
      : nodeExecutionId.nodeId;

    return (
      <Typography
        className={classnames(commonStyles.textWrapped, styles.title)}
        variant="h3"
      >
        <div>
          {!!selectedTaskExecution && (
            <IconButton onClick={onBackClick} size="small">
              <ArrowBackIos />
            </IconButton>
          )}
          {header}
        </div>
        <IconButton
          className={styles.closeButton}
          onClick={onClose}
          size="small"
        >
          <Close />
        </IconButton>
      </Typography>
    );
  }, [nodeExecutionId, selectedTaskExecution]);

  const frontendPhase = useMemo(() => {
    const computedPhase = getNodeFrontendPhase(
      nodeExecution?.closure.phase ?? NodeExecutionPhase.UNDEFINED,
      isGateNode,
    );
    return computedPhase;
  }, [nodeExecution?.closure.phase, isGateNode]);

  const isRunningPhase = useMemo(
    () =>
      frontendPhase === NodeExecutionPhase.QUEUED ||
      frontendPhase === NodeExecutionPhase.RUNNING,
    [frontendPhase],
  );

  const handleReasonsVisibility = () => {
    setReasonsVisible(!isReasonsVisible);
  };

  const statusContent = nodeExecution ? (
    <div className={styles.statusContainer}>
      <div className={styles.statusHeaderContainer}>
        <ExecutionStatusBadge phase={frontendPhase} type="node" />
        {isRunningPhase && (
          <InfoIcon
            className={styles.reasonsIcon}
            onClick={handleReasonsVisibility}
          />
        )}
      </div>
      {isRunningPhase && isReasonsVisible && (
        <div className={styles.statusBody}>
          <ScrollableMonospaceText text={reasons.join('\n\n')} />
        </div>
      )}
    </div>
  ) : (
    <div className={styles.notRunStatus}>NOT RUN</div>
  );

  let detailsContent: JSX.Element | null = null;
  if (nodeExecution) {
    detailsContent = (
      <>
        <NodeExecutionCacheStatus
          execution={nodeExecution}
          selectedTaskExecution={selectedTaskExecution}
        />
        <ExecutionTypeDetails details={details} execution={nodeExecution} />
      </>
    );
  }

  const tabsContent: JSX.Element | null = nodeExecution ? (
    <NodeExecutionTabs
      nodeExecution={nodeExecution}
      selectedTaskExecution={selectedTaskExecution}
      phase={taskPhase}
      taskTemplate={details?.taskTemplate}
      onTaskSelected={setSelectedTaskExecution}
      taskIndex={selectedTaskExecution?.taskIndex!}
    />
  ) : null;

  const emptyName = isGateNode ? <></> : <Skeleton />;
  const displayName = details?.displayName ?? emptyName;

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {headerTitle}
          <Typography
            className={classnames(commonStyles.textWrapped, styles.displayId)}
            variant="subtitle1"
            color="textSecondary"
          >
            {dag
              ? getNodeNameFromDag(dag, nodeExecutionId.nodeId)
              : displayName}
          </Typography>
          {statusContent}
          {!dag && detailsContent}
          <ExecutionDetailsActions
            details={details}
            nodeExecutionId={nodeExecutionId}
            phase={frontendPhase}
          />
        </div>
      </header>
      {!nodeExecutionLoading && dag ? (
        <WorkflowTabs nodeId={nodeExecutionId.nodeId} dagData={dag} />
      ) : (
        tabsContent
      )}
    </section>
  );
};
