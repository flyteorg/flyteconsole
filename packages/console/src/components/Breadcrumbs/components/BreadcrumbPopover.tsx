import React, { Fragment, useMemo } from 'react';
import { useQuery } from 'react-query';
import isEmpty from 'lodash/isEmpty';
import { Grid, Link, Popover, Typography } from '@material-ui/core';
import { LoadingSpinner } from 'components/common';
import { useHistory } from 'react-router';
import { BreadcrumbEntity, BreadcrumbPopoverInterface } from '../types';

const BreadcrumbPopOver = (props: BreadcrumbPopoverInterface) => {
  const history = useHistory();

  const { isLoading, error, data } = useQuery(
    `breadcrumb-${props.id}`,
    () => props.asyncData(props.projectId, props.domainId),
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );
  const queryData: BreadcrumbEntity[] = useMemo(() => {
    if (isEmpty(data) || data === undefined) return [];
    return data;
  }, [data]);

  const viewAllLink =
    typeof props.viewAllLink === 'string'
      ? props.viewAllLink
      : props.viewAllLink(props.projectId, props.domainId, window.location);

  const dataToShow = useMemo(() => {
    return queryData
      .filter(breadcrumb => {
        return breadcrumb.title !== props.value;
      })
      .slice(0, 5);
  }, [queryData]);

  /**
   * Handle the callback to close the popover and navigate to the url
   */
  const handleLink = (e, url: string) => () => {
    e.preventDefault();
    e.stopPropagation();

    history.push(url);
    props.onClose();
  };

  return (
    <Popover
      className="breadcrumb-form-control-popover"
      open={props.open}
      anchorEl={props.anchorEl}
      onClose={props.onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Grid
        container
        spacing={2}
        style={{ maxWidth: 350, maxHeight: '80vh', overflowY: 'scroll' }}
      >
        {isLoading && <LoadingSpinner />}
        {error && <Typography color="error">{error}</Typography>}
        {!isLoading &&
          dataToShow.length &&
          dataToShow.map(data => {
            return (
              <Fragment key={data.title}>
                <Grid item xs={6}>
                  <Link onClick={e => handleLink(e, data.url)} href={data.url}>
                    {data?.title || 'name not found'}
                  </Link>
                </Grid>
                <Grid item xs={6}>
                  <Link onClick={e => handleLink(e, data.url)} href={data.url}>
                    {data?.createdAt}
                  </Link>
                </Grid>
              </Fragment>
            );
          })}
        {viewAllLink && (
          <Grid item xs={12}>
            <Link
              onClick={e => handleLink(e, viewAllLink)}
              href={viewAllLink}
              className="breadcrumb-form-control-view-all-link"
            >
              View All…
            </Link>
          </Grid>
        )}
      </Grid>
    </Popover>
  );
};

export default BreadcrumbPopOver;
