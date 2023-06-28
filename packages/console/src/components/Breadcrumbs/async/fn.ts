import { listWorkflows } from 'models/Workflow/api';
import { listNamedEntities } from 'models/Common/api';
import { ResourceType, defaultPaginationConfig } from 'models';
import { listProjects } from 'models/Project/api';
import { listExecutions } from 'models/Execution/api';
import {
  formatEntities,
  formatProjectEntities,
  formatProjectEntitiesAsDomains,
} from './utils';
import { namedEntitiesList } from '../defaultValue';

/**
 * Default async data function, returns an empty array
 * Used for breadcumb initialization
 * @param _projectId
 * @param _domainId
 * @returns
 */
export const defaultVoid = async (_projectId = '', _domainId = '') => [];

/**
 * Fetch a list of projects and format them for the breadcrumb
 * @param _projectId
 * @param _domainId
 * @returns
 */
export const projects = async (_projectId = '', _domainId = '') => {
  return listProjects().then(data => formatProjectEntities(data));
};

/**
 * Fetch a list of domains and format them for the breadcrumb
 * @param projectId
 * @param domainId
 * @returns
 */
export const domains = async (projectId = '', domainId = '') => {
  return listProjects().then(data =>
    formatProjectEntitiesAsDomains(data, projectId, domainId),
  );
};

/**
 * Fetch a list of workflows and format them for the breadcrumb
 * @param projectId
 * @param domainId
 * @returns
 */
export const workflows = async (projectId = '', domainId = '') => {
  return listWorkflows({
    project: projectId,
    domain: domainId,
  }).then(data => formatEntities(data));
};

/**
 * Fetch a list of tasks and format them for the breadcrumb
 * @param projectId
 * @param domainId
 * @returns
 */
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

/**
 * Fetch a list of launch plans and format them for the breadcrumb
 * @param projectId
 * @param domainId
 * @returns
 */
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

/**
 * Returns a list of named entities (workflows, tasks, launch plans).
 * Preformatted for the breadcrumb popover.
 * @param projectId
 * @param domainId
 * @returns
 */
export const namedEntities = async (projectId = '', domainId = '') => {
  return namedEntitiesList(projectId, domainId);
};

// TODO: Split this into a seperate lookup function per version type
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
