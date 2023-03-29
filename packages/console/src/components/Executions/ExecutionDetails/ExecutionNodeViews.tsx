import React, { useEffect } from 'react';
import { Tab, Tabs } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { WaitForQuery } from 'components/common/WaitForQuery';
import { DataError } from 'components/Errors/DataError';
import { useTabState } from 'components/hooks/useTabState';
import { secondaryBackgroundColor } from 'components/Theme/constants';
import { Execution } from 'models/Execution/types';
import { keyBy } from 'lodash';
import { LargeLoadingSpinner } from 'components/common/LoadingSpinner';
import { FilterOperation } from 'models/AdminEntity/types';
import { NodeExecutionDetailsContextProvider } from '../contextProvider/NodeExecutionDetails';
import { NodeExecutionsByIdContext } from '../contexts';
import { ExecutionFilters } from '../ExecutionFilters';
import { useNodeExecutionFiltersState } from '../filters/useExecutionFiltersState';
import { tabs } from './constants';
import { useExecutionNodeViewsState } from './useExecutionNodeViewsState';
import { ExecutionTab } from './ExecutionTab';
import { useNodeExecutionsById } from '../useNodeExecutionsById';

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
  loading: {
    margin: 'auto',
  },
}));

const isPhaseFilter = (appliedFilters: FilterOperation[]) => {
  if (appliedFilters.length === 1 && appliedFilters[0].key === 'phase') {
    return true;
  }
  return false;
};

interface ExecutionNodeViewsProps {
  execution: Execution;
}

/** Contains the available ways to visualize the nodes of a WorkflowExecution */
export const ExecutionNodeViews: React.FC<ExecutionNodeViewsProps> = ({
  execution,
}) => {
  const defaultTab = tabs.nodes.id;
  const styles = useStyles();
  const filterState = useNodeExecutionFiltersState();
  const tabState = useTabState(tabs, defaultTab);

  const {
    closure: { workflowId },
  } = execution;

  // query to get all data to build Graph and Timeline
  const { nodeExecutionsQuery } = useExecutionNodeViewsState(execution);
  // query to get filtered data to narrow down Table outputs
  const {
    nodeExecutionsQuery: { data: filteredNodeExecutions },
  } = useExecutionNodeViewsState(execution, filterState.appliedFilters);

  const { nodeExecutionsById, setCurrentNodeExecutionsById } =
    useNodeExecutionsById();

  useEffect(() => {
    if (nodeExecutionsQuery.isFetching) {
      return;
    }
    const currentNodeExecutionsById = keyBy(
      nodeExecutionsQuery.data,
      'scopedId',
    );
    setCurrentNodeExecutionsById(currentNodeExecutionsById);
  }, [nodeExecutionsQuery]);

  const LoadingComponent = () => {
    return (
      <div className={styles.loading}>
        <LargeLoadingSpinner />
      </div>
    );
  };

  const renderTab = tabType => {
    return (
      <ExecutionTab
        tabType={tabType}
        // if only phase filter was applied, ignore request response, and filter out nodes via frontend filter
        filteredNodeExecutions={
          isPhaseFilter(filterState.appliedFilters)
            ? undefined
            : filteredNodeExecutions
        }
      />
    );
  };

  return (
    <>
      <Tabs className={styles.tabs} {...tabState}>
        <Tab value={tabs.nodes.id} label={tabs.nodes.label} />
        <Tab value={tabs.graph.id} label={tabs.graph.label} />
        <Tab value={tabs.timeline.id} label={tabs.timeline.label} />
      </Tabs>
      <NodeExecutionDetailsContextProvider workflowId={workflowId}>
        <NodeExecutionsByIdContext.Provider
          value={{ nodeExecutionsById, setCurrentNodeExecutionsById }}
        >
          <div className={styles.nodesContainer}>
            {tabState.value === tabs.nodes.id && (
              <div className={styles.filters}>
                <ExecutionFilters {...filterState} />
              </div>
            )}
            <WaitForQuery
              errorComponent={DataError}
              query={nodeExecutionsQuery}
              loadingComponent={LoadingComponent}
            >
              {() => renderTab(tabState.value)}
            </WaitForQuery>
          </div>
        </NodeExecutionsByIdContext.Provider>
      </NodeExecutionDetailsContextProvider>
    </>
  );
};
