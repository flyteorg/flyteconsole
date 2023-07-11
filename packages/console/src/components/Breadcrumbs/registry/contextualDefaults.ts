import { Routes } from 'routes';
import { domains, namedEntities, projects } from '../async/fn';
import {
  launchPlanSelfLink,
  projectSelfLink,
  taskSelfLink,
  workflowSelfLink,
} from '../selfLinks';
import { Breadcrumb } from '../types';
import { makeBreadcrumb } from './utils';
import { namedEntitiesDefaultValue } from '../defaultValue';
import {
  executionsValidatorEmpty,
  namedEntitiesValidator,
} from '../validators';
import {
  executionTaskWorkflowVersions,
  executionTaskWorkflowViewAll,
  executionsPeerExecutionList,
  executonTaskWorkFlowNameAsyncValue,
  launchPlanVersions,
  launchPlanVersionsLink,
  taskVersions,
  taskVersionsLink,
  workflowVersions,
  workflowVersionsLink,
} from '../async/executionContext';

/**
 * These quick links allow for traversal of execution data.
 */
export const contextualBreadcrumbRegistryList: Breadcrumb[] = [
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
    label: 'Entity Search Lists',
    defaultValue: namedEntitiesDefaultValue,
    asyncData: namedEntities,
    valididator: b => namedEntitiesValidator(b) && !executionsValidatorEmpty(b),
  }),
  makeBreadcrumb({
    id: 'executions:named-entity',
    label: 'Entity Search Lists',
    defaultValue: 'Executions',
    asyncData: namedEntities,
    valididator: executionsValidatorEmpty,
  }),
  makeBreadcrumb({
    id: 'executions:task-workflow-name',
    label: 'Workflow',
    defaultValue: 'Executions',
    asyncValue: executonTaskWorkFlowNameAsyncValue,
    asyncData: executionTaskWorkflowVersions,
    asyncViewAllLink: executionTaskWorkflowViewAll,
  }),
  makeBreadcrumb({
    id: 'executions',
    label: 'Executions',
    defaultValue: 'Executions',
    asyncData: executionsPeerExecutionList,
  }),
  makeBreadcrumb({
    id: 'tasks:details',
    label: 'Execution',
    selfLink: taskSelfLink,
    asyncData: taskVersions,
    asyncViewAllLink: taskVersionsLink,
  }),
  makeBreadcrumb({
    id: 'task:versions',
    label: 'Execution',
    selfLink: taskSelfLink,
  }),
  makeBreadcrumb({
    id: 'workflows:details',
    label: 'Workflow',
    selfLink: workflowSelfLink,
    asyncData: workflowVersions,
    asyncViewAllLink: workflowVersionsLink,
  }),
  makeBreadcrumb({
    id: 'workflow:versions',
    label: 'Workflow',
    selfLink: workflowSelfLink,
  }),
  makeBreadcrumb({
    id: 'launchPlans:details',
    label: 'Launch Plan',
    selfLink: launchPlanSelfLink,
    asyncData: launchPlanVersions,
    asyncViewAllLink: launchPlanVersionsLink,
  }),
  makeBreadcrumb({
    id: 'launch_plan:versions',
    label: 'Launch Plan',
    selfLink: launchPlanSelfLink,
  }),
];
