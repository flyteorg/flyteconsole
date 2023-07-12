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
import { BreadcrumbFormControlInterface } from '../types';
import BreadcrumbPopOver from './BreadcrumbPopover';
import { defaultVoid } from '../async/fn';

interface BreadcrumbFormControlInterfaceUI
  extends BreadcrumbFormControlInterface {
  variant?: 'title' | 'inline';
}

/**
 * This component is a wrapper around the Material UI FormControl component.
 * It is used to render a breadcrumb with a popover.
 *
 * These are used in the Breadcrumbs component.
 */
const BreadcrumbFormControl = (props: BreadcrumbFormControlInterfaceUI) => {
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
    `breadcrumb-selfasync-${props.id}`,
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
    `breadcrumb-selflinkasync-${props.id}`,
    async () => {
      if (!props.asyncValue) return '';
      return props.asyncValue(window.location, props);
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );
  const asyncSelfLinkData: string = useMemo(() => {
    if (isEmpty(queryAsyncSelfLinkData) || queryAsyncSelfLinkData === undefined)
      return '';
    return queryAsyncSelfLinkData;
  }, [queryAsyncSelfLinkData]);

  const handleValueClick = e => {
    e.preventDefault();
    e.stopPropagation();
    if (props.selfLink || props.asyncSelfLink) {
      if (asyncSelfLinkData) {
        history.push(asyncSelfLinkData);
      }
      if (typeof props.selfLink === 'function') {
        history.push(props.selfLink(window.location, props));
      } else {
        history.push(props.selfLink);
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
      '& h1': {
        margin: 0,
      },
    },
  }))();

  return (
    <div className={`breadcrumb-form-control ${styles.formControl}`}>
      <Grid container alignItems="center">
        <Grid item>
          <Tooltip title={`${props.label}: ${value}`}>
            {props.variant !== 'title' ? (
              <Button
                variant="text"
                id={htmlLabel}
                tabIndex={0}
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
                <small>{value}</small>
              </h1>
            )}
          </Tooltip>
        </Grid>
        <Grid item>
          {!isMoreButtonHidden && (
            <IconButton
              className="breadcrumb-form-control-more-button"
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              size={props.variant === 'title' ? 'medium' : 'small'}
              onClick={handlePopoverClick}
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

export default BreadcrumbFormControl;
