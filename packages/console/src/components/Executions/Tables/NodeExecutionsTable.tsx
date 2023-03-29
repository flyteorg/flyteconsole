import classnames from 'classnames';
import { getCacheKey } from 'components/Cache/utils';
import { useCommonStyles } from 'components/common/styles';
import scrollbarSize from 'dom-helpers/scrollbarSize';
import { NodeExecution } from 'models/Execution/types';
import { dNode } from 'models/Graph/types';
import React, { useMemo, useEffect, useState, useContext } from 'react';
import { useQueryClient } from 'react-query';
import { merge, eq } from 'lodash';
import { ExecutionsTableHeader } from './ExecutionsTableHeader';
import { generateColumns } from './nodeExecutionColumns';
import { NoExecutionsContent } from './NoExecutionsContent';
import { useColumnStyles, useExecutionTableStyles } from './styles';
import { NodeExecutionsByIdContext } from '../contexts';
import { convertToPlainNodes } from '../ExecutionDetails/Timeline/helpers';
import { useNodeExecutionContext } from '../contextProvider/NodeExecutionDetails';
import { NodeExecutionRow } from './NodeExecutionRow';
import { useNodeExecutionFiltersState } from '../filters/useExecutionFiltersState';
import { fetchChildrenExecutions, searchNode } from '../utils';

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
  const columns = useMemo(
    () =>
      generateColumns(
        columnStyles,
        compiledWorkflowClosure?.primary.template.nodes ?? [],
      ),
    [columnStyles],
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
    const updatedShownNodesMap = plainNodes.map(node => {
      const execution = nodeExecutionsById[node.scopedId];
      return {
        ...node,
        startedAt: execution?.closure.startedAt,
        execution,
      };
    });
    setShowNodes(updatedShownNodesMap);
  }, [initialNodes, filteredNodes, originalNodes, nodeExecutionsById]);

  const transformedShowNodes = React.useMemo(() => {
    return showNodes
      ?.map(node => {
        let nodeExecution: NodeExecution | null;
        if (nodeExecutionsById[node.scopedId]) {
          nodeExecution = nodeExecutionsById[node.scopedId];
        } else {
          nodeExecution = null;
        }
        return { nodeExecution, dNode: node };
      })
      .filter(v => !!v.nodeExecution);
  }, [showNodes]);

  const toggleNode = async (id: string, scopedId: string, level: number) => {
    // this fetches the sub nodes
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

  return (
    <div
      className={classnames(tableStyles.tableContainer, commonStyles.flexFill)}
    >
      <ExecutionsTableHeader
        columns={columns}
        scrollbarPadding={scrollbarPadding}
      />
      <div className={tableStyles.scrollContainer}>
        {transformedShowNodes.length > 0 ? (
          transformedShowNodes.map(({ nodeExecution, dNode }) => {
            return (
              <NodeExecutionRow
                columns={columns}
                key={getCacheKey(nodeExecution!.id)}
                nodeExecution={nodeExecution!}
                node={dNode}
                onToggle={toggleNode}
                setShouldUpdate={setShouldUpdate}
                setCurrentNodeExecutionsById={setCurrentNodeExecutionsById}
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
