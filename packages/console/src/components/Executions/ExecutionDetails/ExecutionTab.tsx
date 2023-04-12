import * as React from 'react';
import { WorkflowGraph } from 'components/WorkflowGraph/WorkflowGraph';
import { Theme, makeStyles } from '@material-ui/core/styles';
import { tabs } from './constants';
import { NodeExecutionsTable } from '../Tables/NodeExecutionsTable';
import { DetailsPanelContextProvider } from './DetailsPanelContext';
import { ScaleProvider } from './Timeline/scaleContext';
import { ExecutionTimelineContainer } from './Timeline/ExecutionTimelineContainer';

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
  tabType: string;
}

/** Contains the available ways to visualize the nodes of a WorkflowExecution */
export const ExecutionTab: React.FC<ExecutionTabProps> = ({ tabType }) => {
  const styles = useStyles();

  return (
    <ScaleProvider>
      <DetailsPanelContextProvider>
        <div className={styles.nodesContainer}>
          {tabType === tabs.nodes.id && <NodeExecutionsTable />}
          {tabType === tabs.graph.id && <WorkflowGraph />}
          {tabType === tabs.timeline.id && <ExecutionTimelineContainer />}
        </div>
      </DetailsPanelContextProvider>
    </ScaleProvider>
  );
};
