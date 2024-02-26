import React, { FC, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Shimmer from '@clients/primitives/Shimmer';
import { useQueryClient } from 'react-query';
import { useInView } from 'react-intersection-observer';
import { LaunchPlanLastNExecutions } from '../components/LaunchPlanLastNExecutions';
import { makeListLaunchPlansQuery } from '../../../queries/launchPlanQueries';
import { useConditionalQuery } from '../../hooks/useConditionalQuery';
import {
  WorkflowName,
  LaunchPlanName,
  ScheduleStatus,
  ScheduleDisplayValue,
} from '../components/LaunchPlanCells';
import { CREATED_AT_DESCENDING_SORT } from '../../../models/Launch/constants';
import { SearchResult } from '../../common/useSearchableListState';
import { NamedEntity } from '../../../models/Common/types';

interface LaunchPlanTableRowProps extends SearchResult<NamedEntity> {}

export const LaunchPlanTableRow: FC<LaunchPlanTableRowProps> = ({
  value,
  result,
  content,
}: LaunchPlanTableRowProps) => {
  const queryClient = useQueryClient();
  const [inViewRef, inView] = useInView();

  const { id } = value;

  const launchPlanWorkflowQuery = useConditionalQuery(
    {
      ...makeListLaunchPlansQuery(queryClient, id, { sort: CREATED_AT_DESCENDING_SORT, limit: 1 }),
      enabled: inView,
    },
    (prev) => !prev && !!inView,
  );

  const launchPlan = useMemo(() => {
    return launchPlanWorkflowQuery.data?.entities?.[0];
  }, [launchPlanWorkflowQuery]);

  return (
    <TableRow ref={inViewRef}>
      {/* Launch Plan Name */}
      <TableCell sx={{ padding: (theme) => theme.spacing(0.5) }}>
        <LaunchPlanName inView={inView} content={content} value={value} result={result} />
      </TableCell>
      {/* Underlying Workflow */}
      <TableCell sx={{ padding: (theme) => theme.spacing(0.5) }}>
        <Grid
          item
          alignSelf="center"
          sx={{
            width: (theme) => `calc(100% - 24px - ${theme.spacing(2)})`,
            // text wrap
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          {!launchPlanWorkflowQuery.isFetched ? (
            <Shimmer />
          ) : (
            <WorkflowName isFetched={launchPlanWorkflowQuery.isFetched} launchPlan={launchPlan} />
          )}
        </Grid>
      </TableCell>
      {/* Schedule Status */}
      <TableCell>
        <ScheduleStatus launchPlan={launchPlan} refetch={launchPlanWorkflowQuery.refetch} />
      </TableCell>
      {/* Schedule */}
      <TableCell
        sx={{
          minWidth: '160px',
          padding: '5px',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}
      >
        <ScheduleDisplayValue launchPlan={launchPlan} />
      </TableCell>
      {/* Last Execution  */}
      <TableCell>
        {launchPlan == null ? (
          <Shimmer />
        ) : (
          <LaunchPlanLastNExecutions
            launchPlan={launchPlan}
            showLastExecutionOnly
            inView={inView}
          />
        )}
      </TableCell>
      {/* Last 10 Executions  */}
      <TableCell>
        {launchPlan == null ? (
          <Shimmer />
        ) : (
          <LaunchPlanLastNExecutions launchPlan={launchPlan} inView={inView} />
        )}
      </TableCell>
    </TableRow>
  );
};
