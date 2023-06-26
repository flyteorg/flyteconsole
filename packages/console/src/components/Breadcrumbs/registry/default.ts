import { Routes } from 'routes';
import { defaultVoid, domains, projects, tasks, workflows } from '../async/fn';
import { Breadcrumb } from '../types';
import { breadcrumbDefaultvalidator } from '../validators';

const defaultBreadcrumb: Breadcrumb = {
  id: 'default',
  label: '',
  defaultValue: '',
  valididator: breadcrumbDefaultvalidator,
  asyncData: defaultVoid,
  viewAllLink: '',
  required: false,
};

export const makeBreadcrumb = (config: Partial<Breadcrumb>) => {
  return { ...defaultBreadcrumb, ...config };
};

export const flyteBreadcrumbRegistryList: Breadcrumb[] = [
  makeBreadcrumb({
    id: 'projects',
    label: 'Project',
    required: true,
    asyncData: projects,
    viewAllLink: () => Routes.ProjectDetails.makeUrl(''),
  }),
  makeBreadcrumb({
    id: 'domains',
    label: 'Domain',
    required: true,
    asyncData: domains,
    viewAllLink: () => Routes.ProjectDetails.makeUrl(''),
  }),
  makeBreadcrumb({
    id: 'workflows',
    label: 'Workflow',
    asyncData: workflows,
    viewAllLink: (projectId = '', domainId = '') =>
      Routes.WorkflowDetails.makeUrl(projectId, domainId, ''),
  }),
  makeBreadcrumb({
    id: 'tasks',
    label: 'Task',
    asyncData: tasks,
    viewAllLink: (projectId = '', domainId = '') =>
      Routes.TaskDetails.makeUrl(projectId, domainId, ''),
  }),
];
