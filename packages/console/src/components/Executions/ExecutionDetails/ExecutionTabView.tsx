import React from 'react';
import { Tab, Tabs } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { useTabState } from 'components/hooks/useTabState';
import { secondaryBackgroundColor } from 'components/Theme/constants';
import { tabs } from './constants';
import { ExecutionTab } from './ExecutionTab';
import { useNodeExecutionsById } from '../contextProvider/NodeExecutionDetails';

const useStyles = makeStyles((theme: Theme) => ({
  tabs: {
    background: secondaryBackgroundColor,
    paddingLeft: theme.spacing(3.5),
  },
}));

const DEFAULT_TAB = tabs.nodes.id;

/** Contains the available ways to visualize the nodes of a WorkflowExecution */
export const ExecutionTabView: React.FC<{}> = () => {
  const styles = useStyles();
  const tabState = useTabState(tabs, DEFAULT_TAB);

  const executionsContext = useNodeExecutionsById();

  return (
    <>
      <Tabs className={styles.tabs} {...tabState}>
        <Tab value={tabs.nodes.id} label={tabs.nodes.label} />
        <Tab value={tabs.graph.id} label={tabs.graph.label} />
        <Tab value={tabs.timeline.id} label={tabs.timeline.label} />
      </Tabs>

      <ExecutionTab
        tabType={tabState.value}
        executionsContext={executionsContext}
      />
    </>
  );
};
