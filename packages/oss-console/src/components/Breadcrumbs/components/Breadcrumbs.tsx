import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import get from 'lodash/get';
import styled from '@mui/system/styled';
import {
  LOCAL_PROJECT_DOMAIN,
  LocalStorageProjectDomain,
  getLocalStore,
} from '../../common/LocalStoreDefaults';
import { Breadcrumb, BreadcrumbFormControlInterface } from '../types';
import { breadcrumbRegistry } from '../registry';
import BreadcrumbFormControl from './BreadcrumbFormControl';
import { domainIdfromUrl, projectIdfromUrl } from '../async/utils';
import { BreadcrumbTitleActionsPortal } from './BreadcrumbTitleActions';
import { useProjects } from '../../hooks/useProjects';

const BreadcrumbContainer = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1, 2, 2, 2),
}));

/**
 * Top level Breadcumb component used to kick off the breadcrumb rendering.
 * The system will look for a registry and compare it to the URL to see if there are any custom breadcrumbs.
 *
 * The project and domain ids are pulled from the URL as well as the window.location object.
 */
const BreadCrumbs = () => {
  const routerLocation = useLocation();
  // TODO: fix typing
  const routerParams = useParams<any>();
  const projectDomain = getLocalStore(LOCAL_PROJECT_DOMAIN) as LocalStorageProjectDomain;
  // rebuild when page changes
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbFormControlInterface[]>([]);
  const [breadcrumbsHash, setBreadcrumbsHash] = useState('');
  const currentProjectId =
    routerParams.projectId?.trim() || projectIdfromUrl() || projectDomain?.project || '';

  const { data: projectData } = useProjects();

  const currentDomainId = useMemo(() => {
    const id = routerParams.domainId || domainIdfromUrl(window.location) || projectDomain?.domain;
    if (id) return id;

    // get the first domain id from the project
    if (projectData?.length) {
      const currentProject = projectData.find((p) => p.id === currentProjectId);
      if (currentProject) {
        return `${get(currentProject, 'domains[0].id')}` || '';
      }
      return '';
    }
    return '';
  }, [
    routerParams.domainId,
    routerLocation.search,
    projectData,
    projectData?.length,
    currentProjectId,
    projectDomain?.domain,
  ]);

  // respond to custom event hook
  useEffect(() => {
    const listener = (e) => {
      if (e.detail?.breadcrumb) {
        const breadcrumb = e.detail?.breadcrumb as Breadcrumb;
        breadcrumbRegistry.addBreadcrumbSeed(breadcrumb);
        const val = breadcrumbRegistry.breadcrumbBuilder({
          location: window.location,
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

  const lastBreadcrumb = useMemo(() => breadcrumbs[breadcrumbs.length - 1], [breadcrumbsHash]);

  if (!breadcrumbs?.length) {
    return <></>;
  }
  if (breadcrumbs.length <= 2) {
    return <></>;
  }

  return (
    <BreadcrumbContainer container className="breadcrumbs">
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
        <Grid container alignItems="center" spacing={{ xs: 2, md: 1 }}>
          <Grid item xs={12} md={6}>
            <Grid container className="breadcrumbs-current-page-container">
              {lastBreadcrumb?.key && (
                <Grid item xs={12} className="breadcrumbs-title" key={lastBreadcrumb.value}>
                  <BreadcrumbFormControl {...lastBreadcrumb} variant="title" />
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid xs={12} md={6} item className="breadcrumbs-actions-container">
            <BreadcrumbTitleActionsPortal />
          </Grid>
        </Grid>
      </Grid>
    </BreadcrumbContainer>
  );
};

export default BreadCrumbs;
