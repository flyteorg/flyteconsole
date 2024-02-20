import React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { LargeLoadingComponent } from '../LoadingSpinner';

export const TableLoadingCell = () => {
  return (
    <TableRow>
      <TableCell colSpan={99}>
        <LargeLoadingComponent useDelay={false} />
      </TableCell>
    </TableRow>
  );
};

export default TableLoadingCell;
