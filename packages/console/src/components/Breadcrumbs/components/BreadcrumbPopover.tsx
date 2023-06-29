import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import isEmpty from 'lodash/isEmpty';
import { Grid, Popover, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from 'components/common';
import { BreadcrumbEntity, BreadcrumbPopoverInterface } from '../types';

const BreadcrumbPopOver = (props: BreadcrumbPopoverInterface) => {
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

  return (
    <Popover
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
              <>
                <Grid item xs={6}>
                  <Link onClick={props.onClose} to={data.url}>
                    {data?.title || 'name not found'}
                  </Link>
                </Grid>
                <Grid item xs={6}>
                  <Link onClick={props.onClose} to={data.url}>
                    {data?.createdAt}
                  </Link>
                </Grid>
              </>
            );
          })}
        {viewAllLink && (
          <Grid item xs={12}>
            <Link onClick={props.onClose} to={viewAllLink}>
              View All…
            </Link>
          </Grid>
        )}
      </Grid>
    </Popover>
  );
};

export default BreadcrumbPopOver;
