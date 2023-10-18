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
import { BreadcrumbAsyncPopOverData, BreadcrumbEntity } from '../types';

/**
 * Default async data function, returns an empty array
 * Used for breadcumb initialization
 * @param _projectId
 * @param _domainId
 * @returns
 */
export const defaultVoid: BreadcrumbAsyncPopOverData = async (
  _location,
  _breadcrumb,
) => [];

/**
 * Fetch a list of projects and format them for the breadcrumb
 * @param _projectId
 * @param _domainId
 * @returns
 */
export const projects: BreadcrumbAsyncPopOverData = async (
  _location,
  breadcrumb,
) => {
  return listProjects().then(data =>
    formatProjectEntities(data, breadcrumb.domainId),
  );
};

/**
 * Fetch a list of domains and format them for the breadcrumb
 * @param projectId
 * @param domainId
 * @returns
 */
export const domains: BreadcrumbAsyncPopOverData = async (
  _location,
  breadcrumb,
) => {
  return listProjects().then(data =>
    formatProjectEntitiesAsDomains(data, breadcrumb.projectId),
  );
};

/**
 * Fetch a list of workflows and format them for the breadcrumb
 * @param projectId
 * @param domainId
 * @returns
 */
export const workflows: BreadcrumbAsyncPopOverData = async (
  _location,
  breadcrumb,
) => {
  return listWorkflows({
    project: breadcrumb.projectId,
    domain: breadcrumb.domainId,
  }).then(data => formatEntities(data));
};

/**
 * Fetch a list of tasks and format them for the breadcrumb
 * @param projectId
 * @param domainId
 * @returns
 */
export const tasks: BreadcrumbAsyncPopOverData = async (
  _location,
  breadcrumb,
) => {
  return listNamedEntities(
    {
      project: breadcrumb.projectId,
      domain: breadcrumb.domainId,
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
export const launchPlans: BreadcrumbAsyncPopOverData = async (
  _location,
  breadcrumb,
) => {
  return listNamedEntities(
    {
      project: breadcrumb.projectId,
      domain: breadcrumb.domainId,
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
export const namedEntities: BreadcrumbAsyncPopOverData = async (
  _location,
  breadcrumb,
) => {
  return namedEntitiesList(breadcrumb.projectId, breadcrumb.domainId);
};

/**
 * Invoke admin API to get versions
 * @param resourceId
 * @param entityName
 * @returns
 */
export const fetchVersions = async resourceId => {
  const filter = executionFilterGenerator[resourceId.resourceType](resourceId);
  const sort = {
    key: executionSortFields.createdAt,
    direction: SortDirection.DESCENDING,
  };
  const data = await entityFunctions[resourceId.resourceType].listEntity(
    resourceId,
    { sort, filter },
  );
  return data;
};

/**
 * Get the versions of a named entity (workflow, task, launch plan)
 * @param projectId
 * @param domainId
 * @returns
 */
export const namedEntitiesVersions: BreadcrumbAsyncPopOverData = async (
  _location,
  breadcrumb,
) => {
  const segments = decodeURI(window.location.pathname).split('/');
  const versionIndex = segments.findIndex(segment => segment === 'version');
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
  } else if (entityName.startsWith('task')) {
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
