import { Routes } from 'routes';
import { projects, tasks, workflows } from '../async/fn';
import { Breadcrumb } from '../types';
import { breadcrumbDefaultvalidator } from '../validators';

const defaultBreadcrumb: Breadcrumb = {
  pathId: 'default',
  label: '',
  defaultValue: '',
  valididator: breadcrumbDefaultvalidator,
  asyncData: async (_projectId = '', _domainId = '') => [],
  viewAllLink: '',
};

export const makeBreadcrumb = (config: Partial<Breadcrumb>) => {
  return { ...defaultBreadcrumb, ...config };
};

export const flyteBreadcrumbRegistryList: Breadcrumb[] = [
  makeBreadcrumb({
    pathId: 'projects',
    label: 'Project',
    asyncData: projects,
  }),
  makeBreadcrumb({
    pathId: 'domains',
    label: 'Domain',
  }),
  makeBreadcrumb({
    pathId: 'workflows',
    label: 'Workflow',
    asyncData: workflows,
    viewAllLink: (projectId = '', domainId = '') =>
      Routes.WorkflowDetails.makeUrl(projectId, domainId, ''),
  }),
  makeBreadcrumb({
    pathId: 'tasks',
    label: 'Task',
    asyncData: tasks,
    viewAllLink: (projectId = '', domainId = '') =>
      Routes.TaskDetails.makeUrl(projectId, domainId, ''),
  }),
];
