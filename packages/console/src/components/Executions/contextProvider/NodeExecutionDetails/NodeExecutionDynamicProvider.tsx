import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  Ref,
  useState,
} from 'react';
import { WorkflowNodeExecution } from 'components/Executions/contexts';
import { useNodeExecutionRow } from 'components/Executions/ExecutionDetails/useNodeExecutionRow';
import {
  isParentNode,
  nodeExecutionIsTerminal,
} from 'components/Executions/utils';
import { keyBy, values } from 'lodash';
import { useInView } from 'react-intersection-observer';
import { useQueryClient } from 'react-query';
import { dNode } from 'models/Graph/types';
import { useNodeExecutionsById } from './WorkflowNodeExecutionsProvider';

export type RefType = Ref<Element | null>;
export interface INodeExecutionDynamicContext {
  node: dNode;
  childExecutions: WorkflowNodeExecution[];
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
    childExecutions: [],
    childCount: 0,
    inView: false,
    componentProps: {
      ref: null,
    },
  });

const checkEnableChildQuery = (
  childExecutions: WorkflowNodeExecution[],
  nodeExecution: WorkflowNodeExecution,
  inView: boolean,
) => {
  // check that we fetched all children otherwise force fetch
  const missingChildren =
    isParentNode(nodeExecution) && !childExecutions.length;

  const childrenStillRunning = childExecutions?.some(
    c => !nodeExecutionIsTerminal(c),
  );

  const executionRunning = !nodeExecutionIsTerminal(nodeExecution);

  const tasksFetched = nodeExecution.tasksFetched;

  const forceRefetch =
    inView &&
    (!tasksFetched ||
      missingChildren ||
      childrenStillRunning ||
      executionRunning);

  // force fetch:
  // if parent's children haven't been fetched
  // if parent is still running or
  // if any childExecutions are still running
  return forceRefetch;
};

export type NodeExecutionDynamicProviderProps = PropsWithChildren<{
  node: dNode;
  overrideInViewValue?: boolean;
}>;
/** Should wrap "top level" component in Execution view, will build a nodeExecutions tree for specific workflow */
export const NodeExecutionDynamicProvider = ({
  node,
  overrideInViewValue,
  children,
}: NodeExecutionDynamicProviderProps) => {
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();
  const [overloadedInView, setOverloadedInView] = useState<boolean>(false);
  const [fetchedChildCount, setFetchedChildCount] = useState(0);

  useEffect(() => {
    setOverloadedInView(prev => {
      const newVal =
        overrideInViewValue === undefined ? inView : overrideInViewValue;
      if (newVal === prev) {
        return prev;
      }

      return newVal;
    });
  }, [inView, overrideInViewValue]);
  // get running data
  const { setCurrentNodeExecutionsById, nodeExecutionsById } =
    useNodeExecutionsById();

  const childExecutions = useMemo(() => {
    const children = values(nodeExecutionsById).filter(execution => {
      return execution.fromUniqueParentId === node?.scopedId;
    });

    return children;
  }, [nodeExecutionsById]);

  const { nodeExecutionRowQuery } = useNodeExecutionRow(
    queryClient,
    node?.execution!,
    () => {
      const shouldRun = checkEnableChildQuery(
        childExecutions,
        node?.execution!,
        !!overloadedInView,
      );

      return shouldRun;
    },
  );

  useEffect(() => {
    // don't update if still fetching
    if (nodeExecutionRowQuery.isFetching || !nodeExecutionRowQuery.data) {
      return;
    }

    const parentAndChildren = nodeExecutionRowQuery.data;

    // update parent context with tnew executions data
    const parentAndChildrenById = keyBy(parentAndChildren, 'scopedId');
    setCurrentNodeExecutionsById(parentAndChildrenById, true);

    const newChildCount = (parentAndChildren?.length || 1) - 1;

    // update known children count
    setFetchedChildCount(prev => {
      if (prev === newChildCount) {
        return prev;
      }
      return newChildCount;
    });
  }, [nodeExecutionRowQuery]);

  return (
    <NodeExecutionDynamicContext.Provider
      key={node?.scopedId}
      value={{
        inView: overloadedInView,
        node,
        childExecutions,
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
