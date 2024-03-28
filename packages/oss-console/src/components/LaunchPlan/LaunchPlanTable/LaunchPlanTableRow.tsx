import React, { FC, createContext, useContext, useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useInView } from 'react-intersection-observer';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import { Routes } from '@clients/oss-console/routes/routes';
import { LaunchPlanLastNExecutions } from '../components/LaunchPlanLastNExecutions';
import { LaunchPlanName, ScheduleStatusSummary } from '../components/LaunchPlanCells';
import { SearchResult } from '../../common/useSearchableListState';
import { NamedEntity } from '../../../models/Common/types';
import { LaunchPlanScheduleContextMenuFromNamedId } from '../components/LaunchPlanScheduleContextMenuFromNameId';

interface LaunchPlanTableRowProps extends SearchResult<NamedEntity> {}

interface RefreshRowContextType {
  refresh: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * We use this context to trigger refetch when user updates launchplan
 * active state; ie, so that user can see the change.
 */
const RefreshRowContext = createContext<RefreshRowContextType>({
  refresh: false,
  setRefresh: () => {},
});

export const useSearchRowRefreshContext = () => useContext(RefreshRowContext);

export const LaunchPlanTableRow: FC<LaunchPlanTableRowProps> = ({
  value,
  result,
  content,
}: LaunchPlanTableRowProps) => {
  const [inViewRef, inView] = useInView();
  if (!value) {
    return null;
  }
  const { id } = value;
  const key = id ? `${id.project}-${id.domain}-${id.name}` : 'none';
  const url = Routes.LaunchPlanDetails.makeUrl(id.project, id.domain, id.name);
  const [refresh, setRefresh] = useState(false);

  return (
    <RefreshRowContext.Provider value={{ refresh, setRefresh }}>
      <TableRow
        data-testid="launch-plan-table-row"
        ref={inViewRef}
        component={Link}
        key={`lp-row-${key}`}
        href={url}
        underline="none"
        sx={{ cursor: 'pointer' }}
      >
        {/* Launch Plan Name */}
        <TableCell sx={{ padding: (theme) => theme.spacing(0.5) }}>
          <LaunchPlanName inView={inView} content={content} value={value} result={result} />
        </TableCell>

        {/* Schedule Status */}
        <TableCell>
          <ScheduleStatusSummary id={id} inView={inView} />
        </TableCell>
        {/* Last Execution  */}
        <TableCell>
          <LaunchPlanLastNExecutions id={id} showLastExecutionOnly inView={inView} />
        </TableCell>
        {/* Last 10 Executions  */}
        <TableCell>
          <LaunchPlanLastNExecutions id={id} inView={inView} />
        </TableCell>
        <TableCell>
          <Grid data-testid="launch-plan-CTAs" item alignContent="flex-end">
            <LaunchPlanScheduleContextMenuFromNamedId
              id={id}
              inView={inView}
              setRefresh={setRefresh}
            />
          </Grid>
        </TableCell>
      </TableRow>
    </RefreshRowContext.Provider>
  );
};
