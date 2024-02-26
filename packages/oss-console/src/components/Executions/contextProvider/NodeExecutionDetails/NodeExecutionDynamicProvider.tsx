import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import keyBy from 'lodash/keyBy';
import { useInView } from 'react-intersection-observer';
import { useNodeExecutionDataQuery } from '../../../hooks/useNodeExecutionDataQuery';
import { isDynamicNode, nodeExecutionIsTerminal } from '../../utils';
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
}>;
/** Should wrap "top level" component in Execution view, will build a nodeExecutions tree for specific workflow */
export const NodeExecutionDynamicProvider = ({
  node,
  children,
}: NodeExecutionDynamicProviderProps) => {
  const { updateWorkflow } = useNodeExecutionContext();
  const { setCurrentNodeExecutionsById, nodeExecutionsById } = useNodeExecutionsById();

  const nodeExecution = useMemo(
    () => nodeExecutionsById[node?.scopedId],
    [nodeExecutionsById[node?.scopedId]],
  );

  const [throttledInView, setThrottledInView] = useState(false);
  const { ref } = useInView({
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
