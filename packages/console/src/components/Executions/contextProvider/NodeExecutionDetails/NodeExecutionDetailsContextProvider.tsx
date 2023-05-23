import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { log } from 'common/log';
import { Identifier } from 'models/Common/types';
import { NodeExecution } from 'models/Execution/types';
import { CompiledWorkflowClosure } from 'models/Workflow/types';
import { useQueryClient } from 'react-query';
import { fetchWorkflow } from 'components/Workflow/workflowQueries';
import { NodeExecutionDetails } from '../../types';
import { UNKNOWN_DETAILS } from './types';
import {
  createExecutionDetails,
  CurrentExecutionDetails,
} from './createExecutionArray';
import { getTaskThroughExecution } from './getTaskThroughExecution';

interface NodeExecutionDetailsState {
  getNodeExecutionDetails: (
    nodeExecution?: NodeExecution,
  ) => Promise<NodeExecutionDetails | undefined>;
  workflowId: Identifier;
  compiledWorkflowClosure: CompiledWorkflowClosure | null;
}

const NOT_AVAILABLE = 'NotAvailable';
/** Use this Context to redefine Provider returns in storybooks */
export const NodeExecutionDetailsContext =
  createContext<NodeExecutionDetailsState>({
    /** Default values used if ContextProvider wasn't initialized. */
    getNodeExecutionDetails: async () => {
      log.error(
        'ERROR: No NodeExecutionDetailsContextProvider was found in parent components.',
      );
      return UNKNOWN_DETAILS;
    },
    workflowId: {
      project: NOT_AVAILABLE,
      domain: NOT_AVAILABLE,
      name: NOT_AVAILABLE,
      version: NOT_AVAILABLE,
    },
    compiledWorkflowClosure: null,
  });

/**  Should be used to get NodeExecutionDetails for a specific nodeExecution. */
export const useNodeExecutionDetails = (nodeExecution?: NodeExecution) =>
  useContext(NodeExecutionDetailsContext).getNodeExecutionDetails(
    nodeExecution,
  );

/** Could be used to access the whole NodeExecutionDetailsState */
export const useNodeExecutionContext = (): NodeExecutionDetailsState =>
  useContext(NodeExecutionDetailsContext);

export type ProviderProps = PropsWithChildren<{
  workflowId: Identifier;
}>;

/** Should wrap "top level" component in Execution view, will build a nodeExecutions tree for specific workflow */
export const NodeExecutionDetailsContextProvider = ({
  workflowId,
  children,
}: ProviderProps) => {
  // workflow Identifier - separated to parameters, to minimize re-render count
  // as useEffect doesn't know how to do deep comparison
  const { resourceType, project, domain, name, version } = workflowId;

  const [executionTree, setExecutionTree] = useState<CurrentExecutionDetails>(
    {} as CurrentExecutionDetails,
  );
  const [tasks, setTasks] = useState(new Map<string, NodeExecutionDetails>());
  const [closure, setClosure] = useState<CompiledWorkflowClosure>(
    {} as CompiledWorkflowClosure,
  );

  const resetState = () => {
    setExecutionTree({} as CurrentExecutionDetails);
    setClosure({} as CompiledWorkflowClosure);
  };

  const queryClient = useQueryClient();
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;
    async function fetchData() {
      const workflowId: Identifier = {
        resourceType,
        project,
        domain,
        name,
        version,
      };
      const result = await fetchWorkflow(queryClient, workflowId);
      if (!result) {
        resetState();
        return;
      }
      const fetchedWorkflow = JSON.parse(JSON.stringify(result));
      const tree = createExecutionDetails(fetchedWorkflow);
      if (isCurrent) {
        setClosure(fetchedWorkflow.closure?.compiledWorkflow ?? null);
        setExecutionTree(tree);
      }
    }

    fetchData();

    // This handles the unmount case
    return () => {
      isCurrent = false;
      resetState();
    };
  }, [queryClient, resourceType, project, domain, name, version]);

  const getDynamicTasks = async (nodeExecution: NodeExecution) => {
    const taskDetails = await getTaskThroughExecution(
      queryClient,
      nodeExecution,
      closure,
    );

    const tasksMap = tasks;
    tasksMap.set(nodeExecution.id.nodeId, taskDetails);
    if (isMounted.current) {
      setTasks(tasksMap);
    }

    return taskDetails;
  };

  const getDetails = async (
    nodeExecution?: NodeExecution,
  ): Promise<NodeExecutionDetails | undefined> => {
    if (!executionTree || !nodeExecution) {
      return UNKNOWN_DETAILS;
    }

    const specId =
      nodeExecution.scopedId ||
      nodeExecution.metadata?.specNodeId ||
      nodeExecution.id.nodeId;
    const nodeDetail = executionTree.nodes?.filter(n => n.scopedId === specId);
    if (nodeDetail?.length === 0) {
      let details = tasks.get(nodeExecution.id.nodeId);
      if (details) {
        // we already have looked for it and found
        return details;
      }

      // look for specific task by nodeId in current execution
      if (nodeExecution.metadata?.isDynamic) {
        details = await getDynamicTasks(nodeExecution);
      }
      return details;
    }

    return nodeDetail?.[0] ?? UNKNOWN_DETAILS;
  };

  return (
    <NodeExecutionDetailsContext.Provider
      value={{
        getNodeExecutionDetails: getDetails,
        workflowId: {
          resourceType,
          project,
          domain,
          name,
          version,
        },
        compiledWorkflowClosure: closure,
      }}
    >
      {children}
    </NodeExecutionDetailsContext.Provider>
  );
};
