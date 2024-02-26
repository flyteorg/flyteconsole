import React from 'react';
import styled from '@mui/system/styled';
import { WorkflowGraph } from '../../WorkflowGraph/WorkflowGraph';
import { tabs } from './constants';
import { NodeExecutionsTable } from '../Tables/NodeExecutionsTable';
import { DetailsPanelContextProvider } from './DetailsPanelContext';
import { ExecutionTimeline } from './Timeline/ExecutionTimeline';
import { useNodeExecutionFiltersState } from '../filters/useExecutionFiltersState';

const NodesContainer = styled('div')(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flex: '1 1 100%',
  flexDirection: 'column',
  minHeight: 0,
}));

interface ExecutionTabProps {
  tabType: string;
}

/** Contains the available ways to visualize the nodes of a WorkflowExecution */
export const ExecutionTab: React.FC<ExecutionTabProps> = ({ tabType }) => {
  const filterState = useNodeExecutionFiltersState();

  return (
    <DetailsPanelContextProvider>
      <NodesContainer>
        {tabType === tabs.nodes.id && <NodeExecutionsTable filterState={filterState} />}
        {tabType === tabs.graph.id && <WorkflowGraph />}
        {tabType === tabs.timeline.id && <ExecutionTimeline />}
      </NodesContainer>
    </DetailsPanelContextProvider>
  );
};
