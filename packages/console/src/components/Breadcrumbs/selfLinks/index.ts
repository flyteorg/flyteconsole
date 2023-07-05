import { Routes } from 'routes';
import { BreadcrumbFormControlInterface } from '../types';

export const projectSelfLink = (
  _location: Location,
  breadcrumb: BreadcrumbFormControlInterface,
) => {
  const { projectId } = breadcrumb;
  return Routes.ProjectDetails.makeUrl(projectId);
};
