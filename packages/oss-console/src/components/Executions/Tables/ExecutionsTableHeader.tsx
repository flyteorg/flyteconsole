import React from 'react';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { isFunction } from '../../../common/typeCheckers';
import { ColumnDefinition } from './types';

/** Layout/rendering logic for the header row of an ExecutionsTable */
export const ExecutionsTableHeader: React.FC<{
  columns: ColumnDefinition<any>[];
  scrollbarPadding?: number;
  versionView?: boolean;
}> = ({ columns }) => {
  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => {
          const labelContent = isFunction(column.label) ? (
            React.createElement(column.label)
          ) : (
            <>{column.label}</>
          );
          return (
            <TableCell className={column.className} key={column.key}>
              {labelContent}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};
