import camelCase from 'lodash/camelCase';
import startCase from 'lodash/startCase';
import { Routes } from 'routes';
import { Breadcrumb, BreadcrumbEntity } from '../types';
import { namedEntitiesUrlSegments } from '../validators';

/**
 * Fetch a list of named entities pre-formatted for the breadcrumb
 * @param projectId
 * @param domainId
 * @returns
 */
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

export const namedEntitiesDefaultValue = (
  location: Location,
  _breadcrumb: Breadcrumb,
) => {
  const segments = location.pathname.split('/');
  const namedEntitySegment =
    namedEntitiesUrlSegments.find(e => segments.find(s => s === e)) || '';

  const normalizedNamedEntitySegment = namedEntitySegment.endsWith('s')
    ? camelCase(namedEntitySegment)
    : `${camelCase(namedEntitySegment)}s`;

  const namedEntitiesBreadcumbPopOverList: BreadcrumbEntity[] =
    namedEntitiesList('', '');
  const titles = namedEntitiesBreadcumbPopOverList.map(entity =>
    camelCase(entity.title),
  );
  const entity =
    titles.find(title => title === normalizedNamedEntitySegment) || '';
  return startCase(entity);
};
