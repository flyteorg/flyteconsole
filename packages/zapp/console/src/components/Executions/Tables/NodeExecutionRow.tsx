import { CircularProgress, IconButton } from '@material-ui/core';
import { Admin } from 'flyteidl';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import classnames from 'classnames';
import { useTheme } from 'components/Theme/useTheme';
import { isEqual } from 'lodash';
import { NodeExecution } from 'models/Execution/types';
import * as React from 'react';
import { useContext, useState } from 'react';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { NodeExecutionsRequestConfigContext } from '../contexts';
import { useChildNodeExecutionGroupsQuery } from '../nodeExecutionQueries';
import { titleStrings } from './constants';
import { ExpandableExecutionError } from './ExpandableExecutionError';
import { NodeExecutionChildren } from './NodeExecutionChildren';
import { RowExpander } from './RowExpander';
import { selectedClassName, useExecutionTableStyles } from './styles';
import { calculateNodeExecutionRowLeftSpacing } from './utils';
import { DetailsPanelContext } from '../ExecutionDetails/DetailsPanelContext';
import { NodeExecutionColumnDefinition } from './types';

interface NodeExecutionRowProps {
  abortMetadata?: Admin.IAbortMetadata;
  columns: NodeExecutionColumnDefinition[];
  index: number;
  nodeExecution: NodeExecution;
  level?: number;
  style?: React.CSSProperties;
}

const ChildFetchErrorIcon: React.FC<{
  query: ReturnType<typeof useChildNodeExecutionGroupsQuery>;
}> = ({ query }) => {
  return query.isFetching ? (
    <CircularProgress size={24} />
  ) : (
    <IconButton
      disableRipple={true}
      disableTouchRipple={true}
      size="small"
      title={titleStrings.childGroupFetchFailed}
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        // prevent the parent row body onClick event trigger
        e.stopPropagation();
        query.refetch();
      }}
    >
      <ErrorOutline />
    </IconButton>
  );
};

/** Renders a NodeExecution as a row inside a `NodeExecutionsTable` */
export const NodeExecutionRow: React.FC<NodeExecutionRowProps> = ({
  abortMetadata,
  columns,
  nodeExecution,
  index,
  level = 0,
  style,
}) => {
  const theme = useTheme();
  const tableStyles = useExecutionTableStyles();
  const { selectedExecution, setSelectedExecution } = useContext(DetailsPanelContext);
  const requestConfig = useContext(NodeExecutionsRequestConfigContext);

  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // For the first level, we want the borders to span the entire table,
  // so we'll use padding to space the content. For nested rows, we want the
  // border to start where the content does, so we'll use margin.
  const spacingProp = level === 0 ? 'paddingLeft' : 'marginLeft';
  const rowContentStyle = {
    [spacingProp]: `${calculateNodeExecutionRowLeftSpacing(level, theme.spacing)}px`,
  };

  const childGroupsQuery = useChildNodeExecutionGroupsQuery(nodeExecution, requestConfig);
  const { data: childGroups = [] } = childGroupsQuery;

  const isExpandable = childGroups.length > 0;

  const selected = selectedExecution ? isEqual(selectedExecution, nodeExecution) : false;
  const { error } = nodeExecution.closure;

  const expanderContent = childGroupsQuery.error ? (
    <ChildFetchErrorIcon query={childGroupsQuery} />
  ) : isExpandable ? (
    <RowExpander expanded={expanded} onClick={toggleExpanded} />
  ) : null;

  const errorContent = error ? (
    <ExpandableExecutionError error={error} abortMetadata={abortMetadata} />
  ) : null;

  const extraContent = expanded ? (
    <div
      className={classnames(tableStyles.childrenContainer, {
        [tableStyles.borderBottom]: level === 0,
      })}
    >
      <NodeExecutionChildren columns={columns} childGroups={childGroups} level={level + 1} />
    </div>
  ) : null;

  // open the side panel for selected execution's detail
  // use null in case if there is no execution provided - when it is null, will close side panel
  const onClickRow = () =>
    nodeExecution.closure.phase !== NodeExecutionPhase.UNDEFINED &&
    setSelectedExecution(nodeExecution?.id ?? null);

  return (
    <div
      role="listitem"
      className={classnames(tableStyles.row, tableStyles.clickableRow, {
        [selectedClassName]: selected,
      })}
      style={style}
      onClick={onClickRow}
    >
      <div
        className={classnames(tableStyles.rowContent, {
          [tableStyles.borderBottom]: level === 0 || (level > 0 && expanded),
          [tableStyles.borderTop]: level > 0 && index > 0,
        })}
        style={rowContentStyle}
      >
        <div className={tableStyles.rowColumns}>
          <div className={classnames(tableStyles.rowColumn, tableStyles.expander)}>
            {expanderContent}
          </div>
          {columns.map(({ className, key: columnKey, cellRenderer }) => (
            <div key={columnKey} className={classnames(tableStyles.rowColumn, className)}>
              {cellRenderer({
                execution: nodeExecution,
              })}
            </div>
          ))}
        </div>
        {errorContent}
      </div>
      {extraContent}
    </div>
  );
};
