import React from 'react';
import Button from '@mui/material/Button';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import styled from '@mui/system/styled';
import { loadMoreRowGridHeight } from '@clients/common/constants/tableConstants';
import { CircularProgressButton } from '@clients/primitives/CircularProgressButton';
import { useCommonStyles } from '@clients/theme/CommonStyles/CommonStyles';

const LoadMoreRowContainer = styled('div')(({ theme }) => ({
  alignItems: ' center',
  display: ' flex',
  flexDirection: 'column',
  height: theme.spacing(loadMoreRowGridHeight),
  justifyContent: ' center',
  padding: `${theme.spacing(2)}`,
  width: '100%',
  '& .button': {
    color: theme.palette.text.secondary,
  },
}));

interface LoadMoreRowContentProps {
  lastError: string | Error | null;
  isFetching: boolean;
  style?: any;
  loadMoreRows: () => void;
}

/** Handles rendering the content below a table, which can be a "Load More"
 * button, or an error
 */
export const TableLoadMoreCell: React.FC<LoadMoreRowContentProps> = (props) => {
  const commonStyles = useCommonStyles();
  const { loadMoreRows, lastError, isFetching, style } = props;

  const button = (
    <Button onClick={loadMoreRows} size="small" variant="outlined" disabled={isFetching}>
      Load More
      {isFetching ? <CircularProgressButton /> : null}
    </Button>
  );
  const errorContent = lastError ? (
    <div className={commonStyles.errorText}>Failed to load additional items</div>
  ) : null;

  return (
    <TableRow>
      <TableCell colSpan={99}>
        <LoadMoreRowContainer style={style}>
          {errorContent}
          {button}
        </LoadMoreRowContainer>
      </TableCell>
    </TableRow>
  );
};

export default TableLoadMoreCell;
