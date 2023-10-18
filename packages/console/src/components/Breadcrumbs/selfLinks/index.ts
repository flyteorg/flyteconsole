import camelCase from 'lodash/camelCase';
import { Routes } from 'routes';
import { BreadcrumbFormControlInterface } from '../types';
import { namedEntitiesDefaultValue, namedEntitiesList } from '../defaultValue';
import { executonNamedEntityAsyncValue } from '../async/executionContext';

export const projectSelfLink = (
  _location: Location,
  breadcrumb: BreadcrumbFormControlInterface,
) => {
  const { projectId, domainId } = breadcrumb;
  return Routes.ProjectDetails.sections.dashboard.makeUrl(projectId, domainId);
};

export const workflowSelfLink = (
  _location: Location,
  breadcrumb: BreadcrumbFormControlInterface,
) => {
  const { projectId, domainId, value } = breadcrumb;
  return Routes.WorkflowDetails.makeUrl(projectId, domainId, value);
};

export const launchPlanSelfLink = (
  _location: Location,
  breadcrumb: BreadcrumbFormControlInterface,
) => {
  const { projectId, domainId, value } = breadcrumb;
  return Routes.LaunchPlanDetails.makeUrl(projectId, domainId, value);
};

export const taskSelfLink = (
  _location: Location,
  breadcrumb: BreadcrumbFormControlInterface,
) => {
  const { projectId, domainId, value } = breadcrumb;
  return Routes.TaskDetails.makeUrl(projectId, domainId, value);
};

export const namedEntitiesSelfLink = async (
  location: Location,
  breadcrumb: BreadcrumbFormControlInterface,
) => {
  const { projectId, domainId } = breadcrumb;
  const key = camelCase(namedEntitiesDefaultValue(location, breadcrumb));
  const namedEntities = namedEntitiesList(projectId, domainId);
  const entity = namedEntities.find(entity =>
    camelCase(entity.title).includes(key),
  );
  return entity?.url || '';
};

export const namedEntitiesSelfLinkExecutions = async (
  location: Location,
  breadcrumb: BreadcrumbFormControlInterface,
) => {
  const { projectId, domainId } = breadcrumb;
  if (!breadcrumb.value || breadcrumb.value.toLowerCase() === 'executions') {
    return Routes.ProjectDetails.sections.dashboard.makeUrl(
      projectId,
      domainId,
    );
  }
  const key = await executonNamedEntityAsyncValue(location, breadcrumb);
  const namedEntities = namedEntitiesList(projectId, domainId);
  const entity = namedEntities.find(entity =>
    camelCase(entity.title).includes(key),
  );
  return entity?.url || '';
};
