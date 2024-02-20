import React, { PropsWithChildren, ReactNode } from 'react';
import classnames from 'classnames';
import styled from '@mui/system/styled';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ColumnDefinition } from '../Executions/Tables/types';
import { workflowVersionsTableColumnWidths } from '../Executions/Tables/constants';

const PaginatedDataListContainer = styled('div')(({ theme }) => ({
  width: '100%',

  '.paper': {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  '.table': {
    minWidth: 200,
  },
  '.radioButton': {
    width: workflowVersionsTableColumnWidths.radio,
  },
  '.visuallyHidden': {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

interface PaginatedDataListHeaderProps {
  columns: ColumnDefinition<any>[];
  rowCount: number;
  showRadioButton?: boolean;
}

interface PaginatedDataListProps<T> {
  columns: ColumnDefinition<any>[];
  showRadioButton?: boolean;
  totalRows: number;
  data: T[];
  rowRenderer: (row: T) => JSX.Element;
  noDataString: string;
  fillEmptyRows?: boolean;
}

/**
 * Renders pagination table's header
 * @param props
 * @constructor
 */
const PaginatedDataListHeader = (props: PropsWithChildren<PaginatedDataListHeaderProps>) => {
  const { columns, showRadioButton } = props;
  const cellClass = classnames('cell', 'header');

  return (
    <TableHead>
      <TableRow>
        {showRadioButton && (
          <TableCell
            classes={{
              root: cellClass,
            }}
            className="radioButton"
          >
            &nbsp;
          </TableCell>
        )}
        {columns.map((column) => (
          <TableCell
            classes={{
              root: cellClass,
            }}
            className={column.className}
            key={column.key}
          >
            {column.label as ReactNode}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

/**
 * Renders pagination table based on the column information and the total number of rows.
 * @param columns
 * @param data
 * @param rowRenderer
 * @param totalRows
 * @param showRadioButton
 * @param noDataString
 * @constructor
 */
const PaginatedDataList = <T,>({
  columns,
  data,
  rowRenderer,
  totalRows,
  showRadioButton,
  fillEmptyRows = true,
}: PropsWithChildren<PaginatedDataListProps<T>>) => {
  const [page] = React.useState(0);
  const [rowsPerPage] = React.useState(5);

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, totalRows - page * rowsPerPage);

  return (
    <PaginatedDataListContainer>
      <TableContainer>
        <Table className="table" size="small">
          <PaginatedDataListHeader
            columns={columns}
            rowCount={data.length}
            showRadioButton={showRadioButton}
          />
          <TableBody>
            {data.map((row, _index) => {
              return rowRenderer(row);
            })}
            {fillEmptyRows && !showRadioButton && emptyRows > 0 && (
              <TableRow>
                <TableCell colSpan={99} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </PaginatedDataListContainer>
  );
};

export default PaginatedDataList;
