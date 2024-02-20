import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import classnames from 'classnames';
import { useSnackbar } from 'notistack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import styled from '@mui/system/styled';
import { useHistory } from 'react-router';
import { Execution } from '../../../../models/Execution/types';
import { ExecutionState } from '../../../../models/Execution/enums';
import { updateExecution } from '../../../../models/Execution/api';
import { Routes } from '../../../../routes/routes';
import { isExecutionArchived } from '../../utils';
import { ExpandableExecutionError } from '../ExpandableExecutionError';
import { useExecutionTableStyles } from '../styles';
import { WorkflowExecutionColumnDefinition, WorkflowExecutionsTableState } from '../types';
import {
  useConfirmationSection,
  useWorkflowExecutionsTableColumns,
} from './useWorkflowExecutionsTableColumns';
import t from './strings';
import { ResourceIdentifier } from '../../../../models/Common/types';

const StyledExecutionTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.75, 1),
}));

export interface WorkflowExecutionRowProps {
  showWorkflowName: boolean;
  errorExpanded?: boolean;
  execution: Execution;
  onExpandCollapseError?(expanded: boolean): void;
  state: WorkflowExecutionsTableState;
  id?: ResourceIdentifier;
  omitColumns: string[];
}

const CellRenderer = ({
  columns,
  execution,
  state,
  hidden,
}: {
  execution: Execution;
  state: WorkflowExecutionsTableState;
  columns: WorkflowExecutionColumnDefinition[];
  hidden?: boolean;
}) => (
  <>
    {columns.map(({ className, key: columnKey, cellRenderer }) => {
      return (
        <StyledExecutionTableCell
          key={columnKey}
          className={classnames(className)}
          sx={{ display: hidden ? 'none' : 'table-cell' }}
        >
          {cellRenderer({ execution, state })}
        </StyledExecutionTableCell>
      );
    })}
  </>
);

const StyledExecutionRow = styled(TableRow)<{ showerrorinfo: boolean }>(
  ({ theme, showerrorinfo }) => ({
    position: 'relative',
    '& td': {
      borderBottom: showerrorinfo ? 'none' : `1px solid ${theme.palette.divider}`,
    },
    // hover code cell
    '&.has-error': {
      // remove flicker from ease
      // error block still eases in, masks the flicker compensation
      transition: 'background 0s linear !important',
    },
    '&.has-error:hover::after': {
      content: '""',
      position: 'absolute',
      top: '100%',
      left: 0,
      width: '100%',
      height: '100%',
      background: `linear-gradient(to bottom, ${theme.palette.common.blue[1]}FF 0%, ${theme.palette.common.blue[1]}00 100%)`,
      zIndex: -1,
    },
  }),
);

const StyledErrorRow = styled(TableRow)(({ theme }) => ({
  position: 'relative',
  // cover single layer text row
  backgroundColor: 'transparent !important',
  '&:after': {
    content: '""',
    position: 'absolute',
    top: '-40px',
    height: '80px',
    left: 0,
    width: '100%',
    background: 'none',
    transition: 'background 0.3s ease',
    zIndex: -1,
  },
  '&:hover:after': {
    background: `linear-gradient(to bottom, ${theme.palette.common.blue[1]}FF 0%, ${theme.palette.common.blue[1]}FF 50%, ${theme.palette.common.blue[1]}00 100%)`,
  },
}));

/** Renders a single `Execution` record as a row. Designed to be used as a child
 * of `WorkflowExecutionTable`.
 */
export const WorkflowExecutionRow: React.FC<
  WorkflowExecutionRowProps & {
    style?: React.CSSProperties;
  }
> = ({
  showWorkflowName,
  errorExpanded,
  execution,
  onExpandCollapseError,
  state,
  id,
  omitColumns,
}) => {
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const tableStyles = useExecutionTableStyles();

  const isArchived = isExecutionArchived(execution);
  const [hideItem, setHideItem] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);

  const updateExecutionState = useMutation(
    (newState: ExecutionState) => updateExecution(execution.id, newState),
    {
      onMutate: () => setIsUpdating(true),
      onSuccess: () => {
        enqueueSnackbar(t('archiveSuccess', !isArchived), {
          variant: 'success',
        });
        setHideItem(true);
        // ensure to collapse error info and re-calculate rows positions.
        onExpandCollapseError?.(false);
      },
      onError: () => {
        enqueueSnackbar(`${updateExecutionState.error ?? t('archiveError', !isArchived)}`, {
          variant: 'error',
        });
      },
      onSettled: () => {
        setShowConfirmation(false);
        setIsUpdating(false);
      },
    },
  );

  const onArchiveConfirmClick = () => {
    updateExecutionState.mutate(
      isArchived ? ExecutionState.EXECUTION_ACTIVE : ExecutionState.EXECUTION_ARCHIVED,
    );
  };

  const columns = useWorkflowExecutionsTableColumns({
    showWorkflowName,
    onArchiveClick: () => setShowConfirmation(true),
    omitColumns,
  });

  const confirmation = useConfirmationSection({
    isArchived,
    isLoading: isUpdating,
    onCancel: () => {
      setShowConfirmation(false);
    },
    onConfirmClick: () => {
      onArchiveConfirmClick();
    },
  });
  // To hide the onHover action buttons,
  // we take off the last column which is onHover actions buttons
  const columnsWithApproval = [...[...columns].slice(0, -1), confirmation];

  // we show error info only on active items
  const { abortMetadata, error } = execution.closure;
  const showErrorInfo = !isArchived && (!!error || !!abortMetadata);

  useEffect(() => {
    if (hideItem) setHover(false);
  }, [hideItem]);

  if (hideItem) return null;

  return (
    <>
      <StyledExecutionRow
        showerrorinfo={showErrorInfo}
        className={`pointer ${showErrorInfo ? 'has-error' : ''} ${tableStyles.row} ${
          hover ? 'hover' : ''
        }`}
        onClick={(event) => {
          const url = Routes.ExecutionDetails.makeUrl(execution.id);
          event.preventDefault();
          if (event.nativeEvent.metaKey) {
            window.open(url, '_blank');
          } else {
            history.push(url);
          }
        }}
      >
        <CellRenderer
          hidden={showConfirmation}
          state={state}
          execution={execution}
          columns={columns}
        />
        <CellRenderer
          hidden={!showConfirmation}
          state={state}
          execution={execution}
          columns={columnsWithApproval}
        />
      </StyledExecutionRow>
      {showErrorInfo && (
        <StyledErrorRow>
          <TableCell colSpan={99}>
            <ExpandableExecutionError
              onExpandCollapse={onExpandCollapseError}
              initialExpansionState={errorExpanded}
              error={error}
              resourceId={execution.id}
              abortMetadata={abortMetadata ?? undefined}
            />
          </TableCell>
        </StyledErrorRow>
      )}
    </>
  );
};
