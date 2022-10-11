import { makeStyles } from '@material-ui/core';
import { DetailsPanel } from 'components/common/DetailsPanel';
import { makeNodeExecutionDynamicWorkflowQuery } from 'components/Workflow/workflowQueries';
import { WorkflowGraph } from 'components/WorkflowGraph/WorkflowGraph';
import { TaskExecutionPhase } from 'models/Execution/enums';
import { NodeExecutionIdentifier } from 'models/Execution/types';
import { startNodeId, endNodeId } from 'models/Node/constants';
import * as React from 'react';
import { transformerWorkflowToDag } from 'components/WorkflowGraph/transformerWorkflowToDag';
import { checkForDynamicExecutions } from 'components/common/utils';
import { dNode } from 'models/Graph/types';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { useNodeExecutionContext } from '../contextProvider/NodeExecutionDetails';
import { NodeExecutionsByIdContext } from '../contexts';
import { NodeExecutionsTable } from '../Tables/NodeExecutionsTable';
import { tabs } from './constants';
import { NodeExecutionDetailsPanelContent } from './NodeExecutionDetailsPanelContent';
import { ExecutionTimeline } from './Timeline/ExecutionTimeline';
import { ExecutionTimelineFooter } from './Timeline/ExecutionTimelineFooter';
import { convertToPlainNodes, TimeZone } from './Timeline/helpers';
import { DetailsPanelContext } from './DetailsPanelContext';

export interface ExecutionTabContentProps {
  tabType: string;
}

const useStyles = makeStyles(() => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 100%',
  },
  container: {
    display: 'flex',
    flex: '1 1 0',
    overflowY: 'auto',
  },
}));

export const ExecutionTabContent: React.FC<ExecutionTabContentProps> = ({ tabType }) => {
  const styles = useStyles();
  const { compiledWorkflowClosure } = useNodeExecutionContext();
  const { dag, staticExecutionIdsMap, error } = compiledWorkflowClosure
    ? transformerWorkflowToDag(compiledWorkflowClosure)
    : { dag: {}, staticExecutionIdsMap: {}, error: null };
  const nodeExecutionsById = useContext(NodeExecutionsByIdContext);
  const dynamicParents = checkForDynamicExecutions(nodeExecutionsById, staticExecutionIdsMap);
  const { data: dynamicWorkflows } = useQuery(
    makeNodeExecutionDynamicWorkflowQuery(dynamicParents),
  );
  const [initialNodes, setInitialNodes] = useState<dNode[]>([]);
  const [mergedDag, setMergedDag] = useState(null);

  useEffect(() => {
    const nodes: dNode[] = compiledWorkflowClosure
      ? transformerWorkflowToDag(compiledWorkflowClosure, dynamicWorkflows).dag.nodes
      : [];
    // we remove start/end node info in the root dNode list during first assignment
    const initialNodes = convertToPlainNodes(nodes);

    let newMergedDag = dag;

    for (const dynamicId in dynamicWorkflows) {
      if (staticExecutionIdsMap[dynamicId]) {
        if (compiledWorkflowClosure) {
          const dynamicWorkflow = transformerWorkflowToDag(
            compiledWorkflowClosure,
            dynamicWorkflows,
          );
          newMergedDag = dynamicWorkflow.dag;
        }
      }
    }
    setMergedDag(newMergedDag);
    setInitialNodes(initialNodes);
  }, [compiledWorkflowClosure, dynamicWorkflows]);

  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  // Note: flytegraph allows multiple selection, but we only support showing
  // a single item in the details panel
  const [selectedExecution, setSelectedExecution] = useState<NodeExecutionIdentifier | null>(
    selectedNodes.length
      ? nodeExecutionsById[selectedNodes[0]]
        ? nodeExecutionsById[selectedNodes[0]].id
        : {
            nodeId: selectedNodes[0],
            executionId: nodeExecutionsById[Object.keys(nodeExecutionsById)[0]].id.executionId,
          }
      : null,
  );

  const [selectedPhase, setSelectedPhase] = useState<TaskExecutionPhase | undefined>(undefined);
  const [isDetailsTabClosed, setIsDetailsTabClosed] = useState<boolean>(!selectedExecution);

  useEffect(() => {
    setIsDetailsTabClosed(!selectedExecution);
  }, [selectedExecution]);

  const onCloseDetailsPanel = () => {
    setSelectedExecution(null);
    setSelectedPhase(undefined);
    setSelectedNodes([]);
  };

  const [chartTimezone, setChartTimezone] = useState(TimeZone.Local);

  const handleTimezoneChange = (tz) => setChartTimezone(tz);

  const detailsPanelContext = useMemo(
    () => ({ selectedExecution, setSelectedExecution }),
    [selectedExecution, setSelectedExecution],
  );

  const onNodeSelectionChanged = (newSelection: string[]) => {
    const validSelection = newSelection.filter((nodeId) => {
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
            executionId: nodeExecutionsById[Object.keys(nodeExecutionsById)[0]].id.executionId,
          }
      : null;
    setSelectedExecution(newSelectedExecution);
  };

  const renderContent = () => {
    switch (tabType) {
      case tabs.nodes.id:
        return <NodeExecutionsTable initialNodes={initialNodes} />;
      case tabs.graph.id:
        return (
          <WorkflowGraph
            mergedDag={mergedDag}
            error={error}
            dynamicWorkflows={dynamicWorkflows}
            initialNodes={initialNodes}
            onNodeSelectionChanged={onNodeSelectionChanged}
            selectedPhase={selectedPhase}
            onPhaseSelectionChanged={setSelectedPhase}
            isDetailsTabClosed={isDetailsTabClosed}
          />
        );
      case tabs.timeline.id:
        return (
          <div className={styles.wrapper}>
            <div className={styles.container}>
              <ExecutionTimeline chartTimezone={chartTimezone} initialNodes={initialNodes} />
            </div>
            <ExecutionTimelineFooter onTimezoneChange={handleTimezoneChange} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <DetailsPanelContext.Provider value={detailsPanelContext}>
        {renderContent()}
      </DetailsPanelContext.Provider>
      {/* Side panel, shows information for specific node */}
      <DetailsPanel open={!isDetailsTabClosed} onClose={onCloseDetailsPanel}>
        {!isDetailsTabClosed && selectedExecution && (
          <NodeExecutionDetailsPanelContent
            onClose={onCloseDetailsPanel}
            taskPhase={selectedPhase ?? TaskExecutionPhase.UNDEFINED}
            nodeExecutionId={selectedExecution}
          />
        )}
      </DetailsPanel>
    </>
  );
};
