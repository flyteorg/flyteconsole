import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import isEmpty from 'lodash/isEmpty';
import { Grid, Popover } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { BreadcrumbPopoverInterface } from '../types';

const BreadcrumbPopOver = (props: BreadcrumbPopoverInterface) => {
  const { isLoading, error, data } = useQuery(
    `breadcrumb-${props.pathId}`,
    () => props.asyncData(props.projectId, props.domainId),
  );
  const queryData = useMemo(() => {
    if (isEmpty(data) || data === undefined) return [];
    return data;
  }, [data]);

  const viewAllLink =
    typeof props.viewAllLink === 'string'
      ? props.viewAllLink
      : props.viewAllLink(props.projectId, props.domainId);

  console.log('*** BreadcrumbPopOver', data);
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
        {queryData.length &&
          queryData.slice(0, 5).map(data => {
            return (
              <>
                <Grid item xs={6}>
                  <Link to={data.url}>{data?.title || 'name not found'}</Link>
                </Grid>
                <Grid item xs={6}>
                  <Link to={data.url}>{data?.createdAt}</Link>
                </Grid>
              </>
            );
          })}
        <Grid item xs={12}>
          <Link to={viewAllLink}>View All…</Link>
        </Grid>
      </Grid>
    </Popover>
  );
};

export default BreadcrumbPopOver;
