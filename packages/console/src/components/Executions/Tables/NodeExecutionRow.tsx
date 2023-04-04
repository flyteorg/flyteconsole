import React, { useContext, useEffect, useMemo } from 'react';
import classnames from 'classnames';
import { NodeExecution } from 'models/Execution/types';
import { dNode } from 'models/Graph/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { isExpanded } from 'components/WorkflowGraph/utils';
import { isEqual, keyBy } from 'lodash';
import { useTheme } from 'components/Theme/useTheme';
import { makeStyles } from '@material-ui/core';
import { useInView } from 'react-intersection-observer';
import { useQueryClient } from 'react-query';
import {
  grayedClassName,
  selectedClassName,
  useExecutionTableStyles,
} from './styles';
import { NodeExecutionColumnDefinition } from './types';
import {
  DetailsPanelContext,
  useDetailsPanel,
} from '../ExecutionDetails/DetailsPanelContext';
import { RowExpander } from './RowExpander';
import { calculateNodeExecutionRowLeftSpacing } from './utils';
import { isParentNode, nodeExecutionIsTerminal } from '../utils';
import { useNodeExecutionRow } from '../ExecutionDetails/useNodeExecutionRow';
import { NodeExecutionsById, NodeExecutionsByIdContext } from '../contexts';
import { ignoredNodeIds } from '../nodeExecutionQueries';
import { useNodeExecutionsById } from '../contextProvider/NodeExecutionDetails';

const useStyles = makeStyles(theme => ({
  [`${grayedClassName}`]: {
    color: `${theme.palette.grey[300]} !important`,
  },
  namesContainerExpander: {
    display: 'flex',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  leaf: {
    width: 30,
  },
}));

const checkEnableChildQuery =
  (
    childExecutions: NodeExecution[],
    nodeExecution: NodeExecution,
    nodeExecutionsById: NodeExecutionsById,
    node: dNode,
    inView: boolean,
  ) =>
  () => {
    // check that we fetched all children otherwise force fetch
    const missingChildren =
      isParentNode(nodeExecution) && !childExecutions.length;

    const childrenStillRunning = childExecutions?.some(
      c => !nodeExecutionIsTerminal(c),
    );

    const executionRunning = !nodeExecutionIsTerminal(nodeExecution);

    const forceRefetch =
      inView && (missingChildren || childrenStillRunning || executionRunning);

    // force fetch:
    // if parent's children haven't been fetched
    // if parent is still running or
    // if any childExecutions are still running
    return forceRefetch;
  };

interface NodeExecutionRowProps {
  columns: NodeExecutionColumnDefinition[];
  nodeExecution: NodeExecution;
  level?: number;
  style?: React.CSSProperties;
  node: dNode;
  onToggle: (id: string, scopeId: string, level: number) => void;
}

/** Renders a NodeExecution as a row inside a `NodeExecutionsTable` */
export const NodeExecutionRow: React.FC<NodeExecutionRowProps> = ({
  columns,
  nodeExecution,
  node,
  style,
  onToggle,
}) => {
  const queryClient = useQueryClient();
  const styles = useStyles();
  const theme = useTheme();
  const tableStyles = useExecutionTableStyles();

  const nodeLevel = node?.level ?? 0;

  // For the first level, we want the borders to span the entire table,
  // so we'll use padding to space the content. For nested rows, we want the
  // border to start where the content does, so we'll use margin.
  const spacingProp = nodeLevel === 0 ? 'paddingLeft' : 'marginLeft';
  const rowContentStyle = {
    [spacingProp]: `${calculateNodeExecutionRowLeftSpacing(
      nodeLevel,
      theme.spacing,
    )}px`,
  };

  const { nodeExecutionsById, setCurrentNodeExecutionsById } =
    useNodeExecutionsById();

  const childExecutions = useMemo(() => {
    const children = node?.nodes?.reduce((accumulator, currentValue) => {
      const potentialChild = nodeExecutionsById?.[currentValue?.scopedId];
      if (!ignoredNodeIds.includes(currentValue?.id) && potentialChild) {
        accumulator.push(potentialChild);
      }

      return accumulator;
    }, [] as NodeExecution[]);

    return children;
  }, [nodeExecutionsById, node]);

  const expanderRef = React.useRef<HTMLButtonElement>();
  const { ref, inView } = useInView();
  const shouldForceFetchChildren = useMemo(
    () =>
      checkEnableChildQuery(
        childExecutions,
        nodeExecution,
        nodeExecutionsById,
        node,
        inView,
      ),
    [nodeExecution, nodeExecutionsById, node, inView],
  );

  const { nodeExecutionRowQuery } = useNodeExecutionRow(
    queryClient,
    nodeExecution,
    shouldForceFetchChildren,
  );

  const { selectedExecution, setSelectedExecution } = useDetailsPanel();

  const selected = selectedExecution
    ? isEqual(selectedExecution, nodeExecution)
    : false;

  useEffect(() => {
    // don't update if still fetching
    if (nodeExecutionRowQuery.isFetching || !nodeExecutionRowQuery.data) {
      return;
    }

    const currentNodeExecutions = nodeExecutionRowQuery.data;
    const currentNodeExecutionsById = keyBy(currentNodeExecutions, 'scopedId');
    setCurrentNodeExecutionsById(currentNodeExecutionsById, true);
  }, [nodeExecutionRowQuery]);

  const expanderContent = React.useMemo(() => {
    const isParent = isParentNode(nodeExecution);
    const isExpandedVal = isExpanded(node);

    return isParent ? (
      <RowExpander
        ref={expanderRef as React.ForwardedRef<HTMLButtonElement>}
        expanded={isExpandedVal}
        onClick={() => {
          onToggle(node.id, node.scopedId, nodeLevel);
        }}
        disabled={!childExecutions?.length}
      />
    ) : (
      <div className={styles.leaf} />
    );
  }, [node, nodeLevel, nodeExecution, childExecutions]);

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
      ref={ref}
    >
      <div className={tableStyles.borderBottom} style={rowContentStyle}>
        <div className={tableStyles.rowColumns}>
          <div
            className={classnames(
              tableStyles.rowColumn,
              tableStyles.expander,
              node.grayedOut ? grayedClassName : '',
            )}
          >
            <div className={styles.namesContainerExpander}>
              {expanderContent}
            </div>
          </div>
          {columns.map(({ className, key: columnKey, cellRenderer }) => (
            <div
              key={columnKey}
              className={classnames(
                tableStyles.rowColumn,
                className,
                node.grayedOut ? grayedClassName : '',
              )}
            >
              {cellRenderer({
                node,
                execution: nodeExecution,
                className: node.grayedOut ? tableStyles.grayed : '',
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
