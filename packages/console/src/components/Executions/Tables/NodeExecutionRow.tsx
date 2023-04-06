import React from 'react';
import classnames from 'classnames';
import { NodeExecution } from 'models/Execution/types';
import { dNode } from 'models/Graph/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { isEqual } from 'lodash';
import { useTheme } from 'components/Theme/useTheme';
import { makeStyles } from '@material-ui/core';
import { ignoredNodeIds } from 'models/Node/constants';
import { isExpanded } from 'models/Node/utils';
import {
  grayedClassName,
  selectedClassName,
  useExecutionTableStyles,
} from './styles';
import { NodeExecutionColumnDefinition } from './types';
import { useDetailsPanel } from '../ExecutionDetails/DetailsPanelContext';
import { RowExpander } from './RowExpander';
import { calculateNodeExecutionRowLeftSpacing } from './utils';
import { isParentNode } from '../utils';
import { useNodeExecutionsById } from '../contextProvider/NodeExecutionDetails';
import { useNodeExecutionDynamicContext } from '../contextProvider/NodeExecutionDetails/NodeExecutionDynamicProvider';

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

interface NodeExecutionRowProps {
  columns: NodeExecutionColumnDefinition[];
  level?: number;
  style?: React.CSSProperties;
  node: dNode;
  onToggle: (id: string, scopeId: string, level: number) => void;
}

/** Renders a NodeExecution as a row inside a `NodeExecutionsTable` */
export const NodeExecutionRow: React.FC<NodeExecutionRowProps> = ({
  columns,
  node,
  style,
  onToggle,
}) => {
  const styles = useStyles();
  const theme = useTheme();
  const tableStyles = useExecutionTableStyles();
  const { childCount, nodeExecution, componentProps } =
    useNodeExecutionDynamicContext();
  // const key = getCacheKey(nodeExecution.id);
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

  const expanderRef = React.useRef<HTMLButtonElement>();

  const { selectedExecution, setSelectedExecution } = useDetailsPanel();

  const selected = selectedExecution
    ? isEqual(selectedExecution, nodeExecution)
    : false;

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
        disabled={!childCount}
      />
    ) : (
      <div className={styles.leaf} />
    );
  }, [node, nodeLevel, nodeExecution, childCount]);

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
      {...componentProps}
      key={node.scopedId}
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
