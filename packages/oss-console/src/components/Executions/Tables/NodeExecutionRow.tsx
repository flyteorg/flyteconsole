import React, { forwardRef, useMemo } from 'react';
import classnames from 'classnames';
import isEqual from 'lodash/isEqual';
import styled from '@mui/system/styled';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { useTheme } from '@mui/material/styles';
import { isExpanded } from '../../../models/Node/utils';
import { NodeExecutionPhase } from '../../../models/Execution/enums';
import { dNode } from '../../../models/Graph/types';
import { selectedClassName, useExecutionTableStyles } from './styles';
import { NodeExecutionColumnDefinition } from './types';
import { useDetailsPanel } from '../ExecutionDetails/DetailsPanelContext';
import { RowExpander } from './RowExpander';
import { isParentNode } from '../utils';
import { useNodeExecutionDynamicContext } from '../contextProvider/NodeExecutionDetails/NodeExecutionDynamicProvider';
import { calculateNodeExecutionRowLeftSpacing } from './utils';
import { useNodeExecutionsById } from '../contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';

const Leaf = styled('div')(() => ({
  width: '34px',
  height: '34px',
}));

interface NodeExecutionRowProps {
  columns: NodeExecutionColumnDefinition[];
  style?: React.CSSProperties;
  node: dNode;
  onToggle: (node: dNode) => void;
}

const NodeExecutionRowExpander = forwardRef(
  (
    props: {
      node: dNode;
      nodeLevel: number;
      spacingProp: 'paddingLeft' | 'marginLeft';
      onToggle: (node: dNode) => void;
    },
    ref,
  ) => {
    const theme = useTheme();
    const { nodeExecutionsById } = useNodeExecutionsById();
    const { node, onToggle, spacingProp } = props;
    const { level = 0 } = node;
    const execution = nodeExecutionsById[node?.scopedId];
    const isParent = execution ? isParentNode(execution) : false;
    const hasChildren = node.nodes?.length > 0;
    const isExpandedVal = isExpanded(node);

    const stillLoading = isParent && !hasChildren;
    return (
      <Grid
        item
        sx={{
          minHeight: '62px',
          borderBottom: (theme) => (level === 0 ? `1px solid ${theme.palette.divider}` : 'none'),
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        <Box
          sx={{
            [spacingProp]: calculateNodeExecutionRowLeftSpacing(level, theme.spacing),
            display: 'flex',
            alignItems: 'stretch',
            // borderLeft: (theme) => `1px dashed ${theme.palette.common.grays[40]}`,
          }}
        >
          {isParent ? (
            <RowExpander
              ref={ref as React.ForwardedRef<HTMLButtonElement>}
              isLoading={stillLoading}
              expanded={isExpandedVal}
              onClick={() => {
                onToggle(node);
              }}
              data-testid="expander"
              disabled={!hasChildren}
            />
          ) : (
            <Leaf />
          )}
        </Box>
      </Grid>
    );
  },
);

/** Renders a NodeExecution as a row inside a `NodeExecutionsTable` */
export const NodeExecutionRow: React.FC<NodeExecutionRowProps> = ({
  columns,
  node,
  style,
  onToggle,
}) => {
  const tableStyles = useExecutionTableStyles();
  const { componentProps } = useNodeExecutionDynamicContext();
  const { nodeExecutionsById } = useNodeExecutionsById();

  const execution = nodeExecutionsById[node?.scopedId];
  const nodeLevel = node?.level ?? 0;

  // For the first level, we want the borders to span the entire table,
  // so we'll use padding to space the content. For nested rows, we want the
  // border to start where the content does, so we'll use margin.
  const spacingProp = nodeLevel === 0 ? 'paddingLeft' : 'marginLeft';

  const expanderRef = React.useRef<HTMLButtonElement>();

  const { selectedExecution, setSelectedExecution } = useDetailsPanel();

  const selected = selectedExecution ? isEqual(selectedExecution, execution?.id) : false;

  const filteredColumns: NodeExecutionColumnDefinition[] = useMemo(
    () => columns.filter((c) => c.key !== 'name'),
    [columns],
  );

  const nameColumn: NodeExecutionColumnDefinition | null = useMemo(
    () => columns.find((c) => c.key === 'name') || null,
    [columns],
  );

  // open the side panel for selected execution's detail
  // use null in case if there is no execution provided - when it is null, will close side panel
  const onClickRow = () =>
    execution?.closure.phase !== NodeExecutionPhase.UNDEFINED &&
    setSelectedExecution(execution?.id ?? null);

  return (
    <>
      <TableRow
        onClick={onClickRow}
        className={classnames(tableStyles.row, tableStyles.clickableRow, {
          [selectedClassName]: selected,
        })}
        key={node.scopedId}
        style={style}
        sx={{
          minHeight: '62px',
          // backgroundColor: (theme) => `${theme.palette.common.grays[40]}${nodeColorVariant}`,
        }}
        data-testid="node-execution-row"
        {...componentProps}
      >
        <TableCell
          sx={{
            padding: 0,
            minWidth: 0,
            borderBottom: 'none',
            minHeight: '62px',
          }}
        >
          <Box sx={{ width: '100%' }}>
            <Grid
              container
              justifyContent="flex-start"
              alignItems="center"
              sx={{ flexWrap: 'nowrap', maxWidth: '100%', minHeight: '62px' }}
            >
              <NodeExecutionRowExpander
                ref={expanderRef}
                {...{ node, nodeLevel, onToggle, spacingProp }}
              />
              {/* NAME */}
              <Grid
                item
                sx={{
                  padding: (theme) => theme.spacing(0.75, 2),
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                  flexGrow: 1,
                  height: '100%',
                  width: (theme) => `calc(100% - ${theme.spacing(4)})`,
                  minWidth: 0, // prevents fex traveling into adjacent column
                  minHeight: '62px',
                  display: 'flex',
                  alignItems: 'center',
                  '& div': {
                    width: '100%',
                  },
                }}
              >
                {nameColumn &&
                  nameColumn?.cellRenderer({
                    node,
                    className: node.grayedOut ? tableStyles.grayedClassName : '',
                  })}
              </Grid>
            </Grid>
          </Box>
        </TableCell>
        {filteredColumns.map(({ className, key: columnKey, cellRenderer }) => (
          <TableCell key={columnKey} className={className}>
            {cellRenderer({
              node,
              className: node.grayedOut ? tableStyles.grayedClassName : '',
            })}
          </TableCell>
        ))}
      </TableRow>
    </>
  );
};
