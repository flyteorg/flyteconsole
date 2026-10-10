import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import keyBy from 'lodash/keyBy';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import values from 'lodash/values';
import { NodeExecution } from '../../../../models/Execution/types';
import {
  IWorkflowNodeExecutionsContext,
  NodeExecutionsById,
  WorkflowNodeExecutionsContext,
} from '../../contexts';
import { dNode } from '../../../../models/Graph/types';
import {
  ScopedIdExpandedMap,
  transformerWorkflowToDag,
} from '../../../WorkflowGraph/transformerWorkflowToDag';
import { isStartOrEndNodeId } from '../../../../models/Node/utils';
import { isParentNode } from '../../utils';
import { useNodeExecutionContext } from './NodeExecutionDetailsContextProvider';
import { mergeNodeExecutions } from './utils';

export type WorkflowNodeExecutionsProviderProps = PropsWithChildren<{
  initialNodeExecutions?: NodeExecution[];
}>;

// Expansion and parent flags affect presentation, not the compiled workflow definition.
// Walk the tree and shallow-copy nodes whose flags or children differ from the input,
// including their ancestors. Unchanged input nodes and large compiled payloads stay shared.
// This still traverses the tree when metadata changes, but avoids deep-copying its payloads.
// Example: collapsed base Train has children [Prepare, Fit]; metadata says { expanded: true }.
// If those children need no changes, return a new Train object with the new flag,
// sharing its original child array and task definition. The base Train stays unchanged.
const applyNodeMetadata = (node: dNode, nodeMetadataMap: ScopedIdExpandedMap): dNode => {
  const children = node.nodes?.map((child) => applyNodeMetadata(child, nodeMetadataMap));
  // A new array from map() alone does not mean the children changed. Reuse the input array
  // when every child reference is unchanged so that this node can also retain its identity.
  // Example: [Prepare, Fit] still contains the same objects, so keep node.nodes;
  // [Prepare, updatedFit] needs a new array so the parent can point to updatedFit.
  const nodes = children?.every((child, index) => child === node.nodes[index])
    ? node.nodes
    : children;
  const metadata = nodeMetadataMap[node.scopedId];

  if (
    nodes === node.nodes &&
    (!metadata ||
      (metadata.expanded === node.expanded && metadata.isParentNode === node.isParentNode))
  ) {
    return node;
  }

  return { ...node, ...metadata, nodes };
};

/**
 * Supplies the execution view with a graph and live execution records. Keep compiled structure,
 * execution values, and presentation flags separate so status updates and expansion do not require
 * rebuilding the compiled graph. Consumers must treat shared nodes and payloads as immutable.
 * Example: "Download -> Train" is the definition, Train's RUNNING phase is an execution value,
 * and Train's expanded flag is presentation state. The graph combines these flags with the
 * definition; status cells read execution values separately.
 */
export const WorkflowNodeExecutionsProvider = ({
  initialNodeExecutions,
  children,
}: WorkflowNodeExecutionsProviderProps) => {
  const { compiledWorkflowClosure } = useNodeExecutionContext();

  const [nodeExecutionsById, setNodeExecutionsById] = useState<NodeExecutionsById>({});

  const [nodeMetadataMap, setNodeMetadataMap] = useState<ScopedIdExpandedMap>({});

  // Process only records present in this response instead of cloning/comparing all known
  // executions. The functional state updater supplies the latest map, allowing this callback
  // to stay stable across polls rather than retriggering effects that depend on it.
  // Example: a poll updates Train while Download is unchanged. Previously we cloned and
  // serialized the whole map; now we compare Train and preserve Download's existing object.
  // The updater receives the latest map, so a later Fit update also keeps the Train update.
  const setCurrentNodeExecutionsById = useCallback(
    (newNodeExecutionsById: NodeExecutionsById): void => {
      setNodeExecutionsById((prev) => {
        let next = prev;
        Object.entries(newNodeExecutionsById).forEach(([scopedId, incoming]) => {
          const previous = prev[scopedId];
          // A poll can return a new object with identical contents; skip that record entirely.
          // Example: Train is still RUNNING with identical fields: keep the stored record.
          if (isEqual(previous, incoming)) {
            return;
          }
          // Responses can be partial, so preserve fields absent from incoming. The merge mutates
          // its inputs; clone just this record to protect previous state and query-cache data.
          // Example: { closure: { phase: SUCCEEDED } } updates Train's phase while keeping
          // its stored inputUri and outputUri. Neither the old record nor the response is changed.
          const merged = mergeNodeExecutions(cloneDeep(previous), cloneDeep(incoming), scopedId);
          // A partial response can differ from previous yet produce no change after merging.
          // Example: repeating that partial SUCCEEDED response adds nothing to the full record.
          if (isEqual(previous, merged)) {
            return;
          }
          if (next === prev) {
            // Copy the map once, on the first real change. Other records retain their references;
            // if nothing changes, returning prev lets React skip the state update.
            // Example: next !== prev, but next.download === prev.download; only Train is replaced.
            next = { ...prev };
          }
          next[scopedId] = merged;
        });
        return next;
      });
    },
    [setNodeExecutionsById],
  );

  /**
   * Set initial node executions by id
   */
  useEffect(() => {
    const initialNodeExecutionsById = keyBy(initialNodeExecutions, 'scopedId');

    setCurrentNodeExecutionsById(initialNodeExecutionsById);
  }, [initialNodeExecutions, setCurrentNodeExecutionsById]);

  // Polling updates parent flags while preserving the user's expansion choices. Compare only
  // this small metadata map so ordinary phase updates leave the graph's inputs unchanged.
  // Example: Train changes RUNNING -> SUCCEEDED but remains a parent. Its metadata stays
  // { expanded: true, isParentNode: true }, so the metadata-applied graph can be reused.
  useEffect(() => {
    setNodeMetadataMap((prev) => {
      const newNodes = values(nodeExecutionsById).reduce((acc, nodeExecution) => {
        acc[nodeExecution.scopedId!] = {
          ...(prev[nodeExecution.scopedId!] || {}),
          isParentNode: isParentNode(nodeExecution),
        };

        return acc;
      }, {} as ScopedIdExpandedMap);
      if (isEqual(prev, newNodes)) {
        return prev;
      }

      return newNodes;
    });
  }, [nodeExecutionsById, setNodeMetadataMap]);

  // Transform only when the compiled definition changes, including newly loaded dynamic nodes.
  // Expansion toggles do not change that definition. Its producer must replace the closure
  // object on updates because useMemo checks its reference, not its nested contents.
  // Example: "Download -> Train" builds the base graph, including any already loaded children.
  // Expanding Train reuses it; loading a new dynamic Prepare/Fit definition rebuilds it.
  // Graph/error results are calculated here instead of saved by an effect into separate state,
  // which previously could require another render to publish the calculated graph.
  const dagData = useMemo(() => {
    if (isEmpty(compiledWorkflowClosure)) {
      return { dag: {} as dNode, error: undefined };
    }
    return transformerWorkflowToDag(compiledWorkflowClosure);
  }, [compiledWorkflowClosure]);

  // Apply presentation flags to the cached graph without rerunning the workflow transformer.
  // Example: metadata.train.expanded becomes true. The base graph stays the same;
  // this calculation applies the flag, and the table can then show Train's existing children.
  const mergedDag = useMemo(
    () => applyNodeMetadata(dagData.dag, nodeMetadataMap),
    [dagData.dag, nodeMetadataMap],
  );
  // Remove system start/end nodes from the table and timeline's top-level node list.
  // Cache the list while mergedDag is unchanged so consumers can reuse calculated row lists.
  // Example: [Start, Download, Train, End] -> [Download, Train]. Train still contains its
  // nested children; the table/timeline decide which child rows to show using expansion flags.
  const visibleNodes = useMemo(
    () => (mergedDag.nodes ?? []).filter((node) => !isStartOrEndNodeId(node.id)),
    [mergedDag],
  );

  // Replace the metadata map and entry to invalidate the overlay cache without mutating the graph.
  // Example: expanding Train creates { ...prev, train: { ...prev.train, expanded: true } }.
  // Download's metadata keeps its reference; the new map tells the metadata useMemo to update.
  const toggleNode = useCallback(
    (node: dNode) => {
      setNodeMetadataMap((prev) => ({
        ...prev,
        [node.scopedId]: {
          ...(prev[node.scopedId] || {}),
          expanded: !prev[node.scopedId]?.expanded,
        },
      }));
    },
    [setNodeMetadataMap],
  );

  return (
    <WorkflowNodeExecutionsContext.Provider
      value={{
        nodeExecutionsById: nodeExecutionsById!,
        setCurrentNodeExecutionsById,
        visibleNodes,
        dagData: {
          mergedDag,
          dagError: dagData.error,
        },
        toggleNode,
      }}
    >
      {children}
    </WorkflowNodeExecutionsContext.Provider>
  );
};

export const useNodeExecutionsById = (): IWorkflowNodeExecutionsContext => {
  return useContext(WorkflowNodeExecutionsContext);
};
