import React, { useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import isEmpty from 'lodash/isEmpty';
import {
  Box,
  Button,
  Grid,
  Icon,
  List,
  ListItem,
  Popover,
  Typography,
  makeStyles,
} from '@material-ui/core';
import {
  LOCAL_PROJECT_DOMAIN,
  LoadingSpinner,
  LocalStorageProjectDomain,
  setLocalStore,
} from 'components/common';
import { useHistory } from 'react-router';
import { Check, InsertLinkOutlined } from '@material-ui/icons';
import { BreadcrumbEntity, BreadcrumbPopoverInterface } from '../types';
import { defaultVoid } from '../async/fn';

const BreadcrumbPopOver = (props: BreadcrumbPopoverInterface) => {
  const history = useHistory();
  const queryClient = useQueryClient();

  const {
    isLoading,
    error,
    data: popoverQueryData,
  } = useQuery(
    `breadcrumb-list-${props.id}-${props.value}`,
    () => {
      return !props.asyncData
        ? defaultVoid(window.location, props)
        : props.asyncData(window.location, props);
    },
    {
      refetchOnMount: true,
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
    ['breadcrumb-view-all', props.id],
    () => {
      if (!props.asyncViewAllLink) return '';
      return props.asyncViewAllLink(window.location, props);
    },
    {
      refetchOnMount: true,
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
  const handleLink = (e, url: string, title: string, isActive = false) => {
    e.preventDefault();
    e.stopPropagation();

    // view all link has no title prop
    if (title) {
      const projectValue = props.id.startsWith('project')
        ? title
        : props.projectId;

      const domainValue = props.id.startsWith('domain')
        ? title
        : props.domainId;

      const projectDomain: LocalStorageProjectDomain = {
        project: projectValue,
        domain: domainValue,
      };
      setLocalStore(LOCAL_PROJECT_DOMAIN, projectDomain);
    }

    if (!isActive) {
      history.push(url);
      props.onClose();
      queryClient.invalidateQueries(['breadcrumb-view-all']);
      return;
    }
  };

  const styles = makeStyles(theme => ({
    wrapper: {
      '& a': {
        color: theme.palette.text.primary,
        fontWeight: 500,
        // no text line break css
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      '& button': {
        color: theme.palette.text.primary,
        fontWeight: 500,
      },
    },

    noWrap: {
      flexWrap: 'nowrap',
    },
  }))();

  return (
    <Popover
      className={`breadcrumb-form-control-popover ${styles.wrapper}`}
      open={props.open}
      anchorEl={props.anchorEl}
      onClose={props.onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Grid container>
        {props.popoverTitle && (
          <Grid item xs={12}>
            <Box pt={2} pl={2} marginX="auto">
              <Typography variant="h6" className="popover-title">
                {props.popoverTitle}
              </Typography>
            </Box>
          </Grid>
        )}
        <Grid item xs={12}>
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
                    data.title.trim().toLocaleLowerCase() ===
                      props.value.trim().toLocaleLowerCase();
                  const activeBasedOnAsyncData =
                    data?.active !== undefined && data.active;
                  return (
                    <ListItem
                      key={data.title}
                      button
                      onClick={e => {
                        handleLink(
                          e,
                          data.url,
                          data.title,
                          activeBasedOnTitle || activeBasedOnAsyncData,
                        );
                      }}
                      className={`breadcrumb-form-control-popover-list-item ${
                        activeBasedOnTitle || activeBasedOnAsyncData
                          ? 'active'
                          : ''
                      }`}
                    >
                      <Grid
                        container
                        alignItems="center"
                        className={styles.noWrap}
                        spacing={1}
                      >
                        <Grid item>
                          {data.active === undefined && (
                            <>
                              {!activeBasedOnTitle ? (
                                // Consistent Row Hieght
                                <Icon style={{ opacity: 0 }}>
                                  <InsertLinkOutlined />
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
                              {data.active ? (
                                <Icon>
                                  <Check />
                                </Icon>
                              ) : (
                                <Icon style={{ opacity: 0 }}>
                                  <InsertLinkOutlined />
                                </Icon>
                              )}
                            </>
                          )}
                        </Grid>
                        <Grid item>{data?.title || 'name not found'}</Grid>
                        {data?.createdAt && (
                          <>
                            <Grid item>|</Grid>
                            <Grid item>{data.createdAt}</Grid>
                          </>
                        )}
                      </Grid>
                    </ListItem>
                  );
                })}
            </List>
          )}
        </Grid>
        {viewAllLink && !props.asyncViewAllLink && (
          <Grid item xs={12}>
            <Box paddingLeft={5} paddingBottom={1}>
              <Button
                onClick={e => handleLink(e, viewAllLink, '')}
                href={viewAllLink}
                className="breadcrumb-form-control-view-all-link"
                variant="text"
                color="secondary"
              >
                View All...
              </Button>
            </Box>
          </Grid>
        )}
        {!!props.asyncViewAllLink && (
          <Grid item xs={12}>
            {viewAllQueryIsLoading && (
              <Box pt={2}>
                <LoadingSpinner size="small" useDelay={false} />
              </Box>
            )}
            {viewAllQueryError && (
              <Typography color="error">{error}</Typography>
            )}
            {!viewAllQueryIsLoading && viewAllLink.length && (
              <Box paddingLeft={5} paddingBottom={1}>
                <Button
                  onClick={e => handleLink(e, viewAllLink, '')}
                  href={viewAllLink}
                  className="breadcrumb-form-control-view-all-link"
                  variant="text"
                  color="secondary"
                >
                  View All...
                </Button>
              </Box>
            )}
          </Grid>
        )}
      </Grid>
    </Popover>
  );
};

export default BreadcrumbPopOver;
