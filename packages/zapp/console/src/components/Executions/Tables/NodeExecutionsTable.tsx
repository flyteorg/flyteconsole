import classnames from 'classnames';
import { getCacheKey } from 'components/Cache/utils';
import { useCommonStyles } from 'components/common/styles';
import * as scrollbarSize from 'dom-helpers/util/scrollbarSize';
import { NodeExecution } from 'models/Execution/types';
import { dNode } from 'models/Graph/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { dateToTimestamp } from 'common/utils';
import * as React from 'react';
import { useMemo, useEffect, useState, useContext } from 'react';
import { isEndNode, isExpanded, isStartNode } from 'components/WorkflowGraph/utils';
import { isEqual } from 'lodash';
import { useTheme } from 'components/Theme/useTheme';
import { makeStyles } from '@material-ui/core';
import { ExecutionsTableHeader } from './ExecutionsTableHeader';
import { generateColumns } from './nodeExecutionColumns';
// import { NodeExecutionRow } from './NodeExecutionRow';
import { NoExecutionsContent } from './NoExecutionsContent';
import { selectedClassName, useColumnStyles, useExecutionTableStyles } from './styles';
import { NodeExecutionsByIdContext } from '../contexts';
import { convertToPlainNodes } from '../ExecutionDetails/Timeline/helpers';
import { NodeExecutionColumnDefinition } from './types';
import { DetailsPanelContext } from '../ExecutionDetails/DetailsPanelContext';
import { RowExpander } from './RowExpander';
import { calculateNodeExecutionRowLeftSpacing } from './utils';
import { useNodeExecutionContext } from '../contextProvider/NodeExecutionDetails';

export interface NodeExecutionsTableProps {
  initialNodes: dNode[];
}

const scrollbarPadding = scrollbarSize();

/** Renders a table of NodeExecution records. Executions with errors will
 * have an expanadable container rendered as part of the table row.
 * NodeExecutions are expandable and will potentially render a list of child
 * TaskExecutions
 */
export const NodeExecutionsTable: React.FC<NodeExecutionsTableProps> = ({ initialNodes }) => {
  const commonStyles = useCommonStyles();
  const tableStyles = useExecutionTableStyles();
  const nodeExecutionsById = useContext(NodeExecutionsByIdContext);
  const [originalNodes, setOriginalNodes] = useState<dNode[]>(initialNodes);
  const [showNodes, setShowNodes] = useState<dNode[]>([]);
  const { compiledWorkflowClosure } = useNodeExecutionContext();

  const columnStyles = useColumnStyles();
  // Memoizing columns so they won't be re-generated unless the styles change
  const columns = useMemo(
    () => generateColumns(columnStyles, compiledWorkflowClosure?.primary.template.nodes ?? []),
    [columnStyles],
  );

  useEffect(() => {
    const plainNodes = convertToPlainNodes(originalNodes);
    const updatedShownNodesMap = plainNodes.map((node) => {
      const execution = nodeExecutionsById[node.scopedId];
      return {
        ...node,
        startedAt: execution?.closure.startedAt,
        execution,
      };
    });
    setShowNodes(updatedShownNodesMap);
  }, [originalNodes, nodeExecutionsById]);

  const toggleNode = (id: string, scopeId: string, level: number) => {
    const searchNode = (nodes: dNode[], nodeLevel: number) => {
      if (!nodes || nodes.length === 0) {
        return;
      }
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isStartNode(node) || isEndNode(node)) {
          continue;
        }
        if (node.id === id && node.scopedId === scopeId && nodeLevel === level) {
          nodes[i].expanded = !nodes[i].expanded;
          return;
        }
        if (node.nodes.length > 0 && isExpanded(node)) {
          searchNode(node.nodes, nodeLevel + 1);
        }
      }
    };
    searchNode(originalNodes, 0);
    setOriginalNodes([...originalNodes]);
  };

  return (
    <div className={classnames(tableStyles.tableContainer, commonStyles.flexFill)}>
      <ExecutionsTableHeader columns={columns} scrollbarPadding={scrollbarPadding} />
      <div className={tableStyles.scrollContainer}>
        {showNodes.length > 0 ? (
          showNodes.map((node, index) => {
            let nodeExecution: NodeExecution;
            if (nodeExecutionsById[node.scopedId]) {
              nodeExecution = nodeExecutionsById[node.scopedId];
            } else {
              nodeExecution = {
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
              };
            }
            return (
              // <NodeExecutionRow
              //   columns={columns}
              //   index={index}
              //   key={getCacheKey(nodeExecution.id)}
              //   nodeExecution={nodeExecution}
              //   node={node}
              //   onToggle={toggleNode}
              // />
              <Row
                columns={columns}
                index={index}
                key={getCacheKey(nodeExecution.id)}
                nodeExecution={nodeExecution}
                node={node}
                onToggle={toggleNode}
              />
            );
          })
        ) : (
          <NoExecutionsContent size="large" />
        )}
      </div>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  // taskNamesList: {
  //   overflowY: 'scroll',
  //   flex: 1,
  // },
  // namesContainer: {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   alignItems: 'flex-start',
  //   justifyContent: 'left',
  //   padding: '0 10px',
  //   height: 56,
  //   width: 256,
  //   borderBottom: `1px solid ${theme.palette.divider}`,
  //   whiteSpace: 'nowrap',
  // },
  namesContainerExpander: {
    display: 'flex',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  // namesContainerBody: {
  //   display: 'flex',
  //   flexDirection: 'column',
  //   alignItems: 'flex-start',
  //   justifyContent: 'center',
  //   whiteSpace: 'nowrap',
  //   height: '100%',
  //   overflow: 'hidden',
  // },
  leaf: {
    width: 30,
  },
}));

interface RowProps {
  columns: NodeExecutionColumnDefinition[];
  index: number;
  nodeExecution: NodeExecution;
  level?: number;
  style?: React.CSSProperties;
  node: dNode;
  onToggle: (id: string, scopeId: string, level: number) => void;
}

/** Renders a NodeExecution as a row inside a `NodeExecutionsTable` */
export const Row: React.FC<RowProps> = ({
  columns,
  nodeExecution,
  node,
  index,
  style,
  onToggle,
}) => {
  const styles = useStyles();
  const theme = useTheme();
  const tableStyles = useExecutionTableStyles();
  const { selectedExecution, setSelectedExecution } = useContext(DetailsPanelContext);

  const nodeLevel = node?.level ?? 0;
  const [expanded] = useState(false);

  // For the first level, we want the borders to span the entire table,
  // so we'll use padding to space the content. For nested rows, we want the
  // border to start where the content does, so we'll use margin.
  const spacingProp = nodeLevel === 0 ? 'paddingLeft' : 'marginLeft';
  const rowContentStyle = {
    [spacingProp]: `${calculateNodeExecutionRowLeftSpacing(nodeLevel, theme.spacing)}px`,
  };

  const selected = selectedExecution ? isEqual(selectedExecution, nodeExecution) : false;

  const expanderContent = (
    <div className={styles.namesContainerExpander}>
      {node.nodes?.length ? (
        <RowExpander
          expanded={node.expanded || false}
          onClick={() => onToggle(node.id, node.scopedId, nodeLevel)}
        />
      ) : (
        <div className={styles.leaf} />
      )}
    </div>
  );

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
          [tableStyles.borderBottom]: nodeLevel === 0 || (nodeLevel > 0 && expanded),
          [tableStyles.borderTop]: nodeLevel > 0 && index > 0,
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
      </div>
    </div>
  );
};
