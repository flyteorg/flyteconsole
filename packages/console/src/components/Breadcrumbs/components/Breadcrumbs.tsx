import React, { useEffect, useMemo } from 'react';
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

  // // rebuild when page changes
  // useEffect(() => {
  //   breadcrumbRegistry.resetBreadcrumbs();
  //   breadcrumbRegistry.breadcrumbBuilder({
  //     location: window.location,
  //     projectId: currentProjectId,
  //     domainId: currentDomainId,
  //   });
  // }, [
  //   routerLocation.pathname,
  //   routerLocation.search,
  //   currentProjectId,
  //   currentDomainId,
  //   breadcrumbRegistry.renderHash,
  // ]);

  // rebuild when page changes
  const breadcrumbs: BreadcrumbFormControlInterface[] = useMemo(() => {
    breadcrumbRegistry.resetBreadcrumbs();
    return breadcrumbRegistry.breadcrumbBuilder({
      location: window.location,
      projectId: currentProjectId,
      domainId: currentDomainId,
    });
  }, [
    routerLocation.pathname,
    routerLocation.search,
    currentProjectId,
    currentDomainId,
    breadcrumbRegistry.renderHash,
  ]);

  return (
    <Grid container className="breadcrumbs" spacing={2}>
      {breadcrumbs.map(breadcrumbValue => (
        <Grid item key={breadcrumbValue.key}>
          <BreadcrumbFormControl {...breadcrumbValue} />
        </Grid>
      ))}
    </Grid>
  );
};

export default BreadCrumbs;
