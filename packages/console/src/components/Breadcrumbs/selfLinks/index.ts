import { Routes } from 'routes';
import { BreadcrumbFormControlInterface } from '../types';

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
