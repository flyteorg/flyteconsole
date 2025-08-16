import React from 'react';
import { type SvgIconProps } from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CachedOutlined from '@mui/icons-material/CachedOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import ErrorOutlined from '@mui/icons-material/ErrorOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import SmsFailedOutlinedIcon from '@mui/icons-material/SmsFailedOutlined';
import classnames from 'classnames';
import MapCacheIcon from '@clients/ui-atoms/MapCacheIcon';
import { Link as RouterLink } from 'react-router-dom';
import styled from '@mui/system/styled';
import { assertNever } from '../../common/utils';
import { PublishedWithChangesOutlined } from '../common/PublishedWithChanges';
import { useCommonStyles } from '../common/styles';
import { CatalogCacheStatus } from '../../models/Execution/enums';
import { TaskExecutionIdentifier } from '../../models/Execution/types';
import { Routes } from '../../routes/routes';
import {
  cacheStatusMessages,
  unknownCacheStatusString,
  viewSourceExecutionString,
} from './constants';

const StyledTypography = styled(Typography)(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  marginTop: theme.spacing(1),
}));

/** Renders the appropriate icon for a given CatalogCacheStatus */
const NodeExecutionCacheStatusIcon: React.ComponentType<
  SvgIconProps & {
    status: CatalogCacheStatus;
  }
> = React.forwardRef(({ status, ...svgIconProps }, ref) => {
  switch (status) {
    case CatalogCacheStatus.CACHE_DISABLED: {
      return <InfoOutlined {...svgIconProps} ref={ref} data-testid="cache-icon" />;
    }
    case CatalogCacheStatus.CACHE_MISS:
    case CatalogCacheStatus.CACHE_SKIPPED: {
      return <SmsFailedOutlinedIcon {...svgIconProps} ref={ref} data-testid="cache-icon" />;
    }
    case CatalogCacheStatus.CACHE_HIT: {
      return <CachedOutlined {...svgIconProps} ref={ref} data-testid="cache-icon" />;
    }
    case CatalogCacheStatus.CACHE_POPULATED: {
      return <PublishedWithChangesOutlined {...svgIconProps} ref={ref} data-testid="cache-icon" />;
    }
    case CatalogCacheStatus.CACHE_LOOKUP_FAILURE:
    case CatalogCacheStatus.CACHE_PUT_FAILURE: {
      return <ErrorOutlined {...svgIconProps} ref={ref} data-testid="cache-icon" />;
    }
    case CatalogCacheStatus.MAP_CACHE: {
      return <MapCacheIcon {...svgIconProps} ref={ref} data-testid="cache-icon" />;
    }
    case CatalogCacheStatus.CACHE_EVICTED: {
      return <DeleteForeverOutlinedIcon {...svgIconProps} ref={ref} data-testid="cache-icon" />;
    }
    default: {
      assertNever(status as never);
      // @ts-ignore
      return null;
    }
  }
});

export type CacheStatusProps = SvgIconProps & {
  cacheStatus: CatalogCacheStatus | null | undefined;
  /** `normal` will render an icon with description message beside it
   *  `iconOnly` will render just the icon with the description as a tooltip
   */
  variant?: 'normal' | 'iconOnly';
  sourceTaskExecutionId?: TaskExecutionIdentifier;
  iconStyles?: React.CSSProperties;
  className?: string;
};

export const CacheStatus: React.FC<CacheStatusProps> = ({
  cacheStatus,
  sourceTaskExecutionId,
  variant = 'normal',
  iconStyles,
  className,
  ...svgIconProps
}) => {
  const commonStyles = useCommonStyles();

  if (cacheStatus == null) {
    return null;
  }

  const message = cacheStatusMessages[cacheStatus] || unknownCacheStatusString;

  return variant === 'iconOnly' ? (
    <Tooltip title={message} className={className}>
      <NodeExecutionCacheStatusIcon
        className={classnames(commonStyles.iconRight, commonStyles.iconSecondary, className)}
        style={iconStyles}
        status={cacheStatus}
        {...svgIconProps}
      />
    </Tooltip>
  ) : (
    <div>
      <StyledTypography className={classnames(className)} color="textSecondary">
        <NodeExecutionCacheStatusIcon
          status={cacheStatus}
          className={classnames(commonStyles.iconSecondary, commonStyles.iconLeft, className)}
          {...svgIconProps}
        />
        {message}
      </StyledTypography>
      {sourceTaskExecutionId && (
        <RouterLink
          className={classnames(commonStyles.primaryLink, className)}
          to={Routes.ExecutionDetails.makeUrl(sourceTaskExecutionId.nodeExecutionId.executionId)}
          style={{
            fontWeight: 'normal',
          }}
        >
          {viewSourceExecutionString}
        </RouterLink>
      )}
    </div>
  );
};
