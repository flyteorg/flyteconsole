import { Routes } from 'routes';

// TODO: Change this to be 4 fns that looks up with a switch statement,
// or: just 4 fns with matching ids, validators, etc.
export const namedEntitiesVersionsViewAll = (projectId = '', domainId = '') => {
  const segments = decodeURI(window.location.pathname).split('/');
  const versionIndex = segments.findIndex(segment => segment === 'version');
  const nameIndex = versionIndex - 2;
  const name = segments[nameIndex];

  // TODO: namedEntitiesUrlSegments instead of dynamic matching

  const routesKeys = Object.keys(Routes.ProjectDetails.sections);
  const routesKey = routesKeys.find(key => key.includes(name)) || '';
  const routeSection = Routes.ProjectDetails.sections[routesKey];
  const makeUrl =
    typeof routeSection['makeUrl'] !== 'undefined' &&
    typeof routeSection.makeUrl === 'function'
      ? routeSection.makeUrl
      : Routes.ProjectDashboard.makeUrl;

  return makeUrl(projectId, domainId, name);
};
