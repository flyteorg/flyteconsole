import React from 'react';
import styled from '@mui/system/styled';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import classNames from 'classnames';

const StyledTable = styled(Table)(({ theme }) => ({
  '.headerCell': {
    padding: theme.spacing(1, 0, 1, 0),
    color: theme.palette.common.grays[40],
  },
  '.cell': {
    padding: theme.spacing(1, 0, 1, 0),
    minWidth: '100px',
  },
  '.withRightPadding': {
    paddingRight: theme.spacing(1),
  },
}));

export interface DataTableProps {
  data: { [k: string]: string };
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  return (
    <TableContainer component={Paper}>
      <StyledTable>
        <TableHead>
          <TableRow>
            <TableCell className="headerCell">Key</TableCell>
            <TableCell className="headerCell">Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(data).map((key) => (
            <TableRow key={key}>
              <TableCell className={classNames('cell', 'withRightPadding')}>{key}</TableCell>
              <TableCell className="cell">{data[key]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>
    </TableContainer>
  );
};
