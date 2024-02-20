import React from 'react';
import { useQueryClient } from 'react-query';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import TableLoadingCell from '@clients/primitives/TableLoadingCell';
import { TableNoRowsCell } from '@clients/primitives/TableNoRowsCell';
import { TableLoadMoreCell } from '@clients/primitives/TableLoadMoreCell';
import { getCacheKey } from '../../Cache/utils';
import { ExecutionInputsOutputsModal } from '../ExecutionInputsOutputsModal';
import { ExecutionsTableHeader } from './ExecutionsTableHeader';
import { useWorkflowExecutionsTableColumns } from './WorkflowExecutionTable/useWorkflowExecutionsTableColumns';
import { useWorkflowExecutionsTableState } from './useWorkflowExecutionTableState';
import { WorkflowExecutionRow } from './WorkflowExecutionTable/WorkflowExecutionRow';
import { ResourceIdentifier, ResourceType } from '../../../models/Common/types';
import { useWorkflowExecutions } from '../../hooks/useWorkflowExecutions';
import { isLoadingState } from '../../hooks/fetchMachine';
import { WorkflowExecutionsTableState } from './types';
import WaitForData from '../../common/WaitForData';

export interface WorkflowExecutionsTableProps {
  project: string;
  domain: string;
  requestConfig: RequestConfig;
  showWorkflowName?: boolean;
  id?: ResourceIdentifier;
  chartIds: string[];
}
interface WorkflowExecutionsTableBodyProps extends WorkflowExecutionsTableProps {
  state: WorkflowExecutionsTableState;
  omitColumns: string[];
}
const WorkflowExecutionsTableBody: React.FC<WorkflowExecutionsTableBodyProps> = ({
  id,
  state,
  showWorkflowName = false,
  requestConfig,
  domain,
  project,
  chartIds,
  omitColumns,
}) => {
  const queryClient = useQueryClient();
  const [expandedErrors, setExpandedErrors] = React.useState<Dictionary<boolean>>({});

  const paginatedExecutionsQuery = useWorkflowExecutions(
    queryClient,
    { domain, project },
    requestConfig,
  );

  const filteredExecutions = React.useMemo(() => {
    if (chartIds.length) {
      const result = paginatedExecutionsQuery.value.filter((item) =>
        chartIds.includes(item.id.name),
      );
      return result;
    }

    return paginatedExecutionsQuery.value;
  }, [chartIds, paginatedExecutionsQuery.value]);

  // Reset error expansion states whenever list changes
  React.useLayoutEffect(() => {
    setExpandedErrors({});
  }, [filteredExecutions]);

  const fetchNextExecutionsPage = React.useCallback(
    () => paginatedExecutionsQuery.fetch(),
    [paginatedExecutionsQuery],
  );

  const onToggleError = (cacheKey: string, expanded: boolean) => {
    setExpandedErrors((currentExpandedErrors) => ({
      ...currentExpandedErrors,
      [cacheKey]: expanded,
    }));
  };

  const { moreItemsAvailable, lastError } = paginatedExecutionsQuery;
  const isFetching = isLoadingState(paginatedExecutionsQuery.state);
  return (
    <TableBody>
      <WaitForData {...paginatedExecutionsQuery} loadingComponent={TableLoadingCell}>
        {filteredExecutions?.length ? (
          filteredExecutions.map((execution) => {
            const cacheKey = getCacheKey(execution.id) + getCacheKey(execution.spec);

            return (
              <WorkflowExecutionRow
                key={cacheKey}
                showWorkflowName={showWorkflowName}
                execution={execution}
                errorExpanded={!!expandedErrors[cacheKey]}
                onExpandCollapseError={() => {
                  onToggleError(cacheKey, !expandedErrors[cacheKey]);
                }}
                state={state}
                id={id}
                omitColumns={omitColumns}
              />
            );
          })
        ) : (
          <TableNoRowsCell />
        )}
        {moreItemsAvailable && (
          <TableLoadMoreCell
            loadMoreRows={fetchNextExecutionsPage}
            isFetching={isFetching}
            lastError={(lastError || null) as string | Error | null}
          />
        )}
      </WaitForData>
    </TableBody>
  );
};

/** Renders a table of WorkflowExecution records. Executions with errors will
 * have an expanadable container rendered as part of the table row.
 */
export const WorkflowExecutionsTable: React.FC<WorkflowExecutionsTableProps> = ({
  id,
  showWorkflowName = false,
  requestConfig,
  domain,
  project,
  chartIds,
}) => {
  const state = useWorkflowExecutionsTableState();
  // passing an empty property list, as we only use it for table headers info here
  let omitColumns: string[] = [];
  switch (id?.resourceType) {
    case ResourceType.LAUNCH_PLAN:
      omitColumns = ['launchPlan'];
      break;
    case ResourceType.TASK:
      omitColumns = ['workflowTask'];
      break;
    case ResourceType.WORKFLOW:
      omitColumns = ['workflowTask'];
      break;
    default:
      break;
  }

  const columns = useWorkflowExecutionsTableColumns({
    omitColumns,
    showWorkflowName,
  });

  const onCloseIOModal = () => state.setSelectedIOExecution(null);

  return (
    <Grid container>
      <Grid item xs={12}>
        <TableContainer
          sx={{
            // ensure other elements like last 100 graph fit on page and dont also overscroll
            maxWidth: 'calc(100vw - 80px - 16px)',
          }}
        >
          <Table stickyHeader size="small">
            <ExecutionsTableHeader columns={columns} />
            <WorkflowExecutionsTableBody
              id={id}
              showWorkflowName={showWorkflowName}
              domain={domain}
              project={project}
              requestConfig={requestConfig}
              chartIds={chartIds}
              state={state}
              omitColumns={omitColumns}
            />
          </Table>
        </TableContainer>
        <ExecutionInputsOutputsModal
          execution={state.selectedIOExecution}
          onClose={onCloseIOModal}
        />
      </Grid>
    </Grid>
  );
};
