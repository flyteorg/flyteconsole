import React, { CSSProperties, FC, useMemo } from 'react';
import TableCell from '@mui/material/TableCell';
import styled from '@mui/system/styled';
import Radio from '@mui/material/Radio';
import classnames from 'classnames';
import TableRow from '@mui/material/TableRow';
import { useQueryClient } from 'react-query';
import { SortDirection } from '@clients/common/types/adminEntityTypes';
import { Workflow } from '../../../models/Workflow/types';
import { useWorkflowExecutions } from '../../hooks/useWorkflowExecutions';
import { executionSortFields } from '../../../models/Execution/constants';
import { executionFilterGenerator } from '../../Entities/generators';
import { ResourceIdentifier } from '../../../models/Common/types';
import { useWorkflowVersionsColumnStyles } from './styles';
import { WorkflowExecutionsTableState, WorkflowVersionColumnDefinition } from './types';

const WorkflowVersionRowContainer = styled(TableRow)(() => ({
  cursor: 'pointer',
}));

export interface WorkflowVersionRowProps {
  columns: WorkflowVersionColumnDefinition[];
  workflow: Workflow;
  state: WorkflowExecutionsTableState;
  onClick: (() => void) | undefined;
  versionView?: boolean;
  isChecked?: boolean;
}

/**
 * Renders a single `Workflow` record as a row. Designed to be used as a child
 * of `WorkflowVersionsTable`.
 * @param columns
 * @param workflow
 * @param state
 * @param style
 * @param onClick
 * @param versionView
 * @param isChecked
 * @constructor
 */
export const WorkflowVersionRow: FC<WorkflowVersionRowProps & { style?: CSSProperties }> = ({
  columns,
  workflow,
  state,
  style,
  onClick,
  versionView = false,
  isChecked = false,
}) => {
  const queryClient = useQueryClient();
  const versionTableStyles = useWorkflowVersionsColumnStyles();

  const sort = {
    key: executionSortFields.createdAt,
    direction: SortDirection.DESCENDING,
  };

  const baseFilters = useMemo(
    () =>
      workflow.id.resourceType
        ? executionFilterGenerator[workflow.id.resourceType](
            workflow.id as ResourceIdentifier,
            workflow.id.version,
          )
        : [],
    [workflow.id.version],
  );

  const executions = useWorkflowExecutions(
    queryClient,
    {
      domain: workflow.id.domain,
      project: workflow.id.project,
      version: workflow.id.version,
    },
    {
      sort,
      filter: baseFilters,
      limit: 10,
    },
  );

  return (
    <WorkflowVersionRowContainer className={classnames('row')} style={style} onClick={onClick}>
      {versionView && (
        <TableCell
          classes={{
            root: 'cell',
          }}
          className={versionTableStyles.columnRadioButton}
        >
          <Radio checked={isChecked} />
        </TableCell>
      )}
      {columns.map(({ className, key: columnKey, cellRenderer }) => (
        <TableCell
          key={columnKey}
          classes={{
            root: 'cell',
          }}
          className={classnames(className)}
        >
          {cellRenderer({
            workflow,
            state,
            executions,
          })}
        </TableCell>
      ))}
    </WorkflowVersionRowContainer>
  );
};
