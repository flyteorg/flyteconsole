import { useEffect } from 'react';
import { History } from 'history';
import { LocalStorageProjectDomain } from '../components/common/LocalStoreDefaults';
import { Routes } from './routes';

/**
 * Update the new domain URL structure.
 * The domain is now in the URL segment instead of a query param.
 */
export const useDomainPathUpgrade = (
  localProjectDomain: LocalStorageProjectDomain,
  pathname: string,
  search: string,
  history: History<any>,
) => {
  useEffect(() => {
    // no upgrade needed
    if (pathname === Routes.SelectProject.path) {
      return;
    }
    if (pathname.startsWith('/dashboard') || pathname.startsWith('dashboard')) {
      return;
    }
    // assume UI is mounting, no projects segment
    // eg, /console (pending other redirects)
    if (!pathname.includes('/projects/')) {
      return;
    }

    // check for domain to exist: url segment, query param, or localstorage

    // url segment
    const pathSegments = pathname.split('/');
    const isDomainInURLSegment = pathSegments.indexOf('domains');

    // upgrade has been performed, exit
    if (isDomainInURLSegment > -1) {
      // found
      return;
    }

    // query params - needs upgrade
    const queryParams = new URLSearchParams(search);
    const domainIdQueryParam = queryParams.get('domain');

    // local storage - use if none provided
    const domainLocal = localProjectDomain?.domain;

    // if domain is not in url segment, query param, or local storage
    // redirect to select project page, need a "default" domain,
    // we dont know what to pick!
    if (!domainIdQueryParam && !domainLocal) {
      // select URL
      history.push(Routes.SelectProject.path);
    }

    // add domainId to url segment
    if (domainIdQueryParam || domainLocal) {
      // prefer a user explicitly including in URL over memory
      // logic to persist in memory is present in other parts of app when switching project-domains
      const domainToAdd = !domainIdQueryParam?.length ? domainLocal : domainIdQueryParam;

      // add domain to url segment list
      const projectsSegmentIndex = pathSegments.indexOf('projects');
      const preSegments = [...pathSegments].slice(0, projectsSegmentIndex);
      const postSegments = [...pathSegments].slice(projectsSegmentIndex + 1 + 1);
      const newPathName = [
        ...preSegments,
        'projects',
        pathSegments[projectsSegmentIndex + 1],
        'domains',
        domainToAdd,
        ...postSegments,
      ].join('/');

      // update url
      queryParams.delete('domain');
      const newUrl = `${newPathName}?${queryParams.toString()}`;
      history.push(newUrl);
    }
  }, [search, pathname, localProjectDomain.domain]);
};
