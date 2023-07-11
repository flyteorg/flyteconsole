import React, { useEffect, useMemo, useState } from 'react';
import { listProjects } from 'models/Project/api';
import { useQuery } from 'react-query';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@material-ui/core';
import { useExternalConfigurationContext } from 'basics/ExternalConfigurationProvider';
import get from 'lodash/get';
import { Breadcrumb, BreadcrumbFormControlInterface } from '../types';
import breadcrumbRegistry from '../registry';
import BreadcrumbFormControl from './BreadcrumbFormControl';
import { domainIdfromUrl } from '../async/utils';
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

  const currentProjectId = routerParams['projectId'] || '';

  const projectQuery = useQuery('projects', () => listProjects());
  const projectData = useMemo(() => {
    return !projectQuery.isLoading && projectQuery.data
      ? projectQuery.data
      : [];
  }, [projectQuery.data, projectQuery.isLoading]);

  const currentDomainId = useMemo(() => {
    const id = domainIdfromUrl();
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
  }, [routerParams, routerLocation.search, projectData, currentProjectId]);

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
  ]);

  const lastBreadcrumb = useMemo(
    () => breadcrumbs[breadcrumbs.length - 1],
    [breadcrumbsHash],
  );

  return (
    <Grid container className="breadcrumbs" spacing={2}>
      {/* Breadcrumbs from url */}
      <Grid item xs={12}>
        <Grid container className="breadcrumbs-segment-container" spacing={2}>
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
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            <Grid
              container
              className="breadcrumbs-current-page-container"
              spacing={2}
            >
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
