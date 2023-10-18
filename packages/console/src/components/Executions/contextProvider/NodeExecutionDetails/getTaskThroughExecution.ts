import { getTaskDisplayType } from 'components/Executions/utils';
import { fetchTaskExecutionList } from 'components/Executions/taskExecutionQueries';
import { NodeExecutionDetails } from 'components/Executions/types';
import { fetchTaskTemplate } from 'components/Task/taskQueries';
import { TaskTemplate } from 'models/Task/types';
import { QueryClient } from 'react-query/types/core/queryClient';
import { WorkflowNodeExecution } from 'components/Executions/contexts';
import { CompiledWorkflowClosure } from 'models';
import { isEqual } from 'lodash';

export const getTaskThroughExecution = async (
  queryClient: QueryClient,
  nodeExecution: WorkflowNodeExecution,
  closure: CompiledWorkflowClosure,
): Promise<NodeExecutionDetails> => {
  const taskExecutions = await (nodeExecution?.tasksFetched
    ? // if the nodeExecution tasks were already fetched, use them
      Promise.resolve(nodeExecution.taskExecutions || [])
    : // otherwise, fetch them
      fetchTaskExecutionList(queryClient, nodeExecution.id));

  let taskTemplate: TaskTemplate = closure?.tasks?.find(task =>
    isEqual(task.template.id, taskExecutions[0].id.taskId),
  )?.template as TaskTemplate;

  if (
    // skip request if the template was found
    !taskTemplate &&
    // skip request if the node has a dynamic parent
    !nodeExecution.dynamicParentNodeId &&
    taskExecutions &&
    taskExecutions.length > 0
  ) {
    taskTemplate = await fetchTaskTemplate(
      queryClient,
      taskExecutions[0].id.taskId,
    );

    if (!taskTemplate) {
      // eslint-disable-next-line no-console
      console.error(
        `ERROR: Unexpected missing task template while fetching NodeExecution details: ${JSON.stringify(
          taskExecutions[0].id.taskId,
        )}`,
      );
    }
  }

  const taskDetails: NodeExecutionDetails = {
    displayId: nodeExecution.id.nodeId,
    displayName: taskExecutions?.[0]?.id.taskId.name,
    displayType: getTaskDisplayType(taskTemplate?.type),
    taskTemplate: taskTemplate,
  };

  return taskDetails;
};
