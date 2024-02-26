import React from 'react';
import HomeLogo from '@clients/ui-atoms/HomeLogo';
import { match, matchPath } from 'react-router';
import { makeOrgAwarePath, makeOrgAwarePathPattern } from '@clients/common/routes';

export interface NavItem {
  id: string;
  label?: string;
  authorizationAction?: any;
  icon: JSX.Element;
  getUrl?: (projectId: string, domainId: string) => string;
  getMatchDetails?: () => {
    params: {
      projectId?: string;
      domainId?: string;
    } & {
      [key: string]: string;
    };
    isActive: boolean;
    matchResult: match<any> | null;
  };
}

export const getDomainIdFromQueryString = () => {
  const queryString = window.location.search;
  const chunks = queryString.split(/[?&=]/);
  const domainIndex = chunks.indexOf('domain');
  const domainId =
    domainIndex > -1 && domainIndex < chunks.length ? chunks[domainIndex + 1] : undefined;

  return domainId;
};

export const getUrlParamsGeneric = () => {
  const pathName = window.location.pathname;
  const projectOnly = matchPath<any>(pathName, {
    path: makeOrgAwarePathPattern('/projects/:projectId'),
    exact: false,
    strict: false,
  });
  const projectAndDomain = matchPath<any>(pathName, {
    path: makeOrgAwarePathPattern('/projects/:projectId/domains/:domainId'),
    exact: false,
    strict: false,
  });

  const params = {
    ...(projectOnly?.params || {}),
    ...(projectAndDomain?.params || {}),
  };

  if (params) {
    const qstringDomainId = getDomainIdFromQueryString();
    if (!params?.domainId && qstringDomainId) {
      params.domainId = qstringDomainId;
    }
    return params;
  }

  return null;
};

export const arePathsActive = (
  defaultParams?: {
    domainId?: string;
    projectId?: string;
  },
  ...paths: string[]
) => {
  const pathName = window.location.pathname;
  const genericParams = getUrlParamsGeneric();

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const matchResult = matchPath<any>(pathName, {
      path: `${path}*`,
      exact: false,
      strict: false,
    });
    if (matchResult) {
      return {
        params: {
          ...defaultParams,
          ...genericParams,
          ...matchResult.params,
        },
        isActive: true,
        matchResult,
      };
    }
  }
  return {
    params: { ...defaultParams, ...genericParams },
    isActive: false,
    matchResult: null,
  };
};

export const defaultNavigationItems: NavItem[] = [
  {
    id: makeOrgAwarePath('/select-project'),
    label: 'Projects',
    getMatchDetails: () => {
      const matchResult = matchPath<any>(window.location.pathname, {
        path: makeOrgAwarePathPattern('/select-project'),
        exact: true,
        strict: true,
      });

      return {
        params: {},
        isActive: !!matchResult,
        matchResult,
      };
    },
    icon: <HomeLogo />,
  },
];

export const getBasePathFromUrl = (pathname: string) => {
  const basePath = pathname.split('/').slice(0, 2).join('/');
  return basePath;
};

export const ensurePrefixSlash = (route: string) => {
  if (route.length && route[0] !== '/') {
    return `/${route}`;
  }

  return route;
};
