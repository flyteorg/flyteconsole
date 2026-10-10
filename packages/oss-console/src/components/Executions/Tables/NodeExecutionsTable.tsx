import React, { useMemo, useEffect, useState, useContext } from 'react';
import isEqual from 'lodash/isEqual';
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

// Filtering changes child lists and display flags, so shallow node copies are sufficient.
// They preserve expansion flags and share the compiled payloads without mutating the input.
// Deep-cloning at every recursive step would copy the same descendants repeatedly.
// Example: filter for SUCCEEDED when expanded Train is RUNNING and its child Fit succeeded.
// Keep Train as dimmed context and Fit as a matching child. Copy their display fields and
// child lists, sharing task definitions; the original Train's grayedOut flag stays unchanged.
const filterNodes = (
  initialNodes: dNode[],
  appliedFilters: FilterOperation[],
  nodeExecutionsById: NodeExecutionsById,
) => {
  if (!initialNodes?.length) {
    return [];
  }

  const phaseFilter = appliedFilters.find((f) => f.key === 'phase');
  return initialNodes.reduce<dNode[]>((result, node) => {
    const nodes = filterNodes(node.nodes, appliedFilters, nodeExecutionsById);
    const hasFilteredChildren = !!nodes.length;
    const execution = nodeExecutionsById[node?.scopedId];
    const shouldBeIncluded =
      !!phaseFilter &&
      !isStartOrEndNodeId(node.id) &&
      executionMatchesPhaseFilter(phaseFilter, execution);
    // Keep nested rows and ancestors as context, dimming nodes whose own phase does not match.
    if (!!node.level || hasFilteredChildren || shouldBeIncluded) {
      result.push({
        ...node,
        nodes,
        grayedOut: shouldBeIncluded ? node.grayedOut : true,
      });
    }
    return result;
  }, []);
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

  // The server handles non-phase filters; phase filtering below uses local execution states.
  const { nodeExecutionsQuery: filteredNodeExecutionsQuery } = useExecutionNodeViewsStatePoll(
    execution,
    filters.filter((f) => f.key !== 'phase'),
  );

  // Keep the settled results while fetching. Depend on the fields read here because the
  // query wrapper can get a new identity on unrelated renders, repeating this comparison.
  // Example: an unrelated render wraps the same [Train] array object in a new query object.
  // With the same data, isFetching flag, and filters, this effect needs no work.
  useEffect(() => {
    if (filteredNodeExecutionsQuery.isFetching) {
      return;
    }

    const newFilteredNodeExecutions = isPhaseFilter(filters)
      ? undefined
      : filteredNodeExecutionsQuery.data;

    setFilteredNodeExecutions((prev) => {
      // Equal responses should retain their reference so cached filtering can reuse its input.
      // Example: two settled duration-filter responses both contain identical Train records;
      // keep the previously stored array instead of invalidating cached filtering with a new one.
      if (isEqual(prev, newFilteredNodeExecutions)) {
        return prev;
      }

      return newFilteredNodeExecutions;
    });
  }, [filteredNodeExecutionsQuery.data, filteredNodeExecutionsQuery.isFetching, filters]);

  useEffect(() => {
    setFilters((prev) => {
      if (isEqual(prev, appliedFilters)) {
        return prev;
      }
      return [...appliedFilters];
    });
  }, [appliedFilters]);

  // Derive rows from the current tree, which already carries expansion flags.
  // Execution records are a dependency because phase updates can change filtered membership
  // or dimming, even when the workflow structure stays the same.
  // Example: with a SUCCEEDED filter, RUNNING Train is dimmed beside its matching Fit child.
  // When Train succeeds, recalculate its dimming even though the workflow definition is unchanged.
  // Using the current tree also preserves Train's expansion without the old deep-clone/merge step.
  const filteredNodes = useMemo(() => {
    if (filters.length > 0) {
      // Phase-only filtering needs no server match list; start from the full visible tree.
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
        return filterNodes(nodesToFilter || [], filters, nodeExecutionsById);
      }
      return nodesToFilter;
    }
    // Without filters, a status update can reuse this exact array. Status cells still read
    // the latest execution records separately; their values do not require new row objects.
    // Example: Train's status changes RUNNING -> SUCCEEDED, but the rows stay [Download, Train].
    return visibleNodes;
  }, [visibleNodes, filteredNodeExecutions, filters, nodeExecutionsById]);

  // useMemo checks array identity: the same filteredNodes object reuses the row list;
  // a new array recalculates it. Changed input nodes/arrays must be replaced, never mutated.
  // Deriving rows here avoids an effect that stores duplicate state and schedules another render.
  // Flattened rows still reference child trees, so JSON equality would serialize the same
  // descendants and compiled payloads repeatedly, once through each ancestor's row.
  // Example: collapsed Train gives rows [Download, Train]; expanded Train gives
  // [Download, Train, Prepare, Fit]. Unchanged input reuses the calculated row list.
  // Previously each update calculated rows in an effect, serialized them for comparison,
  // and saved changed rows in state. Now the current rows are calculated during rendering.
  const showNodes = useMemo(() => convertToPlainNodes(filteredNodes), [filteredNodes]);

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
