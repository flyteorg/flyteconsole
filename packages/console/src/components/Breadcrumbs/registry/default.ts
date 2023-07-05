import { Routes } from 'routes';
import {
  defaultVoid,
  domains,
  launchPlans,
  namedEntities,
  projects,
  tasks,
  workflows,
} from '../async/fn';
import { Breadcrumb } from '../types';
import {
  breadcrumbDefaultvalidator,
  namedEntitiesValidator,
} from '../validators';
import { defaultValue, namedEntitiesDefaultValue } from '../defaultValue';
import {
  launchPlanSelfLink,
  projectSelfLink,
  taskSelfLink,
  workflowSelfLink,
} from '../selfLinks';

const defaultBreadcrumb: Breadcrumb = {
  id: 'default',
  label: '',
  defaultValue: defaultValue,
  selfLink: '',
  asyncData: defaultVoid,
  valididator: breadcrumbDefaultvalidator,
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
    selfLink: projectSelfLink,
    asyncData: projects,
    viewAllLink: () => Routes.ProjectDetails.makeUrl(''),
  }),
  makeBreadcrumb({
    id: 'domains',
    label: 'Domain',
    required: true,
    selfLink: projectSelfLink,
    asyncData: domains,
    viewAllLink: () => Routes.ProjectDetails.makeUrl(''),
  }),
  makeBreadcrumb({
    id: 'named-entity',
    label: 'Named Entity',
    defaultValue: namedEntitiesDefaultValue,
    asyncData: namedEntities,
    valididator: namedEntitiesValidator,
    viewAllLink: projectId => Routes.ProjectDetails.makeUrl(projectId),
  }),
  makeBreadcrumb({
    id: 'executions',
    label: 'Executions',
  }),
  makeBreadcrumb({
    id: 'workflow',
    label: 'Workflow',
    selfLink: workflowSelfLink,
    asyncData: workflows,
    viewAllLink: (projectId = '', domainId = '') =>
      Routes.WorkflowDetails.makeUrl(projectId, domainId, ''),
  }),
  makeBreadcrumb({
    id: 'workflows',
    label: 'Workflow',
    selfLink: workflowSelfLink,
    asyncData: workflows,
    viewAllLink: (projectId = '', domainId = '') =>
      Routes.WorkflowDetails.makeUrl(projectId, domainId, ''),
  }),
  makeBreadcrumb({
    id: 'task',
    label: 'Task',
    selfLink: taskSelfLink,
    asyncData: tasks,
    viewAllLink: (projectId = '', domainId = '') =>
      Routes.TaskDetails.makeUrl(projectId, domainId, ''),
  }),
  makeBreadcrumb({
    id: 'tasks',
    label: 'Task',
    selfLink: taskSelfLink,
    asyncData: tasks,
    viewAllLink: (projectId = '', domainId = '') =>
      Routes.TaskDetails.makeUrl(projectId, domainId, ''),
  }),
  makeBreadcrumb({
    id: 'launch_plan',
    label: 'Launch Plans',
    selfLink: launchPlanSelfLink,
    asyncData: launchPlans,
    viewAllLink: (projectId = '', domainId = '') =>
      Routes.LaunchPlanDetails.makeUrl(projectId, domainId, ''),
  }),
  makeBreadcrumb({
    id: 'launchPlans',
    label: 'Launch Plans',
    selfLink: launchPlanSelfLink,
    asyncData: launchPlans,
    viewAllLink: (projectId = '', domainId = '') =>
      Routes.LaunchPlanDetails.makeUrl(projectId, domainId, ''),
  }),
  // TODO: Split this into a seperate lookup function per version type
  // make a validater, asyncData, and viewAllLink for each version type
  makeBreadcrumb({
    id: 'version',
    label: 'Versions',
    // asyncData: namedEntitiesVersions,
    // viewAllLink: namedEntitiesVersionsViewAll,
  }),
];
