import React from 'react';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import styled from '@mui/system/styled';

import Core from '@clients/common/flyteidl/core';
import t from '../strings';

const EnvVarsTableContainer = styled('div')(({ theme }) => ({
  '& .container': {
    marginBottom: theme.spacing(1),
    '& .MuiTableCell-sizeSmall': {
      paddingLeft: 0,
    },
  },
  '& .headerText': {
    color: theme.palette.common.grays[30],
  },
}));

interface EnvVarsTableProps {
  rows: Core.IKeyValuePair[];
}

export default function EnvVarsTable({ rows }: EnvVarsTableProps) {
  if (!rows || rows.length === 0) {
    return <Typography>{t('empty')}</Typography>;
  }
  return (
    <EnvVarsTableContainer>
      <TableContainer className="container" component={Paper}>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography className="headerText" variant="h4">
                  {t('key')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography className="headerText" variant="h4">
                  {t('value')}
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell component="th" scope="row">
                  {row.key}
                </TableCell>
                <TableCell component="th" scope="row">
                  {row.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </EnvVarsTableContainer>
  );
}
