import React, { forwardRef, useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import isEmpty from 'lodash/isEmpty';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Icon from '@mui/material/Icon';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { useHistory } from 'react-router';
import Check from '@mui/icons-material/Check';
import InsertLinkOutlined from '@mui/icons-material/InsertLinkOutlined';
import styled from '@mui/system/styled';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '@clients/primitives/LoadingSpinner';
import {
  LOCAL_PROJECT_DOMAIN,
  LocalStorageProjectDomain,
  setLocalStore,
} from '../../common/LocalStoreDefaults';
import { BreadcrumbEntity, BreadcrumbPopoverInterface } from '../types';
import { defaultVoid } from '../async/fn';
import { breadcrumQueryOptions } from '../async/utils';

const StyledPopover = styled(Popover)(({ theme }) => ({
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
  '.noWrap': {
    flexWrap: 'nowrap',
  },
}));

const BreadcrumbPopOver = (props: BreadcrumbPopoverInterface) => {
  const history = useHistory();
  const queryClient = useQueryClient();

  const {
    isLoading,
    error,
    data: popoverQueryData,
  } = useQuery(`breadcrumb-list-${props.id}-${props.value}`, () => {
    return !props.asyncData
      ? defaultVoid(window.location, props)
      : props.asyncData(window.location, props);
  });

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
    breadcrumQueryOptions,
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
  }, [props.viewAllLink, props.projectId, props.domainId, window.location, viewAllLinkData]);

  const dataToShow = useMemo(() => {
    const shouldFilter = popoverData.length > 5;
    return !shouldFilter ? popoverData : popoverData.slice(0, 5);
  }, [popoverData]);

  /**
   * Handle the callback to close the popover and navigate to the url
   */
  const handleLink = (e, url: string, title: string, id?: string, isActive = false) => {
    if (!e?.nativeEvent?.metaKey) {
      e.preventDefault();
    }
    e.stopPropagation();

    // view all link has no title prop
    // only project and domain have id
    if (title && id !== undefined) {
      const projectValue = props.id.startsWith('project') && id ? id : props.projectId;

      const domainValue = props.id.startsWith('domain') && id ? id : props.domainId;

      const projectDomain: LocalStorageProjectDomain = {
        project: projectValue,
        domain: domainValue,
      };
      setLocalStore(LOCAL_PROJECT_DOMAIN, projectDomain);
    }

    if (!isActive) {
      if (!e?.nativeEvent?.metaKey) {
        history.push(url);
        props.onClose();
        queryClient.invalidateQueries(['breadcrumb-view-all']);
      }
    }
  };

  return (
    <StyledPopover
      className="breadcrumb-form-control-popover"
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
          {error ? (
            <Typography color="error">{`Data unavailible, please try again. ${error}`}</Typography>
          ) : null}
          {!isLoading && !!dataToShow?.length && (
            <List>
              {dataToShow.length &&
                dataToShow.map((data) => {
                  const activeBasedOnTitle =
                    data.active === undefined &&
                    data.title.trim().toLocaleLowerCase() ===
                      props.value.trim().toLocaleLowerCase();
                  const activeBasedOnAsyncData = data?.active !== undefined && data.active;
                  return (
                    <ListItemButton
                      key={data.title}
                      onClick={(e) => {
                        handleLink(
                          e,
                          data.url,
                          data.title,
                          data.id,
                          activeBasedOnTitle || activeBasedOnAsyncData,
                        );
                      }}
                      href={data.url}
                      LinkComponent={forwardRef((props, ref) => {
                        return <Link to={props?.href} ref={ref} {...props} />;
                      })}
                      className={`breadcrumb-form-control-popover-list-item ${
                        activeBasedOnTitle || activeBasedOnAsyncData ? 'active' : ''
                      }`}
                    >
                      <Grid container alignItems="center" className="noWrap" spacing={1}>
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
                    </ListItemButton>
                  );
                })}
            </List>
          )}
        </Grid>
        {viewAllLink && !props.asyncViewAllLink && (
          <Grid item xs={12}>
            <List sx={{ paddingTop: 0 }}>
              <ListItemButton
                onClick={(e) => handleLink(e, viewAllLink, '')}
                href={viewAllLink}
                className="breadcrumb-form-control-view-all-link"
                color="secondary"
                sx={{
                  paddingLeft: (theme) => theme.spacing(6),
                }}
              >
                View All...
              </ListItemButton>
            </List>
          </Grid>
        )}
        {!!props.asyncViewAllLink && (
          <Grid item xs={12}>
            <List sx={{ paddingTop: 0 }}>
              {viewAllQueryIsLoading && (
                <Box pt={2}>
                  <LoadingSpinner size="small" useDelay={false} />
                </Box>
              )}
              {viewAllQueryError ? (
                <Typography color="error">{`Data unavailible, please try again. ${error}`}</Typography>
              ) : null}
              {!viewAllQueryIsLoading && viewAllLink.length && (
                <ListItemButton
                  onClick={(e) => handleLink(e, viewAllLink, '')}
                  href={viewAllLink}
                  className="breadcrumb-form-control-view-all-link"
                  color="secondary"
                  sx={{
                    paddingLeft: (theme) => theme.spacing(6),
                  }}
                >
                  View All...
                </ListItemButton>
              )}
            </List>
          </Grid>
        )}
      </Grid>
    </StyledPopover>
  );
};

export default BreadcrumbPopOver;
