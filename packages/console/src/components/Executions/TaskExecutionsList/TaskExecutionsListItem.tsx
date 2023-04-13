import * as React from 'react';
import { PanelSection } from 'components/common/PanelSection';
import { TaskExecution } from 'models/Execution/types';
import { formatRetryAttempt } from './utils';
import { TaskExecutionLogsCard } from './TaskExecutionLogsCard';

interface TaskExecutionsListItemProps {
  taskExecution: TaskExecution;
  observability?: boolean;
}

/** Renders an individual `TaskExecution` record as part of a list */
export const TaskExecutionsListItem: React.FC<TaskExecutionsListItemProps> = ({
  taskExecution,
  observability = false,
}) => {
  const {
    closure: { phase, logs },
  } = taskExecution;
  const headerText = formatRetryAttempt(taskExecution.id.retryAttempt);

  return (
    <PanelSection>
      <TaskExecutionLogsCard
        taskExecution={taskExecution}
        headerText={headerText}
        phase={phase}
        logs={logs ?? []}
        observability={observability}
      />
    </PanelSection>
  );
};
