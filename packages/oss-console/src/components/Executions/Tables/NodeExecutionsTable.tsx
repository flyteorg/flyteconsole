import React, { useMemo, useEffect, useState, useContext } from 'react';
import merge from 'lodash/merge';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {
  FilterOperation,
  FilterOperationName,
  FilterOperationValueList,
} from '@clients/common/types/adminEntityTypes';
import TableNoRowsCell from '@clients/primitives/TableNoRowsCell';
import { noExecutionsFoundString } from '@clients/common/constants';
import { dNode } from '../../../models/Graph/types';
import { NodeExecution } from '../../../models/Execution/types';
import { isStartOrEndNodeId } from '../../../models/Node/utils';
import { stringifyIsEqual } from '../../../common/stringifyIsEqual';
import { generateColumns } from './nodeExecutionColumns';
import { useColumnStyles } from './styles';
import { useNodeExecutionsById } from '../contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';
import { NodeExecutionRow } from './NodeExecutionRow';
import { ExecutionFiltersState } from '../filters/useExecutionFiltersState';
import { nodeExecutionPhaseConstants } from '../constants';
import { NodeExecutionDynamicProvider } from '../contextProvider/NodeExecutionDetails/NodeExecutionDynamicProvider';
import { ExecutionFilters } from '../ExecutionFilters';
import { ExecutionContext, FilteredNodeExecutions, NodeExecutionsById } from '../contexts';
import { convertToPlainNodes } from '../ExecutionDetails/Timeline/helpers';
import {
  hasPhaseFilter,
  useExecutionNodeViewsStatePoll,
} from '../ExecutionDetails/useExecutionNodeViewsStatePoll';
import { NodeExecutionPhase } from '../../../models/Execution/enums';

const mergeOriginIntoNodes = (target: dNode[], origin: dNode[]) => {
  if (!target?.length) {
    return target;
  }
  const originClone = cloneDeep(origin);
  const newTarget = cloneDeep(target);
  newTarget?.forEach((value) => {
    const originalNode = originClone.find(
      (og) => og.id === value.id && og.scopedId === value.scopedId,
    );
    const newNodes = mergeOriginIntoNodes(value.nodes, originalNode?.nodes || []);

    value = merge(value, originalNode);
    value.nodes = newNodes;
    return value;
  });

  return newTarget;
};

const executionMatchesPhaseFilter = (
  { key, value, operation }: FilterOperation,
  nodeExecution?: NodeExecution,
) => {
  if (key === 'phase' && operation === FilterOperationName.VALUE_IN) {
    // default to UNKNOWN phase if the field does not exist on a closure
    const phaseValue = nodeExecution?.closure?.[key] ?? NodeExecutionPhase.UNDEFINED;

    const itemValue = nodeExecutionPhaseConstants()[phaseValue]?.value;
    // phase check filters always return values in an array
    const valuesArray = value as FilterOperationValueList;
    return valuesArray.includes(itemValue);
  }
  return false;
};

const filterNodes = (
  initialNodes: dNode[],
  appliedFilters: FilterOperation[],
  nodeExecutionsById: NodeExecutionsById,
) => {
  if (!initialNodes?.length) {
    return [];
  }

  let initialClone = cloneDeep(initialNodes);

  // eslint-disable-next-line no-restricted-syntax
  for (const n of initialClone) {
    n.nodes = filterNodes(n.nodes, appliedFilters, nodeExecutionsById);
  }

  initialClone = initialClone.filter((node) => {
    const hasFilteredChildren = !!node.nodes?.length;
    const phaseFilter = appliedFilters.find((f) => f.key === 'phase');
    const execution = nodeExecutionsById[node?.scopedId];
    const shouldBeIncluded =
      !!phaseFilter &&
      !isStartOrEndNodeId(node.id) &&
      executionMatchesPhaseFilter(phaseFilter, execution);
    const result = !!node.level || hasFilteredChildren || shouldBeIncluded;

    if (!shouldBeIncluded) {
      // eslint-disable-next-line no-param-reassign
      node.grayedOut = true;
    }

    return result;
  });

  return initialClone;
};

const isPhaseFilter = (appliedFilters: FilterOperation[] = []) => {
  if (appliedFilters.length === 1 && appliedFilters[0].key === 'phase') {
    return true;
  }
  return false;
};

/** Renders a table of NodeExecution records. Executions with errors will
 * have an expanadable container rendered as part of the table row.
 * NodeExecutions are expandable and will potentially render a list of child
 * TaskExecutions
 */
export const NodeExecutionsTable: React.FC<{
  filterState: ExecutionFiltersState;
}> = ({ filterState }) => {
  const columnStyles = useColumnStyles();

  const { execution } = useContext(ExecutionContext);

  const { appliedFilters } = filterState;
  const [filteredNodeExecutions, setFilteredNodeExecutions] = useState<FilteredNodeExecutions>();
  const { nodeExecutionsById, visibleNodes, toggleNode } = useNodeExecutionsById();

  const [filters, setFilters] = useState<FilterOperation[]>([]);

  // query to get filtered data to narrow down Table outputs
  const { nodeExecutionsQuery: filteredNodeExecutionsQuery } = useExecutionNodeViewsStatePoll(
    execution,
    filters.filter((f) => f.key !== 'phase'),
  );

  const [showNodes, setShowNodes] = useState<dNode[]>([]);

  const [filteredNodes, setFilteredNodes] = useState<dNode[] | undefined>(undefined);

  // wait for changes to filtered node executions
  useEffect(() => {
    if (filteredNodeExecutionsQuery.isFetching) {
      return;
    }

    const newFilteredNodeExecutions = isPhaseFilter(filters)
      ? undefined
      : filteredNodeExecutionsQuery.data;

    setFilteredNodeExecutions((prev) => {
      if (isEqual(prev, newFilteredNodeExecutions)) {
        return prev;
      }

      return newFilteredNodeExecutions;
    });
  }, [filteredNodeExecutionsQuery]);

  useEffect(() => {
    setFilters((prev) => {
      if (isEqual(prev, appliedFilters)) {
        return prev;
      }
      return [...appliedFilters];
    });
  }, [appliedFilters]);

  useEffect(() => {
    if (filters.length > 0) {
      // if filter was apllied, but filteredNodeExecutions is empty, we only appliied Phase filter,
      // and need to clear out items manually
      const isFilteredByPhase = hasPhaseFilter(filters);
      const showFilteredNodes = filters.length > 1 || (!isFilteredByPhase && filters.length === 1);
      const nodesToFilter = showFilteredNodes
        ? visibleNodes.filter((node: dNode) =>
            filteredNodeExecutions?.find(
              (execution: NodeExecution) => execution.scopedId === node.scopedId,
            ),
          )
        : visibleNodes;

      if (isFilteredByPhase) {
        // top level
        const finalFilteredNodes = filterNodes(nodesToFilter || [], filters, nodeExecutionsById);

        setFilteredNodes(finalFilteredNodes);
      } else {
        setFilteredNodes(nodesToFilter);
      }

      return;
    }
    setFilteredNodes(visibleNodes);
  }, [visibleNodes, filteredNodeExecutions, filters, nodeExecutionsById]);

  useEffect(() => {
    const mergeFilteredNodes = filters.length > 0;
    const newShownNodes = mergeFilteredNodes
      ? // if there are filtered nodes, merge original ones into them to preserve toggle status
        mergeOriginIntoNodes(cloneDeep(filteredNodes || []), cloneDeep(visibleNodes))
      : // else, merge originalNodes into initialNodes to preserve toggle status
        visibleNodes;

    const plainNodes = convertToPlainNodes(newShownNodes || []);
    setShowNodes((prev) => {
      if (stringifyIsEqual(prev, plainNodes)) {
        return prev;
      }

      return plainNodes;
    });
  }, [visibleNodes, filteredNodes, nodeExecutionsById, filters]);

  const columns = useMemo(
    () => generateColumns(columnStyles, nodeExecutionsById),
    [columnStyles, nodeExecutionsById],
  );

  return (
    <>
      <Grid container>
        <Grid
          item
          xs={12}
          sx={{
            paddingTop: (theme) => theme.spacing(0.75),
            paddingLeft: (theme) => theme.spacing(1.5), // tab above
          }}
        >
          <ExecutionFilters {...filterState} />
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12}>
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ height: 0 }}>
                  <TableCell
                    colSpan={99}
                    sx={{
                      padding: '0 !important',
                      borderBottom: (theme) => `4px solid ${theme.palette.divider}`,
                    }}
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {showNodes.length > 0 ? (
                  showNodes.map((node) => {
                    return (
                      <NodeExecutionDynamicProvider node={node} key={node.scopedId}>
                        <NodeExecutionRow
                          columns={columns}
                          node={node}
                          onToggle={toggleNode}
                          key={node.scopedId}
                        />
                      </NodeExecutionDynamicProvider>
                    );
                  })
                ) : (
                  <TableNoRowsCell displayMessage={noExecutionsFoundString} />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
};
