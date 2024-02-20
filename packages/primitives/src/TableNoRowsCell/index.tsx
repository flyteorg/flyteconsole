import React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import styled from '@mui/system/styled';
import { noExecutionsFoundString } from '@clients/common/constants';
import { loadMoreRowGridHeight } from '@clients/common/constants/tableConstants';

const NoRowsContentContainer = styled('div')(({ theme }) => ({
  alignItems: ' center',
  display: ' flex',
  flexDirection: 'column',
  height: theme.spacing(loadMoreRowGridHeight),
  justifyContent: ' center',
  padding: `${theme.spacing(2)}`,
  width: '100%',
}));

export interface TableNoRowsCellProps {
  displayMessage?: string;
}

/** Handles rendering the content below a table, which can be a "Load More"
 * button, or an error
 */
export const TableNoRowsCell: React.FC<TableNoRowsCellProps> = ({
  displayMessage = noExecutionsFoundString,
}: TableNoRowsCellProps) => {
  return (
    <TableRow data-testid="no-rows-row">
      <TableCell colSpan={99}>
        <NoRowsContentContainer>{displayMessage}</NoRowsContentContainer>
      </TableCell>
    </TableRow>
  );
};

export default TableNoRowsCell;
