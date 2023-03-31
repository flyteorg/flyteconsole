import React, { useContext } from 'react';
import { Tab, Tabs } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { useTabState } from 'components/hooks/useTabState';
import { secondaryBackgroundColor } from 'components/Theme/constants';
import {
  NodeExecutionDetailsContextProvider,
  NodeExecutionsByIdContextProvider,
} from '../contextProvider/NodeExecutionDetails';
import { ExecutionContext } from '../contexts';
import { ExecutionFilters } from '../ExecutionFilters';
import { useNodeExecutionFiltersState } from '../filters/useExecutionFiltersState';
import { tabs } from './constants';
import { ExecutionTab } from './ExecutionTab';

const useStyles = makeStyles((theme: Theme) => ({
  filters: {
    paddingLeft: theme.spacing(3),
  },
  nodesContainer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flex: '1 1 100%',
    flexDirection: 'column',
    minHeight: 0,
  },
  tabs: {
    background: secondaryBackgroundColor,
    paddingLeft: theme.spacing(3.5),
  },
}));

/** Contains the available ways to visualize the nodes of a WorkflowExecution */
export const ExecutionNodeViews: React.FC = () => {
  const defaultTab = tabs.nodes.id;
  const styles = useStyles();
  const filterState = useNodeExecutionFiltersState();
  const tabState = useTabState(tabs, defaultTab);
  const { execution } = useContext(ExecutionContext);

  const {
    closure: { workflowId },
  } = execution;

  return (
    <>
      <Tabs className={styles.tabs} {...tabState}>
        <Tab value={tabs.nodes.id} label={tabs.nodes.label} />
        <Tab value={tabs.graph.id} label={tabs.graph.label} />
        <Tab value={tabs.timeline.id} label={tabs.timeline.label} />
      </Tabs>
      <NodeExecutionDetailsContextProvider workflowId={workflowId}>
        <NodeExecutionsByIdContextProvider filterState={filterState}>
          <div className={styles.nodesContainer}>
            {tabState.value === tabs.nodes.id && (
              <div className={styles.filters}>
                <ExecutionFilters {...filterState} />
              </div>
            )}
            <ExecutionTab tabType={tabState.value} />
          </div>
        </NodeExecutionsByIdContextProvider>
      </NodeExecutionDetailsContextProvider>
    </>
  );
};
