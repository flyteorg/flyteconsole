import React, { useEffect, useMemo, useState } from 'react';
import { listProjects } from 'models/Project/api';
import { useQuery } from 'react-query';
import { useLocation, useParams } from 'react-router-dom';
import { Grid, makeStyles } from '@material-ui/core';
import { useExternalConfigurationContext } from 'basics/ExternalConfigurationProvider';
import get from 'lodash/get';
import {
  LOCAL_PROJECT_DOMAIN,
  LocalStorageProjectDomain,
  getLocalStore,
} from 'components/common';
import { Breadcrumb, BreadcrumbFormControlInterface } from '../types';
import { breadcrumbRegistry } from '../registry';
import BreadcrumbFormControl from './BreadcrumbFormControl';
import { domainIdfromUrl, projectIdfromUrl } from '../async/utils';
import { BreadcrumbTitleActionsPortal } from './BreadcrumbTitleActions';

/**
 * Top level Breadcumb component used to kick off the breadcrumb rendering.
 * The system will look for a registry and compare it to the URL to see if there are any custom breadcrumbs.
 *
 * The project and domain ids are pulled from the URL as well as the window.location object.
 *
 * Depends on useExternalConfigurationContext for external configuration.
 * See `flyteBreadcrumbRegistryList` for example usage.
 */
const BreadCrumbs = () => {
  const routerLocation = useLocation();
  const routerParams = useParams();
  const projectDomain = getLocalStore(
    LOCAL_PROJECT_DOMAIN,
  ) as LocalStorageProjectDomain;

  const currentProjectId =
    routerParams['projectId']?.trim() ||
    projectIdfromUrl() ||
    projectDomain?.project ||
    '';

  const projectQuery = useQuery('projects', () => listProjects());
  const projectData = useMemo(() => {
    return !projectQuery.isLoading && projectQuery.data
      ? projectQuery.data
      : [];
  }, [projectQuery.data, projectQuery.isLoading]);

  const currentDomainId = useMemo(() => {
    const id =
      routerParams['domainId'] ||
      domainIdfromUrl(window.location) ||
      projectDomain?.domain;
    if (id) return id;

    // get the first domain id from the project
    if (projectData?.length) {
      const currentProject = projectData.find(p => p.id === currentProjectId);
      if (currentProject) {
        return `${get(currentProject, 'domains[0].id')}` || '';
      } else {
        return '';
      }
    }
    return '';
  }, [
    routerParams['domainId'],
    routerLocation.search,
    projectData,
    projectData?.length,
    currentProjectId,
    projectDomain?.domain,
  ]);

  // load from user provided registry for custom breadcrumb handling
  const { registry } = useExternalConfigurationContext();
  useEffect(() => {
    const breadcrumbs: Breadcrumb[] = registry?.breadcrumbs || [];
    if (breadcrumbs?.length) {
      for (let i = 0; i < breadcrumbs.length; i++) {
        const breadcrumb = breadcrumbs[i];
        breadcrumbRegistry.addBreadcrumbSeed(breadcrumb);
      }
    }
  }, [registry?.breadcrumbs]);

  // respond to custom event hook
  useEffect(() => {
    const listener = e => {
      if (e.detail?.breadcrumb) {
        const breadcrumb = e.detail?.breadcrumb as Breadcrumb;
        breadcrumbRegistry.addBreadcrumbSeed(breadcrumb);
        const val = breadcrumbRegistry.breadcrumbBuilder({
          location,
          projectId: currentProjectId,
          domainId: currentDomainId,
        });
        setBreadcrumbs(val);
        setBreadcrumbsHash(breadcrumbRegistry.renderHash);
      }
    };
    window.addEventListener('__FLYTE__BREADCRUMB__', listener);
    return () => window.removeEventListener('__FLYTE__BREADCRUMB__', listener);
  }, []);

  // rebuild when page changes
  const [breadcrumbs, setBreadcrumbs] = useState<
    BreadcrumbFormControlInterface[]
  >([]);
  const [breadcrumbsHash, setBreadcrumbsHash] = useState('');

  useEffect(() => {
    const location = { ...window.location };
    location.pathname = routerLocation.pathname;

    breadcrumbRegistry.resetBreadcrumbs();

    const val = breadcrumbRegistry.breadcrumbBuilder({
      location,
      projectId: currentProjectId,
      domainId: currentDomainId,
    });
    setBreadcrumbs(val);
    setBreadcrumbsHash(breadcrumbRegistry.renderHash);
  }, [
    routerLocation.pathname,
    routerLocation.search,
    currentProjectId,
    currentDomainId,
    breadcrumbsHash,
    routerLocation.hash,
    breadcrumbRegistry.renderHash,
  ]);

  const lastBreadcrumb = useMemo(
    () => breadcrumbs[breadcrumbs.length - 1],
    [breadcrumbsHash],
  );

  const styles = makeStyles(theme => ({
    breadcrumbContainer: {
      padding: theme.spacing(1, 2, 2, 2),
    },
  }))();

  if (!breadcrumbs?.length) {
    return <></>;
  }
  if (breadcrumbs.length <= 2) {
    return <></>;
  }

  return (
    <Grid container className={`breadcrumbs ${styles.breadcrumbContainer}`}>
      <Grid item xs={12}>
        <Grid container className="breadcrumbs-segment-container">
          {breadcrumbs.map((breadcrumbValue, index) => {
            if (index === breadcrumbs.length - 1) return null;
            return (
              <Grid item key={breadcrumbValue.key}>
                <BreadcrumbFormControl {...breadcrumbValue} />
              </Grid>
            );
          })}
        </Grid>
      </Grid>
      {/* Current page content */}
      <Grid item xs={12}>
        <Grid container alignItems="center">
          <Grid item xs={6}>
            <Grid container className="breadcrumbs-current-page-container">
              {lastBreadcrumb?.key && (
                <Grid
                  item
                  className="breadcrumbs-title"
                  key={lastBreadcrumb.value}
                >
                  <BreadcrumbFormControl {...lastBreadcrumb} variant="title" />
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid xs={6} item className="breadcrumbs-actions-container">
            <BreadcrumbTitleActionsPortal />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default BreadCrumbs;
