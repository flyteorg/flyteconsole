import React from 'react';
import classnames from 'classnames';
import { dNode } from 'models/Graph/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { isEqual } from 'lodash';
import { useTheme } from 'components/Theme/useTheme';
import { makeStyles } from '@material-ui/core';
import { isExpanded } from 'models/Node/utils';
import { dateToTimestamp } from 'common/utils';
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
  const { childCount, componentProps } = useNodeExecutionDynamicContext();
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
    ? isEqual(selectedExecution, node.execution?.id)
    : false;

  const expanderContent = React.useMemo(() => {
    const isParent = node?.execution ? isParentNode(node.execution) : false;
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
  }, [node, nodeLevel, node.execution, childCount]);

  // open the side panel for selected execution's detail
  // use null in case if there is no execution provided - when it is null, will close side panel
  const onClickRow = () =>
    node?.execution?.closure.phase !== NodeExecutionPhase.UNDEFINED &&
    setSelectedExecution(node.execution?.id ?? null);

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
                execution: node.execution || {
                  closure: {
                    createdAt: dateToTimestamp(new Date()),
                    outputUri: '',
                    phase: NodeExecutionPhase.UNDEFINED,
                  },
                  id: {
                    executionId: {
                      domain: node.value?.taskNode?.referenceId?.domain,
                      name: node.value?.taskNode?.referenceId?.name,
                      project: node.value?.taskNode?.referenceId?.project,
                    },
                    nodeId: node.id,
                  },
                  inputUri: '',
                  scopedId: node.scopedId,
                },
                className: node.grayedOut ? tableStyles.grayed : '',
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
