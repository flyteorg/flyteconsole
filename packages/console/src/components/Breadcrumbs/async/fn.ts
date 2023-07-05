import { listWorkflows } from 'models/Workflow/api';
import { listNamedEntities } from 'models/Common/api';
import { ResourceType, SortDirection, defaultPaginationConfig } from 'models';
import { listProjects } from 'models/Project/api';
import { executionFilterGenerator } from 'components/Entities/generators';
import { entityFunctions } from 'components/hooks/Entity/constants';
import { executionSortFields } from 'models/Execution/constants';
import {
  formatEntities,
  formatProjectEntities,
  formatProjectEntitiesAsDomains,
  formatVersions,
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

/**
 * Invoke admin API to get versions
 * @param resourceId
 * @param entityName
 * @returns
 */
const fetchVersions = async (resourceId, entityName) => {
  const filter = executionFilterGenerator[resourceId.resourceType](resourceId);
  const sort = {
    key: executionSortFields.createdAt,
    direction: SortDirection.DESCENDING,
  };
  const data = await entityFunctions[resourceId.resourceType].listEntity(
    resourceId,
    { sort, filter },
  );
  return formatVersions(data, entityName);
};

/**
 * Get the versions of a named entity (workflow, task, launch plan)
 * @param projectId
 * @param domainId
 * @returns
 */
export const namedEntitiesVersions = async (projectId = '', domainId = '') => {
  const segments = decodeURI(window.location.pathname).split('/');
  const versionIndex = segments.findIndex(segment => segment === 'version');
  const entityNameIndex = versionIndex - 2;
  const entityName = segments[entityNameIndex];
  const entityIdIndex = versionIndex - 1;
  const entityId = segments[entityIdIndex];

  const resourceId = {
    project: projectId,
    domain: domainId,
    name: entityId,
    resourceType: ResourceType.UNSPECIFIED,
  };

  if (!entityName) {
    return [];
  } else if (entityName.startsWith('task')) {
    resourceId.resourceType = ResourceType.TASK;
    return await fetchVersions(resourceId, entityName);
  } else if (entityName.startsWith('workflow')) {
    resourceId.resourceType = ResourceType.WORKFLOW;
    return await fetchVersions(resourceId, entityName);
  } else if (entityName.startsWith('launch')) {
    resourceId.resourceType = ResourceType.LAUNCH_PLAN;
    return await fetchVersions(resourceId, entityName);
  }

  return [];
};
