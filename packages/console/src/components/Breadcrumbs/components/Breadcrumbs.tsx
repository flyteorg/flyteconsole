import React, { useEffect, useMemo } from 'react';
import { listProjects } from 'models/Project/api';
import { useQuery } from 'react-query';
import { useLocation, useParams } from 'react-router-dom';
import startCase from 'lodash/startCase';
import { Grid } from '@material-ui/core';
import uniqBy from 'lodash/uniqBy';
import { BreadcrumbFormControlInterface } from '../types';
import breadcrumbRegistry from '../registry';
import BreadcrumbFormControl from './BreadcrumbFormControl';
import { domainIdfromUrl } from '../async/utils';

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

  const pathSegments = useMemo(() => {
    const pathName = routerLocation.pathname;
    const pathFragments = pathName.split('/').filter(f => !!f);

    const values = {};
    for (let i = 1; i < pathFragments.length; i = i + 2) {
      const key = pathFragments[i];
      const value = pathFragments[i + 1];
      values[key] = value;
    }
    // required segments
    breadcrumbRegistry.breadcrumbs
      .filter(b => b.required)
      .forEach(b => {
        console.log(b.id);
        if (!values[b.id]) values[b.id] = b.defaultValue;
      });

    return Object.entries(values);
  }, [routerLocation.pathname]);

  useEffect(() => {
    // load from user provided registry for custom breadcrumb handling
  }, []);

  const breadcrumbs: BreadcrumbFormControlInterface[] = useMemo(() => {
    /**
     * spacial case to init domainId
     * since its not always present in URL
     */
    if (currentDomainId) {
      breadcrumbRegistry.addBreadcrumb({
        id: 'domains',
        defaultValue: currentDomainId,
      });
    }

    return pathSegments.map(segment => {
      const key = segment[0];
      const value: string = segment[1] ? (segment[1] as string) : '';

      // fill in real value from url and return rest of breadcrumb data
      const breadcrumb = breadcrumbRegistry.addBreadcrumb({
        id: key,
        label: startCase(key),
        defaultValue: value,
      });

      console.log(
        '*** mutated breadcrumbs',
        JSON.parse(JSON.stringify(breadcrumb)),
      );

      return {
        key,
        value: value || breadcrumb.defaultValue || '',
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
