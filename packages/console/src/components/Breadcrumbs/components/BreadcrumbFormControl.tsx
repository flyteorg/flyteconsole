import React, { useMemo, useState } from 'react';
import {
  Button,
  Grid,
  IconButton,
  Tooltip,
  makeStyles,
} from '@material-ui/core';
import { ArrowDropDown } from '@material-ui/icons';
import { useHistory } from 'react-router';
import isEmpty from 'lodash/isEmpty';
import { useQuery } from 'react-query';
import {
  LOCAL_PROJECT_DOMAIN,
  LocalStorageProjectDomain,
  setLocalStore,
} from 'components/common';
import { BreadcrumbFormControlInterfaceUI } from '../types';
import BreadcrumbPopOver from './BreadcrumbPopover';
import { defaultVoid } from '../async/fn';

/**
 * This component is a wrapper to facilitate user interaction using MUI components.
 * It is used to render a breadcrumb with a popover.
 *
 * These are used in the Breadcrumbs component.
 */
const BreadcrumbFormControlDefault = (
  props: BreadcrumbFormControlInterfaceUI,
) => {
  const history = useHistory();
  const htmlLabel = `breadcrumb-${props.id}`;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handlePopoverClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const { data: queryAsyncValueData } = useQuery(
    `breadcrumb-selfasync-${props.id}-${props.value}`,
    async () => {
      if (!props.asyncValue) return '';
      return props.asyncValue(window.location, props);
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );
  const asyncValueData: string = useMemo(() => {
    if (isEmpty(queryAsyncValueData) || queryAsyncValueData === undefined)
      return '';
    return queryAsyncValueData;
  }, [queryAsyncValueData]);

  const { data: queryAsyncSelfLinkData } = useQuery(
    `breadcrumb-selflinkasync-${props.id}-${props.value}`,
    async () => {
      if (!props.asyncSelfLink) return '';
      return props.asyncSelfLink(window.location, props);
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );
  const asyncSelfLinkData: string = useMemo(() => {
    if (isEmpty(queryAsyncSelfLinkData) && queryAsyncSelfLinkData === undefined)
      return '';
    return `${queryAsyncSelfLinkData}`;
  }, [queryAsyncSelfLinkData]);

  const handleValueClick = e => {
    e.preventDefault();
    e.stopPropagation();

    if (props.id.startsWith('project') || props.id.startsWith('domain')) {
      const projectDomain: LocalStorageProjectDomain = {
        domain: props.domainId,
        project: props.projectId,
      };
      setLocalStore(LOCAL_PROJECT_DOMAIN, projectDomain);
    }

    if (props.selfLink || props.asyncSelfLink) {
      if (asyncSelfLinkData?.length) {
        history.push(asyncSelfLinkData);
        return;
      } else {
        if (typeof props.selfLink === 'function') {
          history.push(props.selfLink(window.location, props));
          return;
        } else {
          history.push(props.selfLink);
          return;
        }
      }
    }
  };

  const isMoreButtonHidden =
    props.asyncData.name === defaultVoid.name && props.viewAllLink === '';

  const value = useMemo(
    () =>
      !props.asyncValue
        ? ((props.value || props.defaultValue) as string)
        : asyncValueData,
    [props.asyncValue, props.value, props.defaultValue, asyncValueData],
  );

  const styles = makeStyles(theme => ({
    formControl: {
      '& .breadcrumb-form-control-input': {
        cursor: props.selfLink || props.asyncSelfLink ? 'pointer' : 'default',
        color: theme.palette.text.primary,
        '& *': {
          cursor: props.selfLink || props.asyncSelfLink ? 'pointer' : 'default',
        },
      },
      '& button': {
        fontWeight: 500,
      },
      '& h1': {
        margin: 0,
        fontSize: 24,
      },
    },
    noWrap: {
      flexWrap: 'nowrap',
    },
  }))();

  return (
    <div className={`breadcrumb-form-control ${styles.formControl}`}>
      <Grid container alignItems="center" className={styles.noWrap}>
        <Grid item>
          <Tooltip title={`${props.label}: ${value}`}>
            {props.variant !== 'title' ? (
              <Button
                variant="text"
                id={htmlLabel}
                tabIndex={0}
                disabled={!(props.selfLink || props.asyncSelfLink)}
                className="breadcrumb-form-control-input"
                onClick={handleValueClick}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleValueClick(e);
                  }
                }}
                size="small"
              >
                <span aria-hidden="true">/</span>&nbsp;
                {value || ''}
              </Button>
            ) : (
              <h1
                id={htmlLabel}
                className="breadcrumb-form-control-input"
                onClick={handleValueClick}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleValueClick(e);
                  }
                }}
              >
                {value}
              </h1>
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
    </div>
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
