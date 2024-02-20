import { Routes } from '../../../routes/routes';
import {
  domains,
  launchPlans,
  namedEntities,
  namedEntitiesVersions,
  projects,
  tasks,
  workflows,
} from '../async/fn';
import { launchPlanSelfLink, projectSelfLink, taskSelfLink, workflowSelfLink } from '../selfLinks';
import { Breadcrumb } from '../types';
import { makeBreadcrumb } from './utils';
import { namedEntitiesDefaultValue } from '../defaultValue';
import { executionsValidator, namedEntitiesValidator } from '../validators';

/**
 * These quick links reflect the URL patterns found within the Flyte Console.
 * "Breadcrumb" style behaviour is implemented for these links.
 */
export const semanticBreadcrumbRegistryList: Breadcrumb[] = [
  makeBreadcrumb({
    id: 'projects',
    label: 'Project',
    required: true,
    selfLink: projectSelfLink,
    asyncData: projects,
    viewAllLink: Routes.SelectProject.path,
  }),
  makeBreadcrumb({
    id: 'domains',
    label: 'Domain',
    required: true,
    selfLink: projectSelfLink,
    asyncData: domains,
    viewAllLink: Routes.SelectProject.path,
  }),
  makeBreadcrumb({
    id: 'named-entity',
    label: 'Named Entity',
    defaultValue: namedEntitiesDefaultValue,
    asyncData: namedEntities,
    validator: namedEntitiesValidator,
  }),
  makeBreadcrumb({
    id: 'executions',
    label: 'Executions',
    defaultValue: 'Executions',
    validator: executionsValidator,
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
  makeBreadcrumb({
    id: 'version',
    label: 'Versions',
    asyncData: namedEntitiesVersions,
    viewAllLink: '',
  }),
];
