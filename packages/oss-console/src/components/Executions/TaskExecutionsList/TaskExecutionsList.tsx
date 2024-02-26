import React from 'react';
import { noExecutionsFoundString } from '@clients/common/constants';
import { NoResults } from '@clients/primitives/NoResults';
import { LargeLoadingComponent } from '@clients/primitives/LoadingSpinner';
import { MapTaskExecution, TaskExecution } from '../../../models/Execution/types';
import { isMapTaskV1 } from '../../../models/Task/utils';
import { TaskExecutionPhase } from '../../../models/Execution/enums';
import { MapTaskExecutionsListItem } from './MapTaskExecutionListItem';
import { TaskExecutionsListItem } from './TaskExecutionsListItem';
import { getUniqueTaskExecutionName } from './utils';
import { WorkflowNodeExecution } from '../contexts';
import { useWorkflowNodeExecutionTaskExecutionsQuery } from '../../hooks/useWorkflowNodeExecutionTaskExecutionsQuery';
import { nodeExecutionRefreshIntervalMs } from '../constants';
import { WaitForQuery } from '../../common/WaitForQuery';

export const TaskExecutionsListContent: React.FC<{
  taskExecutions: TaskExecution[];
  onTaskSelected: (val: MapTaskExecution) => void;
  phase?: TaskExecutionPhase;
}> = ({ taskExecutions, onTaskSelected, phase }) => {
  if (!taskExecutions?.length) {
    return <NoResults displayMessage={noExecutionsFoundString} />;
  }

  return (
    <>
      {taskExecutions.map((taskExecution) => {
        const {
          closure: { taskType, metadata, eventVersion = 0 },
        } = taskExecution;
        const useNewMapTaskView = isMapTaskV1(
          eventVersion,
          metadata?.externalResources?.length ?? 0,
          taskType ?? undefined,
        );
        return useNewMapTaskView ? (
          <MapTaskExecutionsListItem
            key={getUniqueTaskExecutionName(taskExecution)}
            taskExecution={taskExecution}
            showAttempts={taskExecutions.length > 1}
            selectedPhase={phase}
            onTaskSelected={onTaskSelected}
          />
        ) : (
          <TaskExecutionsListItem
            key={getUniqueTaskExecutionName(taskExecution)}
            taskExecution={taskExecution}
          />
        );
      })}
    </>
  );
};

interface TaskExecutionsListProps {
  nodeExecution: WorkflowNodeExecution;
  onTaskSelected: (val: MapTaskExecution) => void;
  phase?: TaskExecutionPhase;
}

/** Renders a vertical list of task execution records with horizontal separators
 */
export const TaskExecutionsList: React.FC<TaskExecutionsListProps> = ({
  nodeExecution,
  onTaskSelected,
  phase,
}) => {
  const nodeExecutionTasksQuery = useWorkflowNodeExecutionTaskExecutionsQuery({
    nodeExecution,
    refetchInterval: nodeExecutionRefreshIntervalMs,
  });
  return (
    <WaitForQuery
      query={nodeExecutionTasksQuery}
      loadingComponent={() => <LargeLoadingComponent useDelay={false} />}
    >
      {(taskExecutions) => (
        <TaskExecutionsListContent
          taskExecutions={taskExecutions || []}
          onTaskSelected={onTaskSelected}
          phase={phase}
        />
      )}
    </WaitForQuery>
  );
};
