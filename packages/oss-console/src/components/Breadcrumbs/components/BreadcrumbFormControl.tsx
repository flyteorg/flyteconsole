import React, { forwardRef, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import { useHistory } from 'react-router';
import isEmpty from 'lodash/isEmpty';
import { useQuery } from 'react-query';
import styled from '@mui/system/styled';
import { Link } from 'react-router-dom';
import { useCommonStyles } from '@clients/theme/CommonStyles/CommonStyles';
import { Instance } from '@popperjs/core';
import { Shimmer } from '@clients/primitives/Shimmer';
import {
  LOCAL_PROJECT_DOMAIN,
  LocalStorageProjectDomain,
  setLocalStore,
} from '../../common/LocalStoreDefaults';
import { BreadcrumbFormControlInterfaceUI } from '../types';
import BreadcrumbPopOver from './BreadcrumbPopover';
import { breadcrumQueryOptions } from '../async/utils';

interface StyledBreadcrumbFormControlInterfaceUI extends BreadcrumbFormControlInterfaceUI {
  className?: string;
}

const StyledWrapper = styled('div')<StyledBreadcrumbFormControlInterfaceUI>(
  ({ theme, asyncSelfLink, selfLink }) => ({
    width: '100%',
    '& .breadcrumb-form-control-input': {
      cursor: selfLink || asyncSelfLink ? 'pointer' : 'default',
      color: theme.palette.text.primary,
      '& *': {
        cursor: selfLink || asyncSelfLink ? 'pointer' : 'default',
      },
    },
    '& button': {
      fontWeight: 500,
    },
    '& h1': {
      margin: 0,
      fontSize: 24,
    },
    '& .noWrap': {
      flexWrap: 'nowrap',
    },
  }),
) as React.ComponentType<StyledBreadcrumbFormControlInterfaceUI>;

/**
 * This component is a wrapper to facilitate user interaction using MUI components.
 * It is used to render a breadcrumb with a popover.
 *
 * These are used in the Breadcrumbs component.
 */
const BreadcrumbFormControlDefault = (props: BreadcrumbFormControlInterfaceUI) => {
  const history = useHistory();
  const htmlLabel = `breadcrumb-${props.id}`;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handlePopoverClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const commonStyles = useCommonStyles();

  const { data: queryAsyncValueData } = useQuery(
    `breadcrumb-selfasync-${props.id}-${props.value}`,
    async () => {
      if (!props.asyncValue) return '';
      return props.asyncValue(window.location, props);
    },
    breadcrumQueryOptions,
  );
  const asyncValueData: string = useMemo(() => {
    if (isEmpty(queryAsyncValueData) || queryAsyncValueData === undefined) return '';
    return queryAsyncValueData;
  }, [queryAsyncValueData]);

  const { data: queryAsyncSelfLinkData } = useQuery(
    `breadcrumb-selflinkasync-${props.id}-${props.value}`,
    async () => {
      if (!props.asyncSelfLink) return '';
      return props.asyncSelfLink(window.location, props);
    },
    breadcrumQueryOptions,
  );
  const asyncSelfLinkData: string = useMemo(() => {
    if (isEmpty(queryAsyncSelfLinkData) && queryAsyncSelfLinkData === undefined) return '';
    return `${queryAsyncSelfLinkData}`;
  }, [queryAsyncSelfLinkData]);

  const handleValueClick = (e) => {
    const isDisabled = !(props.selfLink || props.asyncSelfLink);
    if (isDisabled || !e?.nativeEvent?.metaKey) {
      e.preventDefault();
    }
    e.stopPropagation();

    // project/domain values comes from the url segment
    const projectValue = props.id.startsWith('project') ? props.value : props.projectId;
    const domainValue = props.id.startsWith('domain') ? props.value : props.domainId;

    const projectDomain: LocalStorageProjectDomain = {
      project: projectValue,
      domain: domainValue,
    };

    setLocalStore(LOCAL_PROJECT_DOMAIN, projectDomain);

    if (!e?.nativeEvent?.metaKey) {
      if (props.selfLink || props.asyncSelfLink) {
        if (asyncSelfLinkData?.length) {
          history.push(asyncSelfLinkData);
        } else if (typeof props.selfLink === 'function') {
          history.push(props.selfLink(window.location, props));
        } else {
          history.push(props.selfLink);
        }
      }
    }
  };

  const isMoreButtonHidden = !props.asyncData && props.viewAllLink === '';

  const value = useMemo(
    () => (!props.asyncValue ? ((props.value || props.defaultValue) as string) : asyncValueData),
    [props.asyncValue, props.value, props.defaultValue, asyncValueData],
  );

  const selfLinkHref = useMemo(() => {
    if (props.asyncData || asyncSelfLinkData) {
      return asyncSelfLinkData;
    }
    if (typeof props.selfLink === 'function') {
      return props.selfLink(window.location, props);
    }
    return props.selfLink;
  }, [props.selfLink, props.projectId, props.domainId, props.asyncData, asyncSelfLinkData]);

  const areaRef = React.useRef<HTMLDivElement>(null);
  const positionRef = React.useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const popperRef = React.useRef<Instance>(null);
  const handleMouseMove = (event: React.MouseEvent) => {
    positionRef.current = { x: event.clientX, y: event.clientY };

    if (popperRef.current != null) {
      popperRef.current.update();
    }
  };

  return (
    <StyledWrapper className="breadcrumb-form-control" {...props}>
      <Grid
        container
        alignItems="center"
        className="noWrap"
        sx={{
          width: '100%',
        }}
      >
        <Grid
          item
          ref={areaRef}
          sx={{
            maxWidth: '100%',
          }}
        >
          <Tooltip
            title={`${props.label}: ${value}`}
            PopperProps={{
              popperRef,
              anchorEl: {
                getBoundingClientRect: () => {
                  return new DOMRect(
                    positionRef.current.x,
                    areaRef.current!.getBoundingClientRect().y + 20,
                    0,
                    0,
                  );
                },
              },
            }}
          >
            {props.variant !== 'title' ? (
              <Button
                onMouseMove={handleMouseMove}
                component="a"
                variant="text"
                id={htmlLabel}
                tabIndex={0}
                disabled={!(props.selfLink || props.asyncSelfLink)}
                className={`breadcrumb-form-control-input ${commonStyles.truncateText}`}
                onClick={handleValueClick}
                href={selfLinkHref || '#'} // empty href will not use LinkComponent
                LinkComponent={forwardRef((props, ref) => {
                  return <Link to={props?.href} ref={ref} {...props} />;
                })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleValueClick(e);
                  }
                }}
                size="small"
                sx={{
                  paddingLeft: 0,
                  paddingRight: 0,
                }}
              >
                <span aria-hidden="true">/</span>&nbsp;
                {value || <Shimmer />}
              </Button>
            ) : (
              <Typography
                onMouseMove={handleMouseMove}
                id={htmlLabel}
                variant="h1"
                className={`breadcrumb-form-control-input title ${commonStyles.truncateText}`}
                onClick={handleValueClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleValueClick(e);
                  }
                }}
              >
                {value}
              </Typography>
            )}
          </Tooltip>
        </Grid>
        <Grid item>
          {!isMoreButtonHidden ? (
            <IconButton
              className="breadcrumb-form-control-more-button"
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              size="small"
              onClick={handlePopoverClick}
            >
              <ArrowDropDown />
            </IconButton>
          ) : (
            <IconButton
              className="breadcrumb-form-control-more-button hidden"
              size="small"
              aria-hidden
              tabIndex={-1}
              style={{ opacity: 0 }}
            >
              <ArrowDropDown />
            </IconButton>
          )}
        </Grid>
      </Grid>

      {!!anchorEl && (
        <BreadcrumbPopOver
          onClose={handlePopoverClose}
          anchorEl={anchorEl}
          open={!!anchorEl}
          {...props}
          value={value}
        />
      )}
    </StyledWrapper>
  );
};

/**
 * This component is a wrapper to facilitate user interaction using MUI components.
 * It is used to render a breadcrumb with a popover.
 *
 * These are used in the Breadcrumbs component.
 */
const BreadcrumbFormControl = (props: BreadcrumbFormControlInterfaceUI) => {
  const { customComponent: CustomComponent } = props;
  if (CustomComponent) {
    return (
      <CustomComponent {...props}>
        <BreadcrumbFormControlDefault {...props} />
      </CustomComponent>
    );
  }
  return <BreadcrumbFormControlDefault {...props} />;
};

export default BreadcrumbFormControl;
