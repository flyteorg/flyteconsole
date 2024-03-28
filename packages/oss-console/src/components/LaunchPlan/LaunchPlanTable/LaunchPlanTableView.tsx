import React, { useRef } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { LargeLoadingComponent } from '@clients/primitives/LoadingSpinner';
import { TableNoRowsCell } from '@clients/primitives/TableNoRowsCell';
import { noLaunchPlansFoundString } from '@clients/common/constants';
import { useVirtualizer } from '@tanstack/react-virtual';
import result from 'lodash/result';
import { SearchResult } from '../../common/useSearchableListState';
import { NamedEntity } from '../../../models/Common/types';
import { LaunchPlanTableRow } from './LaunchPlanTableRow';

export interface LaunchPlanTableViewProps {
  results: SearchResult<NamedEntity>[];
  loading: boolean;
}

export const LaunchPlanTableView = ({ results, loading }: LaunchPlanTableViewProps) => {
  const parentRef = useRef<any>(document.getElementById('scroll-element'));

  const rowVirtualizer = useVirtualizer({
    count: result?.length ? results.length + 1 : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 15,
  });

  const items = rowVirtualizer.getVirtualItems();

  return (
    <TableContainer
      sx={{
        padding: (theme) => theme.spacing(0, 2),
      }}
    >
      <Table data-testid="launch-plan-list-table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ minWidth: '320px', textTransform: 'none !important' }}>Name</TableCell>
            <TableCell sx={{ minWidth: '320px', textTransform: 'none !important' }}>
              Trigger
            </TableCell>
            <TableCell sx={{ textTransform: 'none !important' }}>Last Execution</TableCell>
            <TableCell sx={{ textTransform: 'none !important' }}>Last 10 Executions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <LargeLoadingComponent useDelay={false} />
          ) : results.length === 0 ? (
            <TableNoRowsCell displayMessage={noLaunchPlansFoundString} />
          ) : (
            items.map((virtualRow) => <LaunchPlanTableRow {...results[virtualRow.index]} />)
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
