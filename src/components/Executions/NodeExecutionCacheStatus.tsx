import { SvgIconProps, Tooltip, Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import CachedOutlined from '@material-ui/icons/CachedOutlined';
import ErrorOutlined from '@material-ui/icons/ErrorOutlined';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import * as classnames from 'classnames';
import { assertNever } from 'common/utils';
import { PublishedWithChangesOutlined } from 'components/common/PublishedWithChanges';
import { useCommonStyles } from 'components/common/styles';
import { Core } from 'flyteidl';
import { TaskNodeMetadata } from 'models/Execution/types';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Routes } from 'routes/routes';
import {
    cacheStatusMessages,
    unknownCacheStatusString,
    viewSourceExecutionString
} from './constants';

const useStyles = makeStyles((theme: Theme) => ({
    cacheStatus: {
        alignItems: 'center',
        display: 'flex',
        marginTop: theme.spacing(1)
    },
    sourceExecutionLink: {
        fontWeight: 'normal'
    }
}));

/** Renders the appropriate icon for a given `Core.CatalogCacheStatus` */
export const NodeExecutionCacheStatusIcon: React.FC<SvgIconProps & {
    status: Core.CatalogCacheStatus;
}> = React.forwardRef(({ status, ...props }, ref) => {
    switch (status) {
        case Core.CatalogCacheStatus.CACHE_DISABLED:
        case Core.CatalogCacheStatus.CACHE_MISS: {
            return <InfoOutlined {...props} ref={ref} />;
        }
        case Core.CatalogCacheStatus.CACHE_HIT: {
            return <CachedOutlined {...props} ref={ref} />;
        }
        case Core.CatalogCacheStatus.CACHE_POPULATED: {
            return <PublishedWithChangesOutlined {...props} ref={ref} />;
        }
        case Core.CatalogCacheStatus.CACHE_LOOKUP_FAILURE:
        case Core.CatalogCacheStatus.CACHE_PUT_FAILURE: {
            return <ErrorOutlined {...props} ref={ref} />;
        }
        default: {
            assertNever(status);
            return null;
        }
    }
});

export interface NodeExecutionCacheStatusProps {
    taskNodeMetadata?: TaskNodeMetadata;
    /** `normal` will render an icon with description message beside it
     *  `iconOnly` will render just the icon with the description as a tooltip
     */
    variant?: 'normal' | 'iconOnly';
}
/** For a given `NodeExecution.closure.taskNodeMetadata` object, will render
 * the cache status with a descriptive message. For `Core.CacheCatalogStatus.CACHE_HIT`,
 * it will also attempt to render a link to the source `WorkflowExecution` (normal
 * variant only).
 */
export const NodeExecutionCacheStatus: React.FC<NodeExecutionCacheStatusProps> = ({
    taskNodeMetadata,
    variant = 'normal'
}) => {
    const commonStyles = useCommonStyles();
    const styles = useStyles();
    if (taskNodeMetadata == null || taskNodeMetadata.cacheStatus == null) {
        return null;
    }

    const message =
        cacheStatusMessages[taskNodeMetadata.cacheStatus] ||
        unknownCacheStatusString;

    const sourceExecutionId = taskNodeMetadata.catalogKey?.sourceTaskExecution;
    const sourceExecutionLink = sourceExecutionId ? (
        <RouterLink
            className={classnames(
                commonStyles.primaryLink,
                styles.sourceExecutionLink
            )}
            to={Routes.ExecutionDetails.makeUrl(
                sourceExecutionId.nodeExecutionId.executionId
            )}
        >
            {viewSourceExecutionString}
        </RouterLink>
    ) : null;

    return variant === 'iconOnly' ? (
        <Tooltip title={message} aria-label="cache status">
            <NodeExecutionCacheStatusIcon
                className={classnames(
                    commonStyles.iconLeft,
                    commonStyles.iconRight,
                    commonStyles.iconSecondary
                )}
                status={taskNodeMetadata.cacheStatus}
            />
        </Tooltip>
    ) : (
        <div>
            <Typography
                className={styles.cacheStatus}
                variant="subtitle1"
                color="textSecondary"
            >
                <NodeExecutionCacheStatusIcon
                    status={taskNodeMetadata.cacheStatus}
                    className={classnames(
                        commonStyles.iconSecondary,
                        commonStyles.iconLeft
                    )}
                />
                {message}
            </Typography>
            {sourceExecutionLink}
        </div>
    );
};
