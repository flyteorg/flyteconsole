import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { LargeLoadingComponent } from '@clients/primitives/LoadingSpinner';
import { TableNoRowsCell } from '@clients/primitives/TableNoRowsCell';
import { noLaunchPlansFoundString } from '@clients/common/constants';
import { SearchResult } from '../../common/useSearchableListState';
import { NamedEntity } from '../../../models/Common/types';
import { ItemRenderer } from '../../common/FilterableNamedEntityList';

export interface LaunchPlanTableViewProps {
  results: SearchResult<NamedEntity>[];
  renderItem: ItemRenderer;
  loading: boolean;
}

export const LaunchPlanTableView = ({ results, renderItem, loading }: LaunchPlanTableViewProps) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ minWidth: '320px', textTransform: 'none !important' }}>
              Launch Plan Name
            </TableCell>
            <TableCell sx={{ minWidth: '320px', textTransform: 'none !important' }}>
              Underlying Workflow
            </TableCell>
            <TableCell sx={{ textTransform: 'none !important' }}>Schedule Status</TableCell>
            <TableCell sx={{ textTransform: 'none !important' }}>Schedule</TableCell>
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
            results.map((r) => renderItem(r, false))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
