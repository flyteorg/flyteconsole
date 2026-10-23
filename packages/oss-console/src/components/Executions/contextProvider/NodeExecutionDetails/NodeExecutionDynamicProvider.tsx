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

export type NodeChildrenLoadStatus = 'loading' | 'ready' | 'error' | 'offscreen';

export type NodeExecutionDynamicProviderProps = PropsWithChildren<{
  node: dNode;
  onChildrenLoadStatusChange?: (scopedId: string, status?: NodeChildrenLoadStatus) => void;
}>;
/** Should wrap "top level" component in Execution view, will build a nodeExecutions tree for specific workflow */
export const NodeExecutionDynamicProvider = ({
  node,
  children,
  onChildrenLoadStatusChange,
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

  // A successful request alone is too early: the returned executions must be in the
  // row context, and a dynamic workflow must have made it into the rendered DAG.
  // A successful empty list is valid (e.g. children have not started yet).
  const childrenInContext = nodeExecutionChildrenQuery.data?.every(
    (child) => !!nodeExecutionsById[child.scopedId!],
  );
  const dynamicWorkflow = nodeExecutionDataQuery.data?.dynamicWorkflow;
  const dynamicDagReady =
    !isDynamicNode(nodeExecution) ||
    (!!dynamicWorkflow && isEqual(node.value?.workflowNode?.subWorkflowRef, dynamicWorkflow.id));
  let childrenLoadStatus: NodeChildrenLoadStatus = 'loading';
  if (!isParentNode(nodeExecution)) {
    childrenLoadStatus = 'ready';
  } else if (entry && !throttledInView) {
    // Wait for the first visibility observation before deciding a row is offscreen.
    childrenLoadStatus = 'offscreen';
  } else if (
    nodeExecutionChildrenQuery.isError ||
    (isDynamicNode(nodeExecution) && nodeExecutionDataQuery.isError)
  ) {
    childrenLoadStatus = 'error';
  } else if (nodeExecutionChildrenQuery.isSuccess && childrenInContext && dynamicDagReady) {
    childrenLoadStatus = 'ready';
  }

  useEffect(() => {
    onChildrenLoadStatusChange?.(node.scopedId, childrenLoadStatus);
  }, [node.scopedId, childrenLoadStatus, onChildrenLoadStatusChange]);

  useEffect(
    () => () => onChildrenLoadStatusChange?.(node.scopedId),
    [node.scopedId, onChildrenLoadStatusChange],
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
