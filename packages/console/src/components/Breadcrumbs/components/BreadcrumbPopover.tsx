import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import isEmpty from 'lodash/isEmpty';
import {
  Box,
  Button,
  Grid,
  Icon,
  Link,
  List,
  ListItem,
  Popover,
  Typography,
} from '@material-ui/core';
import { LoadingSpinner } from 'components/common';
import { useHistory } from 'react-router';
import { Check, InsertLink } from '@material-ui/icons';
import { BreadcrumbEntity, BreadcrumbPopoverInterface } from '../types';

const BreadcrumbPopOver = (props: BreadcrumbPopoverInterface) => {
  const history = useHistory();

  const {
    isLoading,
    error,
    data: popoverQueryData,
  } = useQuery(
    `breadcrumb-list-${props.id}`,
    () => props.asyncData(window.location, props),
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );
  const popoverData: BreadcrumbEntity[] = useMemo(() => {
    if (isEmpty(popoverQueryData) || popoverQueryData === undefined) return [];
    return popoverQueryData;
  }, [popoverQueryData]);

  const {
    isLoading: viewAllQueryIsLoading,
    error: viewAllQueryError,
    data: viewAllQueryData,
  } = useQuery(
    `breadcrumb-view-all-${props.id}`,
    () => {
      if (!props.asyncViewAllLink) return '';
      return props.asyncViewAllLink(window.location, props);
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );
  const viewAllLinkData: string = useMemo(() => {
    if (isEmpty(viewAllQueryData) || viewAllQueryData === undefined) return '';
    return viewAllQueryData;
  }, [viewAllQueryData]);

  // executionTaskWorkflowViewAll

  const viewAllLink = useMemo(() => {
    if (!props.asyncViewAllLink) {
      return typeof props.viewAllLink === 'string'
        ? props.viewAllLink
        : props.viewAllLink(props.projectId, props.domainId, window.location);
    }
    return viewAllLinkData;
  }, [
    props.viewAllLink,
    props.projectId,
    props.domainId,
    window.location,
    viewAllLinkData,
  ]);

  const dataToShow = useMemo(() => {
    const shouldFilter = popoverData.length > 5;
    return !shouldFilter ? popoverData : popoverData.slice(0, 5);
  }, [popoverData]);

  /**
   * Handle the callback to close the popover and navigate to the url
   */
  const handleLink =
    (e, url: string, isActive = false) =>
    () => {
      e.preventDefault();
      e.stopPropagation();

      if (!isActive) {
        history.push(url);
        props.onClose();
      }
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
        spacing={0}
        style={{
          minWidth: 300,
          maxWidth: 350,
        }}
      >
        <Grid
          item
          xs={12}
          style={{
            maxHeight: '70vh',
            overflowY: 'auto',
          }}
        >
          {isLoading && (
            <Box pt={2} marginX="auto">
              <LoadingSpinner size="small" useDelay={false} />
            </Box>
          )}
          {error && <Typography color="error">{error}</Typography>}
          {!isLoading && !!dataToShow?.length && (
            <List>
              {dataToShow.length &&
                dataToShow.map(data => {
                  const activeBasedOnTitle =
                    data.active === undefined &&
                    data.title.trim().toLocaleLowerCase() !==
                      props.value.trim().toLocaleLowerCase();
                  const activeBasedOnAsyncData =
                    data?.active !== undefined && data.active;
                  return (
                    <ListItem
                      key={data.title}
                      button
                      onClick={e =>
                        handleLink(
                          e,
                          data.url,
                          activeBasedOnTitle || activeBasedOnAsyncData,
                        )
                      }
                      className={`breadcrumb-form-control-popover-list-item ${
                        activeBasedOnTitle || activeBasedOnAsyncData
                          ? 'active'
                          : ''
                      }`}
                    >
                      <Grid container alignItems="center">
                        <Grid item xs={2}>
                          {data.active === undefined && (
                            <>
                              {activeBasedOnTitle ? (
                                // Consistent Row Hieght
                                <Icon style={{ visibility: 'hidden' }}>
                                  <InsertLink />
                                </Icon>
                              ) : (
                                <Icon>
                                  <Check />
                                </Icon>
                              )}
                            </>
                          )}
                          {data?.active !== undefined && (
                            <>
                              {data.active && (
                                <Icon>
                                  <Check />
                                </Icon>
                              )}
                            </>
                          )}
                        </Grid>
                        <Grid item xs={6}>
                          <Link
                            onClick={e =>
                              handleLink(
                                e,
                                data.url,
                                activeBasedOnTitle || activeBasedOnAsyncData,
                              )
                            }
                            href={data.url}
                          >
                            {data?.title || 'name not found'}
                          </Link>
                        </Grid>
                        <Grid item xs={4}>
                          <Link
                            onClick={e =>
                              handleLink(
                                e,
                                data.url,
                                activeBasedOnTitle || activeBasedOnAsyncData,
                              )
                            }
                            href={data.url}
                          >
                            {data?.createdAt}
                          </Link>
                        </Grid>
                      </Grid>
                    </ListItem>
                  );
                })}
            </List>
          )}
        </Grid>
        {viewAllLink && !props.asyncViewAllLink && (
          <Grid item xs={12}>
            <hr />
            <Button
              onClick={e => handleLink(e, viewAllLink)}
              href={viewAllLink}
              className="breadcrumb-form-control-view-all-link"
              fullWidth
              // variant="solid"
              color="secondary"
            >
              View All
            </Button>
          </Grid>
        )}
        {!!props.asyncViewAllLink && (
          <Grid item xs={12}>
            <hr />
            {viewAllQueryIsLoading && (
              <Box pt={2}>
                <LoadingSpinner size="small" useDelay={false} />
              </Box>
            )}
            {viewAllQueryError && (
              <Typography color="error">{error}</Typography>
            )}
            {!viewAllQueryIsLoading && viewAllLink.length && (
              <Button
                onClick={e => handleLink(e, viewAllLink)}
                href={viewAllLink}
                className="breadcrumb-form-control-view-all-link"
                fullWidth
                // variant="solid"
                color="secondary"
              >
                View All
              </Button>
            )}
          </Grid>
        )}
      </Grid>
    </Popover>
  );
};

export default BreadcrumbPopOver;
