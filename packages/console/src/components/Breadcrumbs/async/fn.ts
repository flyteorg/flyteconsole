import { listWorkflows } from 'models/Workflow/api';
import { listNamedEntities } from 'models/Common/api';
import { ResourceType, defaultPaginationConfig } from 'models';
import { formatEntities } from './utils';

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
