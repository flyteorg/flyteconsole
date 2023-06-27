import { listWorkflows } from 'models/Workflow/api';
import { listNamedEntities } from 'models/Common/api';
import { ResourceType, defaultPaginationConfig } from 'models';
import { listProjects } from 'models/Project/api';
import { Routes } from 'routes';
import startCase from 'lodash/startCase';
import camelCase from 'lodash/camelCase';
import { listExecutions } from 'models/Execution/api';
import {
  formatEntities,
  formatProjectEntities,
  formatProjectEntitiesAsDomains,
} from './utils';
import { Breadcrumb, BreadcrumbEntity } from '../types';
import { namedEntitiesUrlSegments } from '../validators';

export const defaultVoid = async (_projectId = '', _domainId = '') => [];

export const projects = async (_projectId = '', _domainId = '') => {
  return listProjects().then(data => formatProjectEntities(data));
};

export const domains = async (projectId = '', domainId = '') => {
  return listProjects().then(data =>
    formatProjectEntitiesAsDomains(data, projectId, domainId),
  );
};

export const workflows = async (projectId = '', domainId = '') => {
  return listWorkflows({
    project: projectId,
    domain: domainId,
  }).then(data => formatEntities(data));
};

export const tasks = async (projectId = '', domainId = '') => {
  return listNamedEntities(
    {
      project: projectId,
      domain: domainId,
      resourceType: ResourceType.TASK,
    },
    defaultPaginationConfig,
  ).then(data => formatEntities(data));
};

export const launchPlans = async (projectId = '', domainId = '') => {
  return listNamedEntities(
    {
      project: projectId,
      domain: domainId,
      resourceType: ResourceType.LAUNCH_PLAN,
    },
    defaultPaginationConfig,
  ).then(data => formatEntities(data));
};

export const namedEntitiesList = (projectId = '', domainId = '') => {
  const workflow = {
    title: 'Workflows',
    createdAt: '',
    url: Routes.WorkflowDetails.makeUrl(projectId, domainId, ''),
  };
  const task = {
    title: 'Tasks',
    createdAt: '',
    url: Routes.TaskDetails.makeUrl(projectId, domainId, ''),
  };
  const launchPlans = {
    title: 'Launch Plans',
    createdAt: '',
    url: Routes.TaskDetails.makeUrl(projectId, domainId, ''),
  };

  return [workflow, task, launchPlans];
};

export const namedEntities = async (projectId = '', domainId = '') => {
  return namedEntitiesList(projectId, domainId);
};

export const namedEntitiesDefaultValue = (
  location: Location,
  _breadcrumb: Breadcrumb,
) => {
  const segments = location.pathname.split('/');
  const namedEntitySegment =
    namedEntitiesUrlSegments.find(e => segments.find(s => s === e)) || '';

  const normalizedNamedEntitySegment = namedEntitySegment.endsWith('s')
    ? camelCase(namedEntitySegment)
    : `${camelCase(namedEntitySegment)}s`;

  const namedEntitiesBreadcumbPopOverList: BreadcrumbEntity[] =
    namedEntitiesList('', '');
  const titles = namedEntitiesBreadcumbPopOverList.map(entity =>
    camelCase(entity.title),
  );
  const entity =
    titles.find(title => title === normalizedNamedEntitySegment) || '';
  return startCase(entity);
};

export const namedEntitiesVersions = async (projectId = '', domainId = '') => {
  const segments = decodeURI(window.location.pathname).split('/');
  const versionIndex = segments.findIndex(segment => segment === 'version');
  const nameIndex = versionIndex - 1;
  const name = segments[nameIndex];
  return listExecutions({
    project: projectId,
    domain: domainId,
    name,
  }).then(data => formatEntities(data));
};

export const namedEntitiesVersionsViewAll = (projectId = '', domainId = '') => {
  // const segments = decodeURI(window.location.pathname).split('/');
  // const versionIndex = segments.findIndex(segment => segment === 'version');
  // const nameIndex = versionIndex - 2;
  // const name = segments[nameIndex];

  /// TODO: namedEntitiesUrlSegments

  // const routesKeys = Object.keys(Routes.ProjectDetails.sections);
  // const routesKey = routesKeys.find(key => key.includes(name)) || '';
  // const routeSection = Routes.ProjectDetails.sections[routesKey];
  // const makeUrl =
  //   typeof routeSection['makeUrl'] !== 'undefined' &&
  //   typeof routeSection.makeUrl === 'function'
  //     ? routeSection.makeUrl
  //     : Routes.ProjectDashboard.makeUrl;

  // return makeUrl(projectId, domainId, name);

  return '/todo';
};
