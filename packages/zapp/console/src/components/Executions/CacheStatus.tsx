import { SvgIconProps, Tooltip, Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import CachedOutlined from '@material-ui/icons/CachedOutlined';
import ErrorOutlined from '@material-ui/icons/ErrorOutlined';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import classnames from 'classnames';
import { assertNever } from 'common/utils';
import { PublishedWithChangesOutlined } from 'components/common/PublishedWithChanges';
import { useCommonStyles } from 'components/common/styles';
import { NodeExecutionDetails } from 'components/Executions/types';
import { useNodeExecutionContext } from 'components/Executions/contextProvider/NodeExecutionDetails';
import { CatalogCacheStatus } from 'models/Execution/enums';
<<<<<<<< HEAD:packages/zapp/console/src/components/Executions/CacheStatus.tsx
import { TaskExecutionIdentifier } from 'models/Execution/types';
========
import { NodeExecution, TaskExecutionIdentifier } from 'models/Execution/types';
>>>>>>>> fcb35961d475559a0b0195ad47a2346b1f52f9a1:packages/zapp/console/src/components/Executions/NodeExecutionCacheStatus.tsx
import { MapCacheIcon } from '@flyteconsole/ui-atoms';
import * as React from 'react';
import { isMapTaskType } from 'models/Task/utils';
import { Link as RouterLink } from 'react-router-dom';
import { Routes } from 'routes/routes';
import {
  cacheStatusMessages,
  unknownCacheStatusString,
  viewSourceExecutionString,
} from './constants';

const useStyles = makeStyles((theme: Theme) => ({
  cacheStatus: {
    alignItems: 'center',
    display: 'flex',
    marginTop: theme.spacing(1),
  },
  sourceExecutionLink: {
    fontWeight: 'normal',
  },
}));

/** Renders the appropriate icon for a given CatalogCacheStatus */
const NodeExecutionCacheStatusIcon: React.FC<
  SvgIconProps & {
    status: CatalogCacheStatus;
  }
> = React.forwardRef(({ status, ...props }, ref) => {
  switch (status) {
    case CatalogCacheStatus.CACHE_DISABLED:
    case CatalogCacheStatus.CACHE_MISS: {
      return <InfoOutlined {...props} ref={ref} data-testid="cache-icon" />;
    }
    case CatalogCacheStatus.CACHE_HIT: {
      return <CachedOutlined {...props} ref={ref} data-testid="cache-icon" />;
    }
    case CatalogCacheStatus.CACHE_POPULATED: {
      return <PublishedWithChangesOutlined {...props} ref={ref} data-testid="cache-icon" />;
    }
    case CatalogCacheStatus.CACHE_LOOKUP_FAILURE:
    case CatalogCacheStatus.CACHE_PUT_FAILURE: {
      return <ErrorOutlined {...props} ref={ref} data-testid="cache-icon" />;
    }
    case CatalogCacheStatus.MAP_CACHE: {
      return <MapCacheIcon {...props} ref={ref} data-testid="cache-icon" />;
    }
    case CatalogCacheStatus.MAP_CACHE: {
      return <MapCacheIcon {...props} ref={ref} />;
    }
    default: {
      assertNever(status);
      return null;
    }
  }
});

<<<<<<<< HEAD:packages/zapp/console/src/components/Executions/CacheStatus.tsx
export interface CacheStatusProps {
  cacheStatus: CatalogCacheStatus | null | undefined;
========
export interface NodeExecutionCacheStatusProps {
  execution: NodeExecution;
>>>>>>>> fcb35961d475559a0b0195ad47a2346b1f52f9a1:packages/zapp/console/src/components/Executions/NodeExecutionCacheStatus.tsx
  /** `normal` will render an icon with description message beside it
   *  `iconOnly` will render just the icon with the description as a tooltip
   */
  variant?: 'normal' | 'iconOnly';
  sourceTaskExecutionId?: TaskExecutionIdentifier;
  iconStyles?: React.CSSProperties;
}
<<<<<<<< HEAD:packages/zapp/console/src/components/Executions/CacheStatus.tsx

export const CacheStatus: React.FC<CacheStatusProps> = ({
  cacheStatus,
  sourceTaskExecutionId,
========
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
>>>>>>>> fcb35961d475559a0b0195ad47a2346b1f52f9a1:packages/zapp/console/src/components/Executions/NodeExecutionCacheStatus.tsx
  variant = 'normal',
  iconStyles,
}) => {
<<<<<<<< HEAD:packages/zapp/console/src/components/Executions/CacheStatus.tsx
  const commonStyles = useCommonStyles();
  const styles = useStyles();

  if (cacheStatus == null) {
    return null;
  }

  const message = cacheStatusMessages[cacheStatus] || unknownCacheStatusString;
========
  const taskNodeMetadata = execution.closure?.taskNodeMetadata;
  const detailsContext = useNodeExecutionContext();
  const [nodeDetails, setNodeDetails] = React.useState<NodeExecutionDetails | undefined>();

  React.useEffect(() => {
    let isCurrent = true;
    detailsContext.getNodeExecutionDetails(execution).then((res) => {
      if (isCurrent) {
        setNodeDetails(res);
      }
    });
    return () => {
      isCurrent = false;
    };
  });

  if (isMapTaskType(nodeDetails?.taskTemplate?.type)) {
    if (nodeDetails?.taskTemplate?.metadata?.cacheSerializable) {
      return <CacheStatus cacheStatus={CatalogCacheStatus.MAP_CACHE} variant={variant} />;
    }
  }

  // cachestatus can be 0
  if (taskNodeMetadata?.cacheStatus == null) {
    return null;
  }

  const sourceTaskExecution = taskNodeMetadata.catalogKey?.sourceTaskExecution;

  return (
    <CacheStatus
      cacheStatus={taskNodeMetadata.cacheStatus}
      sourceTaskExecution={sourceTaskExecution}
      variant={variant}
    />
  );
};

export interface CacheStatusProps {
  cacheStatus: CatalogCacheStatus | null | undefined;
  /** `normal` will render an icon with description message beside it
   *  `iconOnly` will render just the icon with the description as a tooltip
   */
  variant?: 'normal' | 'iconOnly';
  sourceTaskExecution?: TaskExecutionIdentifier;
  iconStyles?: React.CSSProperties;
}

export const CacheStatus: React.FC<CacheStatusProps> = ({
  cacheStatus,
  sourceTaskExecution,
  variant = 'normal',
  iconStyles,
}) => {
  const commonStyles = useCommonStyles();
  const styles = useStyles();

  if (cacheStatus == null) {
    return null;
  }

  const message = cacheStatusMessages[cacheStatus] || unknownCacheStatusString;

  const sourceExecutionId = sourceTaskExecution;
  const sourceExecutionLink = sourceExecutionId ? (
    <RouterLink
      className={classnames(commonStyles.primaryLink, styles.sourceExecutionLink)}
      to={Routes.ExecutionDetails.makeUrl(sourceExecutionId.nodeExecutionId.executionId)}
    >
      {viewSourceExecutionString}
    </RouterLink>
  ) : null;
>>>>>>>> fcb35961d475559a0b0195ad47a2346b1f52f9a1:packages/zapp/console/src/components/Executions/NodeExecutionCacheStatus.tsx

  return variant === 'iconOnly' ? (
    <Tooltip title={message}>
      <NodeExecutionCacheStatusIcon
<<<<<<<< HEAD:packages/zapp/console/src/components/Executions/CacheStatus.tsx
        className={classnames(commonStyles.iconRight, commonStyles.iconSecondary)}
========
        className={classnames(
          // commonStyles.iconLeft,
          commonStyles.iconRight,
          commonStyles.iconSecondary,
        )}
>>>>>>>> fcb35961d475559a0b0195ad47a2346b1f52f9a1:packages/zapp/console/src/components/Executions/NodeExecutionCacheStatus.tsx
        style={iconStyles}
        status={cacheStatus}
      />
    </Tooltip>
  ) : (
    <>
      <Typography className={styles.cacheStatus} variant="subtitle1" color="textSecondary">
        <NodeExecutionCacheStatusIcon
          status={cacheStatus}
          className={classnames(commonStyles.iconSecondary, commonStyles.iconLeft)}
        />
        {message}
      </Typography>
      {sourceTaskExecutionId && (
        <RouterLink
          className={classnames(commonStyles.primaryLink, styles.sourceExecutionLink)}
          to={Routes.ExecutionDetails.makeUrl(sourceTaskExecutionId.nodeExecutionId.executionId)}
        >
          {viewSourceExecutionString}
        </RouterLink>
      )}
    </>
  );
};
