import classnames from 'classnames';
import { NodeExecution } from 'models/Execution/types';
import { dNode } from 'models/Graph/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import React, { useContext, useEffect } from 'react';
import { isExpanded } from 'components/WorkflowGraph/utils';
import { isEqual } from 'lodash';
import { useTheme } from 'components/Theme/useTheme';
import { makeStyles } from '@material-ui/core';
import { LoadingSpinner } from 'components/common/LoadingSpinner';
import { useInView } from 'react-intersection-observer';
import { selectedClassName, useExecutionTableStyles } from './styles';
import { NodeExecutionColumnDefinition } from './types';
import { DetailsPanelContext } from '../ExecutionDetails/DetailsPanelContext';
import { RowExpander } from './RowExpander';
import { calculateNodeExecutionRowLeftSpacing } from './utils';
import { isParentNode, nodeExecutionIsTerminal } from '../utils';
import { useNodeExecutionRow } from '../ExecutionDetails/useNodeExecutionRow';
import { SetCurrentNodeExecutionsById } from '../contexts';

const useStyles = makeStyles(() => ({
  namesContainerExpander: {
    display: 'flex',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  leaf: {
    width: 30,
  },
}));

interface NodeExecutionRowProps {
  columns: NodeExecutionColumnDefinition[];
  nodeExecution: NodeExecution;
  level?: number;
  style?: React.CSSProperties;
  node: dNode;
  onToggle: (id: string, scopeId: string, level: number) => void;
  setShouldUpdate: (val: boolean) => void;
  setCurrentNodeExecutionsById: SetCurrentNodeExecutionsById;
}

/** Renders a NodeExecution as a row inside a `NodeExecutionsTable` */
export const NodeExecutionRow: React.FC<NodeExecutionRowProps> = ({
  columns,
  nodeExecution,
  node,
  style,
  onToggle,
  setShouldUpdate,
  setCurrentNodeExecutionsById,
}) => {
  const styles = useStyles();
  const theme = useTheme();
  const expanderRef = React.useRef<HTMLButtonElement>();
  const { ref, inView } = useInView();

  const { nodeExecutionRowQuery } = useNodeExecutionRow(nodeExecution, inView);

  useEffect(() => {
    // don't update if still fetching
    if (nodeExecutionRowQuery.isFetching) {
      return;
    }

    const currentNodeExecutionsById = nodeExecutionRowQuery.data;
    setShouldUpdate(true);
    setCurrentNodeExecutionsById({
      [nodeExecution.scopedId!]: currentNodeExecutionsById!,
    });
  }, [nodeExecutionRowQuery]);

  const tableStyles = useExecutionTableStyles();
  const { selectedExecution, setSelectedExecution } =
    useContext(DetailsPanelContext);

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

  const selected = selectedExecution
    ? isEqual(selectedExecution, nodeExecution)
    : false;

  const expanderContent = React.useMemo(() => {
    const isParent = isParentNode(nodeExecution);
    const isExpandedVal = isExpanded(node);
    return !isParent && !nodeExecutionIsTerminal(nodeExecution) ? (
      <LoadingSpinner size="small" />
    ) : isParent ? (
      <RowExpander
        ref={expanderRef as React.ForwardedRef<HTMLButtonElement>}
        expanded={isExpandedVal}
        onClick={() => {
          onToggle(node.id, node.scopedId, nodeLevel);
        }}
      />
    ) : (
      <div className={styles.leaf} />
    );
  }, [node, nodeLevel]);

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
            className={classnames(tableStyles.rowColumn, tableStyles.expander)}
          >
            <div className={styles.namesContainerExpander}>
              {expanderContent}
            </div>
          </div>
          {columns.map(({ className, key: columnKey, cellRenderer }) => (
            <div
              key={columnKey}
              className={classnames(tableStyles.rowColumn, className)}
            >
              {cellRenderer({
                node,
                execution: nodeExecution,
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
