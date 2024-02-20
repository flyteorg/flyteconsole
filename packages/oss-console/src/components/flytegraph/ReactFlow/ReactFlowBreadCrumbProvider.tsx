import isEqual from 'lodash/isEqual';
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';

export interface IReactFlowBreadCrumbContext {
  currentNestedDepth: number;
  currentNestedView: BreadCrumbViews;
  setCurrentNestedView: (newLevels: BreadCrumbViews) => void;
  onAddNestedView: (view: any, sourceNode?: any) => void;
  onRemoveNestedView: (viewParent: any, viewIndex: any) => void;
}

export const ReactFlowBreadCrumbContext = createContext<IReactFlowBreadCrumbContext>({
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
export const ReactFlowBreadCrumbProvider = ({ children }: PropsWithChildren<{}>) => {
  const [currentNestedView, setCurrentNestedView] = useState<BreadCrumbViews>({});

  const currentNestedDepth = useMemo(
    () => (currentNestedView?.length || 0) as any as number,
    [currentNestedView],
  );

  const onAddNestedView = useCallback(
    (view) => {
      setCurrentNestedView((prev) => {
        const currentView = prev[view.parent] || [];
        const newView = {
          [view.parent]: [...currentView, view.view],
        };

        if (isEqual(prev, newView)) {
          return prev;
        }
        return newView;
      });
    },
    [setCurrentNestedView],
  );

  const onRemoveNestedView = useCallback(
    (viewParent, viewIndex) => {
      const newcurrentNestedView: any = { ...currentNestedView };
      newcurrentNestedView[viewParent] = newcurrentNestedView[viewParent]?.filter(
        (_item, i) => i <= viewIndex,
      );
      if (newcurrentNestedView[viewParent]?.length < 1) {
        delete newcurrentNestedView[viewParent];
      }
      setCurrentNestedView((prev) => {
        if (isEqual(prev, newcurrentNestedView)) {
          return prev;
        }
        return newcurrentNestedView;
      });
    },
    [currentNestedView, setCurrentNestedView],
  );

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

export const useReactFlowBreadCrumbContext = (): IReactFlowBreadCrumbContext => {
  return useContext(ReactFlowBreadCrumbContext);
};
