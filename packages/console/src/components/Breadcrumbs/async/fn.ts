import { listWorkflows } from 'models/Workflow/api';
import { listNamedEntities } from 'models/Common/api';
import { ResourceType, defaultPaginationConfig } from 'models';
import { listProjects } from 'models/Project/api';
import {
  formatEntities,
  formatProjectEntities,
  formatProjectEntitiesAsDomains,
} from './utils';

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
