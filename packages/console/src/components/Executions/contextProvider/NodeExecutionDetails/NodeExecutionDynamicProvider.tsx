import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  Ref,
  useState,
} from 'react';
import { dateToTimestamp } from 'common/utils';
import { WorkflowNodeExecution } from 'components/Executions/contexts';
import { useNodeExecutionRow } from 'components/Executions/ExecutionDetails/useNodeExecutionRow';
import {
  isParentNode,
  nodeExecutionIsTerminal,
} from 'components/Executions/utils';
import { keyBy } from 'lodash';
import { NodeExecution, NodeExecutionPhase } from 'models';
import { dNode } from 'models/Graph/types';

import { useInView } from 'react-intersection-observer';
import { useQueryClient } from 'react-query';
import { RFNode } from 'components/flytegraph/ReactFlow/types';
import { useNodeExecutionsById } from './NodeExecutionsByIdContextProvider';

export type RefType = Ref<Element | null>;
export interface INodeExecutionDynamicContext {
  node: dNode;
  nodeExecution: WorkflowNodeExecution;
  childCount: number;
  inView: boolean;
  componentProps: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
}

export const NodeExecutionDynamicContext =
  createContext<INodeExecutionDynamicContext>({
    node: {} as dNode,
    nodeExecution: undefined as any,
    childCount: 0,
    inView: false,
    componentProps: {
      ref: null,
    },
  });

const checkEnableChildQuery = (
  childExecutions: NodeExecution[],
  nodeExecution: NodeExecution,
  inView: boolean,
) => {
  // check that we fetched all children otherwise force fetch
  const missingChildren =
    isParentNode(nodeExecution) && !childExecutions.length;

  const childrenStillRunning = childExecutions?.some(
    c => !nodeExecutionIsTerminal(c),
  );

  const executionRunning = !nodeExecutionIsTerminal(nodeExecution);

  const forceRefetch =
    inView && (missingChildren || childrenStillRunning || executionRunning);

  // force fetch:
  // if parent's children haven't been fetched
  // if parent is still running or
  // if any childExecutions are still running
  return forceRefetch;
};

export type NodeExecutionDynamicProviderProps = PropsWithChildren<{
  node: dNode;
  context?: string;
}>;
/** Should wrap "top level" component in Execution view, will build a nodeExecutions tree for specific workflow */
export const NodeExecutionDynamicProvider = ({
  node,
  context,
  children,
}: NodeExecutionDynamicProviderProps) => {
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();

  const [fetchedChildCount, setFetchedChildCount] = useState(0);
  // get running data
  const { setCurrentNodeExecutionsById, nodeExecutionsById } =
    useNodeExecutionsById();

  // get the node execution
  const nodeExecution: WorkflowNodeExecution | undefined = useMemo(() => {
    if (nodeExecutionsById[node.scopedId]) {
      return nodeExecutionsById[node.scopedId];
    }

    return;
  }, [nodeExecutionsById, node]);

  const { nodeExecutionRowQuery } = useNodeExecutionRow(
    queryClient,
    nodeExecution!,
    nodeExecutionList => {
      if (!nodeExecutionList?.length) {
        return true;
      }

      const shouldRun = checkEnableChildQuery(
        nodeExecutionList?.slice(1, nodeExecutionList.length - 1),
        nodeExecution!,
        inView,
      );

      if (shouldRun) {
        console.log(
          `Fetching node execution data for context ${context} for node `,
          nodeExecution?.id?.nodeId,
        );
      }

      return shouldRun;
    },
  );

  useEffect(() => {
    // don't update if still fetching
    if (nodeExecutionRowQuery.isFetching || !nodeExecutionRowQuery.data) {
      return;
    }

    const currentNodeExecutions = nodeExecutionRowQuery.data;
    const currentNodeExecutionsById = keyBy(currentNodeExecutions, 'scopedId');
    const newChildCount = currentNodeExecutions?.filter(
      e => e.fromUniqueParentId === nodeExecution?.scopedId,
    )?.length;

    setCurrentNodeExecutionsById(currentNodeExecutionsById, true);
    setFetchedChildCount(prev => {
      if (prev === newChildCount) {
        return prev;
      }

      return newChildCount;
    });
  }, [nodeExecutionRowQuery]);

  return (
    <NodeExecutionDynamicContext.Provider
      value={{
        inView,
        nodeExecution: nodeExecution!,
        node,
        childCount: fetchedChildCount,
        componentProps: {
          ref,
        },
      }}
    >
      {children}
    </NodeExecutionDynamicContext.Provider>
  );
};

export const useNodeExecutionDynamicContext =
  (): INodeExecutionDynamicContext => {
    return useContext(NodeExecutionDynamicContext);
  };

export const withNodeExecutionDynamicProvider = (
  WrappedComponent: React.FC<RFNode>,
  context: string,
) => {
  return (props: RFNode, ...rest: any) => {
    return (
      <NodeExecutionDynamicProvider node={props.data.node} context={context}>
        <WrappedComponent {...props} {...rest} />
      </NodeExecutionDynamicProvider>
    );
  };
};
