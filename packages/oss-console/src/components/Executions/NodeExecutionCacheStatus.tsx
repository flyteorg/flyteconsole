import * as React from 'react';
import { NodeExecutionDetails } from './types';
import { CatalogCacheStatus } from '../../models/Execution/enums';
import { MapTaskExecution, NodeExecution } from '../../models/Execution/types';
import { isMapTaskType } from '../../models/Task/utils';
import { CacheStatus } from './CacheStatus';
import { getTaskRetryAtemptsForIndex } from './TaskExecutionsList/utils';

interface NodeExecutionCacheStatusProps {
  execution: NodeExecution;
  nodeExecutionDetails?: NodeExecutionDetails;
  selectedTaskExecution?: MapTaskExecution;
  /** `normal` will render an icon with description message beside it
   *  `iconOnly` will render just the icon with the description as a tooltip
   */
  variant?: 'normal' | 'iconOnly';
  className?: string;
}
/** For a given `NodeExecution.closure.taskNodeMetadata` object, will render
 * the cache status with a descriptive message. For `Core.CacheCatalogStatus.CACHE_HIT`,
 * it will also attempt to render a link to the source `WorkflowExecution` (normal
 * variant only).
 *
 * For Map Tasks, we will check the NodeExecutionDetail for the cache status instead. Since map tasks
 * cotains multiple tasks, the logic of the cache status is different.
 */
export const NodeExecutionCacheStatus: React.FC<NodeExecutionCacheStatusProps> = ({
  execution,
  selectedTaskExecution,
  nodeExecutionDetails,
  variant = 'normal',
  className,
}) => {
  const taskNodeMetadata = execution?.closure?.taskNodeMetadata;

  const isMapTask = isMapTaskType(nodeExecutionDetails?.taskTemplate?.type);

  if (isMapTask) {
    if (nodeExecutionDetails?.taskTemplate?.metadata?.discoverable) {
      if (selectedTaskExecution) {
        const filteredResources = getTaskRetryAtemptsForIndex(
          selectedTaskExecution?.closure?.metadata?.externalResources ?? [],
          selectedTaskExecution.taskIndex!,
        );
        const cacheStatus = filteredResources?.[0]?.cacheStatus;

        return cacheStatus !== null ? (
          <CacheStatus cacheStatus={cacheStatus} variant={variant} className={className} />
        ) : null;
      }

      return (
        <CacheStatus
          cacheStatus={CatalogCacheStatus.MAP_CACHE}
          variant={variant}
          className={className}
        />
      );
    }

    return (
      <CacheStatus
        cacheStatus={CatalogCacheStatus.CACHE_DISABLED}
        variant={variant}
        className={className}
      />
    );
  }

  // cachestatus can be 0
  if (taskNodeMetadata?.cacheStatus === null) {
    return null;
  }

  return (
    <CacheStatus
      cacheStatus={taskNodeMetadata?.cacheStatus}
      sourceTaskExecutionId={taskNodeMetadata?.catalogKey?.sourceTaskExecution}
      variant={variant}
      className={className}
    />
  );
};
