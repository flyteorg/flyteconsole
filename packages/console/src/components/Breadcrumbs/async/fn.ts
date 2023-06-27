import { listWorkflows } from 'models/Workflow/api';
import { listNamedEntities } from 'models/Common/api';
import { ResourceType, defaultPaginationConfig } from 'models';
import { listProjects } from 'models/Project/api';
import { Routes } from 'routes';
import startCase from 'lodash/startCase';
import camelCase from 'lodash/camelCase';
import {
  formatEntities,
  formatProjectEntities,
  formatProjectEntitiesAsDomains,
} from './utils';
import { Breadcrumb, BreadcrumbEntity } from '../types';

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
  const namedEntitiesArray: BreadcrumbEntity[] = namedEntitiesList('', '');
  const titles = namedEntitiesArray.map(entity => camelCase(entity.title));
  const entity = segments.find(segment => titles.includes(segment)) || '';
  return startCase(entity);
};
