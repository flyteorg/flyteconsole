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
  reportRowReadiness?: (scopedId: string, ready?: boolean) => void;
}>;
/** Should wrap "top level" component in Execution view, will build a nodeExecutions tree for specific workflow */
export const NodeExecutionDynamicProvider = ({
  node,
  children,
  reportRowReadiness,
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

  const isRowReady = () => {
    // Leaf rows have no children to load.
    if (!isParentNode(nodeExecution)) {
      return true;
    }

    // If the browser has checked this row’s visibility, and it’s offscreen, don’t wait for it
    if (entry && !throttledInView) {
      return true;
    }

    // If the request hasn’t succeeded, or we don’t have its response data, we’re still waiting.
    const loadedChildren = nodeExecutionChildrenQuery.data;
    if (!nodeExecutionChildrenQuery.isSuccess || !loadedChildren) {
      return false;
    }

    // A response can arrive before React puts its records into the table's data.
    // An empty response is valid: some children may not have started yet.
    const allChildrenInTable = loadedChildren.every((child) => {
      if (child.scopedId === undefined) {
        return false;
      }
      return Boolean(nodeExecutionsById[child.scopedId]);
    });
    if (!allChildrenInTable) {
      return false;
    }

    // Dynamic nodes also need their downloaded workflow applied to the graph.
    if (isDynamicNode(nodeExecution)) {
      const loadedWorkflow = nodeExecutionDataQuery.data?.dynamicWorkflow;
      if (!loadedWorkflow) {
        return false;
      }
      const renderedWorkflowId = node.value?.workflowNode?.subWorkflowRef;
      return isEqual(renderedWorkflowId, loadedWorkflow.id);
    }

    return true;
  };
  const rowReady = isRowReady();

  useEffect(() => {
    if (reportRowReadiness) {
      reportRowReadiness(node.scopedId, rowReady);
    }
  }, [node.scopedId, rowReady, reportRowReadiness]);

  useEffect(() => {
    // React calls this cleanup when the row is removed. Omitting ready removes
    // its checklist entry, so reopening it cannot reuse an old report.
    return () => {
      if (reportRowReadiness) {
        reportRowReadiness(node.scopedId);
      }
    };
  }, [node.scopedId, reportRowReadiness]);

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
