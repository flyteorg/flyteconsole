import classnames from 'classnames';
import { getCacheKey } from 'components/Cache/utils';
import { useCommonStyles } from 'components/common/styles';
import scrollbarSize from 'dom-helpers/scrollbarSize';
import { NodeExecution } from 'models/Execution/types';
import { dNode } from 'models/Graph/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { dateToTimestamp } from 'common/utils';
import React, { useMemo, useEffect, useState, useContext } from 'react';
import { useQueryClient } from 'react-query';
import { merge, eq } from 'lodash';
import { extractCompiledNodes } from 'components/hooks/utils';
import { ExecutionsTableHeader } from './ExecutionsTableHeader';
import { generateColumns } from './nodeExecutionColumns';
import { NoExecutionsContent } from './NoExecutionsContent';
import { useColumnStyles, useExecutionTableStyles } from './styles';
import { NodeExecutionsByIdContext } from '../contexts';
import { convertToPlainNodes } from '../ExecutionDetails/Timeline/helpers';
import { useNodeExecutionContext } from '../contextProvider/NodeExecutionDetails';
import { NodeExecutionRow } from './NodeExecutionRow';
import { useNodeExecutionFiltersState } from '../filters/useExecutionFiltersState';
import { fetchChildrenExecutions, isParentNode, searchNode } from '../utils';

interface NodeExecutionsTableProps {
  initialNodes: dNode[];
  filteredNodes?: dNode[];
  shouldUpdate?: boolean;
  setShouldUpdate: (val: boolean) => void;
}

const scrollbarPadding = scrollbarSize();

/**
 * TODO
 * Refactor to avoid code duplication here and in ExecutionTimeline, ie toggleNode, the insides of the effect
 */

/** Renders a table of NodeExecution records. Executions with errors will
 * have an expanadable container rendered as part of the table row.
 * NodeExecutions are expandable and will potentially render a list of child
 * TaskExecutions
 */
export const NodeExecutionsTable: React.FC<NodeExecutionsTableProps> = ({
  initialNodes,
  filteredNodes,
  setShouldUpdate,
}) => {
  const commonStyles = useCommonStyles();
  const tableStyles = useExecutionTableStyles();
  const queryClient = useQueryClient();
  const { nodeExecutionsById, setCurrentNodeExecutionsById } = useContext(
    NodeExecutionsByIdContext,
  );
  const { appliedFilters } = useNodeExecutionFiltersState();
  const [originalNodes, setOriginalNodes] = useState<dNode[]>(
    appliedFilters.length > 0 && filteredNodes ? filteredNodes : initialNodes,
  );
  const [showNodes, setShowNodes] = useState<dNode[]>([]);
  const { compiledWorkflowClosure } = useNodeExecutionContext();

  const columnStyles = useColumnStyles();
  // Memoizing columns so they won't be re-generated unless the styles change
  const compiledNodes = extractCompiledNodes(compiledWorkflowClosure);
  const columns = useMemo(
    () => generateColumns(columnStyles, compiledNodes),
    [columnStyles, compiledNodes],
  );

  useEffect(() => {
    setOriginalNodes(ogn => {
      const newNodes =
        appliedFilters.length > 0 && filteredNodes
          ? filteredNodes
          : merge(initialNodes, ogn);

      if (!eq(newNodes, ogn)) {
        return newNodes;
      }

      return ogn;
    });

    const plainNodes = convertToPlainNodes(originalNodes);
    const updatedShownNodesMap = plainNodes
      .map(node => {
        const execution = nodeExecutionsById[node.scopedId];
        return {
          ...node,
          startedAt: execution?.closure.startedAt,
          execution,
        };
      })
      .filter(n => !!n?.execution);
    setShowNodes(updatedShownNodesMap);
  }, [initialNodes, filteredNodes, originalNodes, nodeExecutionsById]);

  const toggleNode = async (id: string, scopedId: string, level: number) => {
    await fetchChildrenExecutions(
      queryClient,
      scopedId,
      nodeExecutionsById,
      setCurrentNodeExecutionsById,
      setShouldUpdate,
    );
    searchNode(originalNodes, 0, id, scopedId, level);
    setOriginalNodes([...originalNodes]);
  };

  const parentNodeCallback = async (
    nodeExecution: NodeExecution,
    node: dNode,
  ) => {
    if (!isParentNode(nodeExecution)) {
      return;
    }

    const { scopedId } = node;
    await fetchChildrenExecutions(
      queryClient,
      scopedId,
      nodeExecutionsById,
      setCurrentNodeExecutionsById,
      // pass undefined to setShouldUpdate
      undefined,
      // force updates
      true,
    );
  };

  return (
    <div
      className={classnames(tableStyles.tableContainer, commonStyles.flexFill)}
    >
      <ExecutionsTableHeader
        columns={columns}
        scrollbarPadding={scrollbarPadding}
      />
      <div className={tableStyles.scrollContainer}>
        {showNodes.length > 0 ? (
          showNodes.map(node => {
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
              <NodeExecutionRow
                columns={columns}
                key={getCacheKey(nodeExecution.id)}
                nodeExecution={nodeExecution}
                node={node}
                onToggle={toggleNode}
                parentNodeCallback={parentNodeCallback}
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
