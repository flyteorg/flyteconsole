import { useNodeExecutionsById } from 'components/Executions/contextProvider/NodeExecutionDetails';
import { fetchChildrenExecutions } from 'components/Executions/utils';
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  Ref,
  useState,
} from 'react';
import { useQueryClient } from 'react-query';
import { isUnFetchedDynamicNode } from './utils';

export type RefType = Ref<Element | null>;
export interface IReactFlowBreadCrumbContext {
  currentNestedDepth: number;
  currentNestedView: BreadCrumbViews;
  setCurrentNestedView: (newLevels: BreadCrumbViews) => void;
  onAddNestedView: (view: any, sourceNode?: any) => Promise<void>;
  onRemoveNestedView: (viewParent: any, viewIndex: any) => void;
}

export const ReactFlowBreadCrumbContext =
  createContext<IReactFlowBreadCrumbContext>({
    currentNestedDepth: 0,
    currentNestedView: {},
    setCurrentNestedView: () => {},
    onAddNestedView: () => {
      throw new Error('please use NodeExecutionDynamicProvider');
    },
    onRemoveNestedView: () => {
      throw new Error('please use NodeExecutionDynamicProvider');
    },
  });

export interface BreadCrumbViews {
  [key: string]: string[];
}
/** Should wrap "top level" component in Execution view, will build a nodeExecutions tree for specific workflow */
export const ReactFlowBreadCrumbProvider = ({
  children,
}: PropsWithChildren<{}>) => {
  const queryClient = useQueryClient();
  const [currentNestedView, setCurrentNestedView] = useState<BreadCrumbViews>(
    {},
  );
  const currentNestedDepth = (currentNestedView?.length || 0) as any as number;

  const { nodeExecutionsById, setCurrentNodeExecutionsById } =
    useNodeExecutionsById();

  const onAddNestedView = async (view, sourceNode: any = null) => {
    if (sourceNode && isUnFetchedDynamicNode(sourceNode)) {
      await fetchChildrenExecutions(
        queryClient,
        sourceNode.scopedId,
        nodeExecutionsById,
        setCurrentNodeExecutionsById,
      );
    }

    const currentView = currentNestedView[view.parent] || [];
    const newView = {
      [view.parent]: [...currentView, view.view],
    };
    setCurrentNestedView(newView);
  };

  const onRemoveNestedView = (viewParent, viewIndex) => {
    const newcurrentNestedView: any = { ...currentNestedView };
    newcurrentNestedView[viewParent] = newcurrentNestedView[viewParent]?.filter(
      (_item, i) => i <= viewIndex,
    );
    if (newcurrentNestedView[viewParent]?.length < 1) {
      delete newcurrentNestedView[viewParent];
    }
    setCurrentNestedView(newcurrentNestedView);
  };

  return (
    <ReactFlowBreadCrumbContext.Provider
      value={{
        currentNestedDepth,
        currentNestedView,
        setCurrentNestedView,
        onAddNestedView,
        onRemoveNestedView,
      }}
    >
      {children}
    </ReactFlowBreadCrumbContext.Provider>
  );
};

export const useReactFlowBreadCrumbContext =
  (): IReactFlowBreadCrumbContext => {
    return useContext(ReactFlowBreadCrumbContext);
  };
