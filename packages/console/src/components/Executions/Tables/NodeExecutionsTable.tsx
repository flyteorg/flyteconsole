import classnames from 'classnames';
import { getCacheKey } from 'components/Cache/utils';
import { useCommonStyles } from 'components/common/styles';
import scrollbarSize from 'dom-helpers/scrollbarSize';
import { NodeExecution, NodeExecutionsById } from 'models/Execution/types';
import { dNode } from 'models/Graph/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { dateToTimestamp } from 'common/utils';
import React, { useMemo, useEffect, useState } from 'react';
import { merge, isEqual, cloneDeep } from 'lodash';
import { extractCompiledNodes } from 'components/hooks/utils';
import {
  FilterOperation,
  FilterOperationName,
  FilterOperationValueList,
} from 'models';
import { ExecutionsTableHeader } from './ExecutionsTableHeader';
import { generateColumns } from './nodeExecutionColumns';
import { NoExecutionsContent } from './NoExecutionsContent';
import { useColumnStyles, useExecutionTableStyles } from './styles';
import { convertToPlainNodes } from '../ExecutionDetails/Timeline/helpers';
import {
  useNodeExecutionContext,
  useNodeExecutionsById,
} from '../contextProvider/NodeExecutionDetails';
import { NodeExecutionRow } from './NodeExecutionRow';
import { useNodeExecutionFiltersState } from '../filters/useExecutionFiltersState';
import { searchNode } from '../utils';
import { nodeExecutionPhaseConstants } from '../constants';

const scrollbarPadding = scrollbarSize();

const mergeOriginIntoNodes = (target: dNode[], origin: dNode[]) => {
  if (!target?.length) {
    return target;
  }
  const newTarget = cloneDeep(target);
  newTarget?.forEach(value => {
    const originalNode = origin.find(
      og => og.id === value.id && og.scopedId === value.scopedId,
    );
    const newNodes = mergeOriginIntoNodes(
      value.nodes,
      originalNode?.nodes || [],
    );

    value = merge(value, originalNode);
    value.nodes = newNodes;
    return value;
  });

  return newTarget;
};

interface NodeExecutionsTableProps {
  initialNodes: dNode[];
  filteredNodes?: dNode[];
}

const executionMatchesPhaseFilter = (
  nodeExecution: NodeExecution,
  { key, value, operation }: FilterOperation,
) => {
  if (key === 'phase' && operation === FilterOperationName.VALUE_IN) {
    // default to UNKNOWN phase if the field does not exist on a closure
    const itemValue =
      nodeExecutionPhaseConstants()[nodeExecution?.closure[key]]?.value ??
      nodeExecutionPhaseConstants()[0].value;
    // phase check filters always return values in an array
    const valuesArray = value as FilterOperationValueList;
    return valuesArray.includes(itemValue);
  }
  return false;
};

const filterNodes = (
  initialNodes: dNode[],
  nodeExecutionsById: NodeExecutionsById,
  appliedFilters: FilterOperation[],
) => {
  if (!initialNodes?.length) {
    return [];
  }

  let initialClone = cloneDeep(initialNodes);

  initialClone.forEach(n => {
    n.nodes = filterNodes(n.nodes, nodeExecutionsById, appliedFilters);
  });

  initialClone = initialClone.filter(node => {
    const hasFilteredChildren = node.nodes?.length;
    const shouldBeIncluded = executionMatchesPhaseFilter(
      nodeExecutionsById[node.scopedId],
      appliedFilters[0],
    );
    const result = hasFilteredChildren || shouldBeIncluded;

    if (hasFilteredChildren && !shouldBeIncluded) {
      node.grayedOut = true;
    }

    return result;
  });

  return initialClone;
};

/** Renders a table of NodeExecution records. Executions with errors will
 * have an expanadable container rendered as part of the table row.
 * NodeExecutions are expandable and will potentially render a list of child
 * TaskExecutions
 */
export const NodeExecutionsTable: React.FC<NodeExecutionsTableProps> = ({
  initialNodes,
}) => {
  const commonStyles = useCommonStyles();
  const tableStyles = useExecutionTableStyles();
  const { nodeExecutionsById, filteredNodeExecutions } =
    useNodeExecutionsById();
  const { appliedFilters } = useNodeExecutionFiltersState();

  const [showNodes, setShowNodes] = useState<dNode[]>([]);
  const [initialFilteredNodes, setInitialFilteredNodes] = useState<
    dNode[] | undefined
  >(undefined);

  const [originalNodes, setOriginalNodes] = useState<dNode[]>(
    appliedFilters.length > 0 && initialFilteredNodes
      ? initialFilteredNodes
      : initialNodes,
  );

  const [filters, setFilters] = useState<FilterOperation[]>(appliedFilters);

  const [isFiltersChanged, setIsFiltersChanged] = useState<boolean>(false);

  const { compiledWorkflowClosure } = useNodeExecutionContext();

  const columnStyles = useColumnStyles();
  // Memoizing columns so they won't be re-generated unless the styles change
  const compiledNodes = extractCompiledNodes(compiledWorkflowClosure);
  const columns = useMemo(
    () => generateColumns(columnStyles, compiledNodes),
    [columnStyles, compiledNodes],
  );

  useEffect(() => {
    const plainNodes = convertToPlainNodes(originalNodes || []);
    setOriginalNodes(ogn => {
      const newNodes =
        appliedFilters.length > 0 && initialFilteredNodes
          ? mergeOriginIntoNodes(initialFilteredNodes, plainNodes)
          : merge(initialNodes, ogn);

      if (!isEqual(newNodes, ogn)) {
        return newNodes;
      }

      return ogn;
    });

    const updatedShownNodesMap = plainNodes.map(node => {
      const execution = nodeExecutionsById[node.scopedId];
      return {
        ...node,
        startedAt: execution?.closure.startedAt,
        execution,
      };
    });
    setShowNodes(updatedShownNodesMap);
  }, [initialNodes, initialFilteredNodes, originalNodes, nodeExecutionsById]);

  useEffect(() => {
    if (!isEqual(filters, appliedFilters)) {
      setFilters(appliedFilters);
      setIsFiltersChanged(true);
    } else {
      setIsFiltersChanged(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    if (appliedFilters.length > 0) {
      // if filter was apllied, but filteredNodeExecutions is empty, we only appliied Phase filter,
      // and need to clear out items manually
      if (!filteredNodeExecutions) {
        // top level
        const filteredNodes = filterNodes(
          initialNodes,
          nodeExecutionsById,
          appliedFilters,
        );

        setInitialFilteredNodes(filteredNodes);
      } else {
        const filteredNodes = initialNodes.filter((node: dNode) =>
          filteredNodeExecutions.find(
            (execution: NodeExecution) => execution.scopedId === node.scopedId,
          ),
        );
        setInitialFilteredNodes(filteredNodes);
      }
    }
  }, [initialNodes, filteredNodeExecutions, isFiltersChanged]);

  const toggleNode = async (id: string, scopedId: string, level: number) => {
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
