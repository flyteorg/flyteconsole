import { SimpleCacheCallbackManager } from '@clients/primitives/SimpleCache/SimpleCacheCallbackManager';
import { SortDirection } from '@clients/common/types/adminEntityTypes';
import { listWorkflows } from '../../../models/Workflow/api';
import { listNamedEntities } from '../../../models/Common/api';
import { listProjects } from '../../../models/Project/api';
import { executionFilterGenerator } from '../../Entities/generators';
import { entityFunctions } from '../../hooks/Entity/constants';
import { executionSortFields } from '../../../models/Execution/constants';
import { Project } from '../../../models/Project/types';
import {
  formatEntities,
  formatProjectEntitiesAsDomains,
  formatProjectEntitiesURLAware,
  formatVersions,
} from './utils';
import { namedEntitiesList } from '../defaultValue';
import { BreadcrumbAsyncPopOverData, BreadcrumbEntity } from '../types';
import { ResourceType } from '../../../models/Common/types';
import { defaultPaginationConfig } from '../../../models/AdminEntity/constants';

const versionCache = new SimpleCacheCallbackManager({
  size: 25,
  duration: 5 * 1000, // 5 seconds
});

/**
 * Default async data function, returns an empty array
 * Used for breadcumb initialization
 * @param _projectId
 * @param _domainId
 * @returns
 */
export const defaultVoid: BreadcrumbAsyncPopOverData = async (_location, _breadcrumb) => [];

/**
 * This data should not change often, so we cache it for 5 minutes
 */
const projectCache = new SimpleCacheCallbackManager({
  size: 2,
  duration: 5 * 1000 * 60, // 5 mins
});

export const getProjects = async () => {
  const request = listProjects;
  const cacheKey = `projects`;
  const response = await projectCache.getCachedOrFetch(cacheKey, request);
  return response as Promise<Project[]>;
};

/**
 * Fetch a list of projects and format them for the breadcrumb
 * @param _location
 * @param breadcrumb
 * @returns
 */
export const projects: BreadcrumbAsyncPopOverData = async (location, breadcrumb) => {
  const { pathname } = location;
  return getProjects().then((data) =>
    formatProjectEntitiesURLAware(pathname, breadcrumb.domainId, data),
  );
};

/**
 * Fetch a list of domains and format them for the breadcrumb
 * @param projectId
 * @param domainId
 * @returns
 */
export const domains: BreadcrumbAsyncPopOverData = async (location, breadcrumb) => {
  const { pathname } = location;
  return getProjects().then((data) =>
    formatProjectEntitiesAsDomains(pathname, breadcrumb.projectId, data),
  );
};

/**
 * Fetch a list of workflows and format them for the breadcrumb
 * @param projectId
 * @param domainId
 * @returns
 */
export const workflows: BreadcrumbAsyncPopOverData = async (_location, breadcrumb) => {
  return listWorkflows({
    project: breadcrumb.projectId,
    domain: breadcrumb.domainId,
  }).then((data) => formatEntities(data));
};

/**
 * Fetch a list of tasks and format them for the breadcrumb
 * @param projectId
 * @param domainId
 * @returns
 */
export const tasks: BreadcrumbAsyncPopOverData = async (_location, breadcrumb) => {
  return listNamedEntities(
    {
      project: breadcrumb.projectId,
      domain: breadcrumb.domainId,
      resourceType: ResourceType.TASK,
    },
    defaultPaginationConfig,
  ).then((data) => formatEntities(data));
};

/**
 * Fetch a list of launch plans and format them for the breadcrumb
 * @param projectId
 * @param domainId
 * @returns
 */
export const launchPlans: BreadcrumbAsyncPopOverData = async (_location, breadcrumb) => {
  return listNamedEntities(
    {
      project: breadcrumb.projectId,
      domain: breadcrumb.domainId,
      resourceType: ResourceType.LAUNCH_PLAN,
    },
    defaultPaginationConfig,
  ).then((data) => formatEntities(data));
};

/**
 * Returns a list of named entities (workflows, tasks, launch plans).
 * Preformatted for the breadcrumb popover.
 * @param projectId
 * @param domainId
 * @returns
 */
export const namedEntities: BreadcrumbAsyncPopOverData = async (_location, breadcrumb) => {
  return namedEntitiesList(breadcrumb.projectId, breadcrumb.domainId);
};

/**
 * Invoke admin API to get versions
 * @param resourceId
 * @param entityName
 * @returns
 */
export const fetchVersions = async (resourceId) => {
  const filter = executionFilterGenerator[resourceId.resourceType](resourceId);
  const sort = {
    key: executionSortFields.createdAt,
    direction: SortDirection.DESCENDING,
  };
  const options = {
    sort,
    filter,
  };

  const request = async () =>
    entityFunctions[resourceId.resourceType].listEntity(resourceId, options);

  const cacheKey = `${JSON.stringify(Object.entries(resourceId).sort())}__${JSON.stringify(
    options,
  )}`;
  const response = await versionCache.getCachedOrFetch(cacheKey, request);

  return response;
};

/**
 * Get the versions of a named entity (workflow, task, launch plan)
 * @param projectId
 * @param domainId
 * @returns
 */
export const namedEntitiesVersions: BreadcrumbAsyncPopOverData = async (_location, breadcrumb) => {
  const segments = decodeURI(window.location.pathname).split('/');
  const versionIndex = segments.findIndex((segment) => segment === 'version');
  const entityNameIndex = versionIndex - 2;
  const entityName = segments[entityNameIndex];
  const entityIdIndex = versionIndex - 1;
  const entityId = segments[entityIdIndex];

  const resourceId = {
    project: breadcrumb.projectId,
    domain: breadcrumb.domainId,
    name: entityId,
    resourceType: ResourceType.UNSPECIFIED,
  };

  if (!entityName) {
    return [];
  }
  if (entityName.startsWith('task')) {
    resourceId.resourceType = ResourceType.TASK;
  } else if (entityName.startsWith('workflow')) {
    resourceId.resourceType = ResourceType.WORKFLOW;
  } else if (entityName.startsWith('launch')) {
    resourceId.resourceType = ResourceType.LAUNCH_PLAN;
  }

  if (resourceId.resourceType !== ResourceType.UNSPECIFIED) {
    const data = await fetchVersions(resourceId);
    return formatVersions(data, entityName) as BreadcrumbEntity[];
  }

  return [];
};
