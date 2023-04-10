import * as React from 'react';
import { WorkflowGraph } from 'components/WorkflowGraph/WorkflowGraph';
import { Theme, makeStyles } from '@material-ui/core/styles';
import { tabs } from './constants';
import { NodeExecutionsTable } from '../Tables/NodeExecutionsTable';
import { DetailsPanelContextProvider } from './DetailsPanelContext';
import { ScaleProvider } from './Timeline/scaleContext';
import { ExecutionTimelineContainer } from './Timeline/ExecutionTimelineContainer';
import { IWorkflowNodeExecutionsContext } from '../contexts';

const useStyles = makeStyles((theme: Theme) => ({
  nodesContainer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flex: '1 1 100%',
    flexDirection: 'column',
    minHeight: 0,
  },
}));

interface ExecutionTabProps {
  executionsContext: IWorkflowNodeExecutionsContext;
  tabType: string;
}

/** Contains the available ways to visualize the nodes of a WorkflowExecution */
export const ExecutionTab: React.FC<ExecutionTabProps> = ({
  tabType,
  executionsContext,
}) => {
  const styles = useStyles();

  const renderContent = (executionsContext: IWorkflowNodeExecutionsContext) => {
    switch (tabType) {
      case tabs.nodes.id:
        return <NodeExecutionsTable />;
      case tabs.graph.id:
        return <WorkflowGraph executionsContext={executionsContext} />;
      case tabs.timeline.id:
        return <ExecutionTimelineContainer />;
      default:
        return null;
    }
  };

  return (
    <ScaleProvider>
      <DetailsPanelContextProvider>
        <div className={styles.nodesContainer}>
          {renderContent(executionsContext)}
        </div>
      </DetailsPanelContextProvider>
      {/* Side panel, shows information for specific node */}
    </ScaleProvider>
  );
};
