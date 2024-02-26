import React from 'react';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import styled from '@mui/system/styled';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import { useTabState } from '../../hooks/useTabState';
import { tabs } from './constants';
import { ExecutionTab } from './ExecutionTab';

const StyledTab = styled(Tabs)(({ theme }) => ({
  background: CommonStylesConstants.secondaryBackgroundColor,
  paddingLeft: theme.spacing(3.5),
}));

const DEFAULT_TAB = tabs.nodes.id;

/** Contains the available ways to visualize the nodes of a WorkflowExecution */
export const ExecutionTabView: React.FC<{}> = () => {
  const { value, onChange } = useTabState(DEFAULT_TAB, 'tab', true);

  return (
    <>
      <StyledTab onChange={onChange} value={value}>
        <Tab value={tabs.nodes.id} label={tabs.nodes.label} />
        <Tab value={tabs.graph.id} label={tabs.graph.label} />
        <Tab value={tabs.timeline.id} label={tabs.timeline.label} />
      </StyledTab>

      <ExecutionTab tabType={value} />
    </>
  );
};
