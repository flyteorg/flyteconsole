import React, { useEffect, useMemo } from 'react';
import { listProjects } from 'models/Project/api';
import { useQuery } from 'react-query';
import { useLocation, useParams } from 'react-router-dom';
import startCase from 'lodash/startCase';
import { Grid } from '@material-ui/core';
import { BreadcrumbFormControlInterface } from '../types';
import breadcrumbRegistry from '../registry';
import BreadcrumbFormControl from './BreadcrumbFormControl';

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
    if (routerParams['domainId']) {
      return routerParams['domainId'];
    }
    if (routerLocation.search.includes('domain')) {
      const searchParams = new URLSearchParams(routerLocation.search);
      return searchParams.get('domain') || '';
    }
    if (projectData.length) {
      const currentProject = projectData.find(p => p.id === currentProjectId);
      if (currentProject) {
        return currentProject.domains[0].id;
      } else {
        return '';
      }
    }
    return '';
  }, [routerParams, routerLocation.search, projectData, currentProjectId]);

  console.log('*** projectData', projectData);
  console.log('*** routerParams', routerParams);
  console.log('*** routerLocation', routerLocation);
  console.log('*** currentDomainId', currentDomainId);

  const pathSegments = useMemo(() => {
    const pathName = routerLocation.pathname;
    const pathFragments = pathName.split('/').filter(f => !!f);

    const values = {};
    for (let i = 1; i < pathFragments.length; i = i + 2) {
      const key = pathFragments[i];
      const value = pathFragments[i + 1];
      values[key] = value;
    }

    return Object.entries(values);
  }, [routerLocation.pathname]);

  useEffect(() => {
    // load from user provided registry for custom breadcrumb handling
  }, []);

  const breadcrumbs: BreadcrumbFormControlInterface[] = useMemo(() => {
    return pathSegments.map(segment => {
      const key = segment[0];
      const value: string = segment[1] ? (segment[1] as string) : '';

      const breadcrumb = breadcrumbRegistry.addBreadcrumb({
        pathId: key,
        label: startCase(key),
        defaultValue: value,
      });

      return {
        key,
        value,
        projectId: currentProjectId,
        domainId: currentDomainId,
        ...breadcrumb,
      };
    });
  }, [pathSegments, currentProjectId, currentDomainId]);

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
