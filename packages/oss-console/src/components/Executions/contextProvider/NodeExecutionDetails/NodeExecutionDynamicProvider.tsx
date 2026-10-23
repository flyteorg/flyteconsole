import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import keyBy from 'lodash/keyBy';
import isEqual from 'lodash/isEqual';
import { useInView } from 'react-intersection-observer';
import { useNodeExecutionDataQuery } from '../../../hooks/useNodeExecutionDataQuery';
import { isDynamicNode, isParentNode, nodeExecutionIsTerminal } from '../../utils';
import { dNode } from '../../../../models/Graph/types';
import { nodeExecutionRefreshIntervalMs } from '../../constants';
import { useNodeExecutionsById } from './WorkflowNodeExecutionsProvider';
import { useNodeExecutionContext } from './NodeExecutionDetailsContextProvider';
import { useNodeExecutionChildrenQuery } from '../../../hooks/useNodeExecutionChildrenQuery';

export interface INodeExecutionDynamicContext {
  node: dNode;
  inView: boolean;
  componentProps: any;
}

export const NodeExecutionDynamicContext = createContext<INodeExecutionDynamicContext>({
  node: {} as dNode,
  inView: false,
  componentProps: {
    ref: null,
  },
});

export type NodeExecutionDynamicProviderProps = PropsWithChildren<{
  node: dNode;
  onChildrenReadyChange?: (scopedId: string, ready?: boolean) => void;
}>;
/** Should wrap "top level" component in Execution view, will build a nodeExecutions tree for specific workflow */
export const NodeExecutionDynamicProvider = ({
  node,
  children,
  onChildrenReadyChange,
}: NodeExecutionDynamicProviderProps) => {
  const { updateWorkflow } = useNodeExecutionContext();
  const { setCurrentNodeExecutionsById, nodeExecutionsById } = useNodeExecutionsById();

  const nodeExecution = useMemo(
    () => nodeExecutionsById[node?.scopedId],
    [nodeExecutionsById[node?.scopedId]],
  );

  const [throttledInView, setThrottledInView] = useState(false);
  const { ref, entry } = useInView({
    delay: 100,
    initialInView: false,
    fallbackInView: true,
    onChange: (inView) => {
      setThrottledInView(inView);
    },
  });

  const enabled = useMemo(() => {
    const isenabled = !!nodeExecution && throttledInView;

    return isenabled;
  }, [throttledInView, nodeExecution]);

  /**
   * Fetch node execution children
   */
  const nodeExecutionChildrenQuery = useNodeExecutionChildrenQuery({
    nodeExecution,
    enabled,
    refetchInterval: nodeExecutionRefreshIntervalMs,
  });

  useEffect(() => {
    // don't update if still fetching
    if (!nodeExecutionChildrenQuery.isSuccess) {
      return;
    }

    const result = keyBy(nodeExecutionChildrenQuery.data, 'scopedId');
    setCurrentNodeExecutionsById(result);
  }, [nodeExecutionChildrenQuery]);

  /**
   * Fetch node execution data only for dynamic nodes
   */
  const nodeExecutionDataQuery = useNodeExecutionDataQuery({
    id: nodeExecution?.id,
    refetchInterval: nodeExecutionRefreshIntervalMs,
    enabled: enabled && isDynamicNode(nodeExecution),
    refetchCondition: (prevResult) => {
      const shouldRerun = !prevResult?.dynamicWorkflow || !nodeExecutionIsTerminal(nodeExecution);

      return shouldRerun;
    },
  });

  useEffect(() => {
    // don't update if still fetching
    if (!nodeExecutionDataQuery.data) {
      return;
    }

    updateWorkflow(node.scopedId, nodeExecutionDataQuery.data);
  }, [nodeExecutionDataQuery.data]);

  // The request can finish before React applies its result to the rows. Wait for
  // the execution records and, for dynamic nodes, the workflow's rendered graph.
  // An empty response is valid: some workflow nodes may not have started yet.
  const childrenInContext = nodeExecutionChildrenQuery.data?.every(
    (child) => !!nodeExecutionsById[child.scopedId!],
  );
  const dynamicWorkflow = nodeExecutionDataQuery.data?.dynamicWorkflow;
  const dynamicDagReady =
    !isDynamicNode(nodeExecution) ||
    (!!dynamicWorkflow && isEqual(node.value?.workflowNode?.subWorkflowRef, dynamicWorkflow.id));
  // Offscreen rows fetch on scroll, so they don't block this expansion's timer.
  // `entry` distinguishes an offscreen row from one we haven't observed yet.
  const isOffscreen = !!entry && !throttledInView;
  const childrenReady =
    !isParentNode(nodeExecution) ||
    isOffscreen ||
    (nodeExecutionChildrenQuery.isSuccess && !!childrenInContext && dynamicDagReady);

  useEffect(() => {
    onChildrenReadyChange?.(node.scopedId, childrenReady);
  }, [node.scopedId, childrenReady, onChildrenReadyChange]);

  // Forget removed rows so reopening them cannot reuse an old "ready" signal.
  useEffect(
    () => () => onChildrenReadyChange?.(node.scopedId),
    [node.scopedId, onChildrenReadyChange],
  );

  return (
    <NodeExecutionDynamicContext.Provider
      key={node?.scopedId}
      value={{
        inView: throttledInView,
        node,
        componentProps: {
          ref,
        },
      }}
    >
      {children}
    </NodeExecutionDynamicContext.Provider>
  );
};

export const useNodeExecutionDynamicContext = (): INodeExecutionDynamicContext => {
  return useContext(NodeExecutionDynamicContext);
};
