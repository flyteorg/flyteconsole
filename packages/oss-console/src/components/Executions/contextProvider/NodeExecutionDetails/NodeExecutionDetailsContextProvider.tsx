import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQueryClient } from 'react-query';
import cloneDeep from 'lodash/cloneDeep';
import keys from 'lodash/keys';
import { log } from '../../../../common/log';
import { Identifier } from '../../../../models/Common/types';
import { ExecutionData, NodeExecution } from '../../../../models/Execution/types';
import { CompiledWorkflowClosure, Workflow } from '../../../../models/Workflow/types';
import { getSubWorkflowFromId } from '../../../WorkflowGraph/utils';
import { stringifyIsEqual } from '../../../../common/stringifyIsEqual';
import { NodeExecutionDetails } from '../../types';
import { UNKNOWN_DETAILS } from './types';
import { createExecutionDetails, CurrentExecutionDetails } from './createExecutionArray';
import { getTaskThroughExecution } from './getTaskThroughExecution';
import { findNodeInWorkflowClosure } from './utils';

interface NodeExecutionDetailsState {
  workflowId: Identifier;
  compiledWorkflowClosure?: CompiledWorkflowClosure;
  getNodeExecutionDetails: (
    nodeExecution?: NodeExecution,
  ) => Promise<NodeExecutionDetails | undefined>;
  updateWorkflow: (scopedId?: string, nodeExecutionData?: ExecutionData) => void;
}

const NOT_AVAILABLE = 'NotAvailable';
/** Use this Context to redefine Provider returns in storybooks */
export const NodeExecutionDetailsContext = createContext<NodeExecutionDetailsState>({
  /** Default values used if ContextProvider wasn't initialized. */
  getNodeExecutionDetails: async () => {
    log.error('ERROR: No NodeExecutionDetailsContextProvider was found in parent components.');
    return UNKNOWN_DETAILS;
  },
  updateWorkflow: () => {
    log.error('ERROR: No NodeExecutionDetailsContextProvider was found in parent components.');
  },
  workflowId: {
    project: NOT_AVAILABLE,
    domain: NOT_AVAILABLE,
    name: NOT_AVAILABLE,
    version: NOT_AVAILABLE,
  },
});

/** Could be used to access the whole NodeExecutionDetailsState */
export const useNodeExecutionContext = (): NodeExecutionDetailsState =>
  useContext(NodeExecutionDetailsContext);

export type ProviderProps = PropsWithChildren<{
  initialWorkflow: Workflow;
}>;

type DynamicNodeExecutionDataMap = Record<string, ExecutionData>;
/** Should wrap "top level" component in Execution view, will build a nodeExecutions tree for specific workflow */
export const NodeExecutionDetailsContextProvider = ({
  initialWorkflow,
  children,
}: ProviderProps) => {
  const [workflow, setWorkflow] = useState<Workflow>();
  const [dynamicNodeExecutionDataMap, setDynamicNodeExecutionDataMap] =
    useState<DynamicNodeExecutionDataMap>();
  const [executionTree, setExecutionTree] = useState<CurrentExecutionDetails>(
    {} as CurrentExecutionDetails,
  );
  const [tasks, setTasks] = useState(new Map<string, NodeExecutionDetails>());
  const [closure, setClosure] = useState<CompiledWorkflowClosure>();

  const queryClient = useQueryClient();
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    setWorkflow({ ...initialWorkflow });

    return () => {
      setClosure(undefined);
      setWorkflow(undefined);
      setExecutionTree({} as CurrentExecutionDetails);
    };
  }, [initialWorkflow]);

  useEffect(() => {
    if (!workflow) {
      return;
    }
    const tree = createExecutionDetails(workflow);
    setClosure((prev) => {
      if (stringifyIsEqual(prev, workflow.closure?.compiledWorkflow)) {
        return prev;
      }

      return workflow.closure?.compiledWorkflow;
    });

    setExecutionTree((prev) => {
      if (stringifyIsEqual(prev, tree)) {
        return prev;
      }
      return tree;
    });
  }, [workflow, setClosure, setExecutionTree]);

  const updateWorkflow = useCallback(
    (scopedId?: string, nodeExecutionData?: ExecutionData) => {
      if (!scopedId || !nodeExecutionData?.dynamicWorkflow) {
        return;
      }
      setDynamicNodeExecutionDataMap((prev) => {
        return {
          ...prev,
          [scopedId!]: nodeExecutionData,
        };
      });
    },
    [setDynamicNodeExecutionDataMap],
  );

  useEffect(() => {
    setWorkflow((prev) => {
      if (!prev?.closure?.compiledWorkflow) {
        return prev;
      }
      const workflowCopy = cloneDeep(prev);
      const workflowClosure = workflowCopy.closure!.compiledWorkflow!;

      keys(dynamicNodeExecutionDataMap || {}).forEach((scopedId) => {
        const nodeExecutionData = dynamicNodeExecutionDataMap![scopedId];
        const { dynamicWorkflow } = nodeExecutionData || {};
        if (dynamicWorkflow) {
          const dWorkflowId = dynamicWorkflow?.id;
          const dPrimaryWorkflow = dynamicWorkflow?.compiledWorkflow?.primary;

          if (!getSubWorkflowFromId(dWorkflowId as any, workflowClosure)) {
            const node = findNodeInWorkflowClosure(scopedId, workflowClosure);
            if (node) {
              node.workflowNode = {
                subWorkflowRef: dWorkflowId,
              };
            }
            workflowClosure.subWorkflows = workflowClosure.subWorkflows || [];
            workflowClosure!.subWorkflows.push(dPrimaryWorkflow as any);

            workflowClosure!.tasks = workflowClosure?.tasks || [];
            workflowClosure!.tasks?.push(
              ...((dynamicWorkflow.compiledWorkflow!.tasks as any) || []),
            );
          }

          /* 2. Add subworkflows as subworkflows on root */
          const dSubWorkflows = dynamicWorkflow!.compiledWorkflow!.subWorkflows;
          dSubWorkflows?.forEach((subworkflow) => {
            const subId = subworkflow?.template?.id;
            if (!getSubWorkflowFromId(subId as any, workflowClosure)!) {
              workflowClosure!.subWorkflows = workflowClosure!.subWorkflows || [];
              workflowClosure!.subWorkflows?.push(subworkflow as any);
            }
          });
        }
      });

      if (stringifyIsEqual(prev, workflowCopy)) {
        return prev;
      }

      return workflowCopy;
    });
  }, [dynamicNodeExecutionDataMap, setWorkflow]);

  // TODO: remove?
  const getDynamicTasks = async (nodeExecution: NodeExecution) => {
    const taskDetails = await getTaskThroughExecution(
      queryClient,
      nodeExecution,
      closure || ({} as CompiledWorkflowClosure),
    );

    const tasksMap = tasks;
    tasksMap.set(nodeExecution.id.nodeId, taskDetails);
    if (isMounted.current) {
      setTasks(tasksMap);
    }

    return taskDetails;
  };

  const getDetails = useCallback(
    async (nodeExecution?: NodeExecution): Promise<NodeExecutionDetails | undefined> => {
      if (!executionTree || !nodeExecution) {
        return UNKNOWN_DETAILS;
      }

      const specId =
        nodeExecution.scopedId || nodeExecution.metadata?.specNodeId || nodeExecution.id.nodeId;
      const nodeDetail = executionTree.nodes?.filter((n) => n.scopedId === specId);
      if (nodeDetail?.length === 0) {
        let details = tasks.get(nodeExecution.id.nodeId);
        if (details) {
          // we already have looked for it and found
          return details;
        }

        // look for specific task by nodeId in current execution
        if (nodeExecution.metadata?.isDynamic || nodeExecution.dynamicParentNodeId) {
          details = await getDynamicTasks(nodeExecution);
        }
        return details;
      }

      return nodeDetail?.[0] ?? UNKNOWN_DETAILS;
    },
    [executionTree],
  );

  return (
    <NodeExecutionDetailsContext.Provider
      value={{
        workflowId: workflow?.id as any,
        compiledWorkflowClosure: closure,
        updateWorkflow,
        getNodeExecutionDetails: getDetails,
      }}
    >
      {children}
    </NodeExecutionDetailsContext.Provider>
  );
};
