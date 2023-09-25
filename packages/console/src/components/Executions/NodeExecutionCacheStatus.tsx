import { NodeExecutionDetails } from 'components/Executions/types';
import { useNodeExecutionContext } from 'components/Executions/contextProvider/NodeExecutionDetails';
import { CatalogCacheStatus } from 'models/Execution/enums';
import { MapTaskExecution, NodeExecution } from 'models/Execution/types';
import * as React from 'react';
import { isMapTaskType } from 'models/Task/utils';
import { useEffect, useState } from 'react';
import { CacheStatus } from './CacheStatus';
import { getTaskRetryAtemptsForIndex } from './TaskExecutionsList';

interface NodeExecutionCacheStatusProps {
  execution: NodeExecution;
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
export const NodeExecutionCacheStatus: React.FC<
  NodeExecutionCacheStatusProps
> = ({ execution, selectedTaskExecution, variant = 'normal', className }) => {
  const taskNodeMetadata = execution.closure?.taskNodeMetadata;
  const { getNodeExecutionDetails } = useNodeExecutionContext();
  const [nodeDetails, setNodeDetails] = useState<
    NodeExecutionDetails | undefined
  >();
  const isMapTask = isMapTaskType(nodeDetails?.taskTemplate?.type);

  useEffect(() => {
    let isCurrent = true;
    getNodeExecutionDetails(execution).then(res => {
      if (isCurrent) {
        setNodeDetails(res);
      }
    });
    return () => {
      isCurrent = false;
    };
  });

  if (isMapTask) {
    if (nodeDetails?.taskTemplate?.metadata?.discoverable) {
      if (selectedTaskExecution) {
        const filteredResources = getTaskRetryAtemptsForIndex(
          selectedTaskExecution?.closure?.metadata?.externalResources ?? [],
          selectedTaskExecution.taskIndex,
        );
        const cacheStatus = filteredResources?.[0]?.cacheStatus;

        return cacheStatus !== null ? (
          <CacheStatus
            cacheStatus={cacheStatus}
            variant={variant}
            className={className}
          />
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
