import classnames from 'classnames';
import { Admin } from 'flyteidl';
import { getCacheKey } from 'components/Cache/utils';
import { useCommonStyles } from 'components/common/styles';
import * as scrollbarSize from 'dom-helpers/util/scrollbarSize';
import { NodeExecution, NodeExecutionIdentifier } from 'models/Execution/types';
import { dNode } from 'models/Graph/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { dateToTimestamp } from 'common/utils';
import * as React from 'react';
import { useMemo, useEffect, useState, useContext } from 'react';
import { NodeExecutionsTableContext } from './contexts';
import { ExecutionsTableHeader } from './ExecutionsTableHeader';
import { generateColumns } from './nodeExecutionColumns';
import { NodeExecutionRow } from './NodeExecutionRow';
import { NoExecutionsContent } from './NoExecutionsContent';
import { useColumnStyles, useExecutionTableStyles } from './styles';
import { NodeExecutionsByIdContext } from '../contexts';
import { useNodeExecutionFiltersState } from '../filters/useExecutionFiltersState';

export interface NodeExecutionsTableProps {
  setSelectedExecution: (execution: NodeExecutionIdentifier | null) => void;
  selectedExecution: NodeExecutionIdentifier | null;
  abortMetadata?: Admin.IAbortMetadata;
  initialNodes: dNode[];
  filteredNodeExecutions: NodeExecution[];
}

const scrollbarPadding = scrollbarSize();

/** Renders a table of NodeExecution records. Executions with errors will
 * have an expanadable container rendered as part of the table row.
 * NodeExecutions are expandable and will potentially render a list of child
 * TaskExecutions
 */
export const NodeExecutionsTable: React.FC<NodeExecutionsTableProps> = ({
  setSelectedExecution,
  selectedExecution,
  abortMetadata,
  initialNodes,
  filteredNodeExecutions,
}) => {
  const [nodeExecutions, setNodeExecutions] = useState<NodeExecution[]>([]);
  const commonStyles = useCommonStyles();
  const tableStyles = useExecutionTableStyles();
  const nodeExecutionsById = useContext(NodeExecutionsByIdContext);
  const filterState = useNodeExecutionFiltersState();

  useEffect(() => {
    if (nodeExecutionsById) {
      const executions: NodeExecution[] = [...filteredNodeExecutions];
      if (!filterState.appliedFilters?.length) {
        initialNodes.forEach((node) => {
          if (!nodeExecutionsById[node.scopedId]) {
            executions.push({
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
            });
          }
        });
      }
      setNodeExecutions(executions);
    }
  }, [nodeExecutionsById, initialNodes, filteredNodeExecutions]);

  const executionsWithKeys = useMemo(
    () =>
      nodeExecutions.map((nodeExecution) => ({
        nodeExecution,
        cacheKey: getCacheKey(nodeExecution.id),
      })),
    [nodeExecutions],
  );

  const columnStyles = useColumnStyles();
  // Memoizing columns so they won't be re-generated unless the styles change
  const columns = useMemo(() => generateColumns(columnStyles), [columnStyles]);
  const tableContext = useMemo(
    () => ({ columns, state: { selectedExecution, setSelectedExecution } }),
    [columns, selectedExecution, setSelectedExecution],
  );

  const rowProps = {
    selectedExecution,
    setSelectedExecution,
  };
  return (
    <div className={classnames(tableStyles.tableContainer, commonStyles.flexFill)}>
      <ExecutionsTableHeader columns={columns} scrollbarPadding={scrollbarPadding} />
      <NodeExecutionsTableContext.Provider value={tableContext}>
        <div className={tableStyles.scrollContainer}>
          {executionsWithKeys.length > 0 ? (
            executionsWithKeys.map(({ nodeExecution, cacheKey }, index) => {
              return (
                <NodeExecutionRow
                  {...rowProps}
                  abortMetadata={abortMetadata}
                  index={index}
                  key={cacheKey}
                  execution={nodeExecution}
                />
              );
            })
          ) : (
            <NoExecutionsContent size="large" />
          )}
        </div>
      </NodeExecutionsTableContext.Provider>
    </div>
  );
};
