import { Routes } from '../../../routes/routes';
import { domains, namedEntities, projects } from '../async/fn';
import {
  launchPlanSelfLink,
  namedEntitiesSelfLink,
  namedEntitiesSelfLinkExecutions,
  projectSelfLink,
  taskSelfLink,
  workflowSelfLink,
} from '../selfLinks';
import { Breadcrumb } from '../types';
import { makeBreadcrumb } from './utils';
import { namedEntitiesDefaultValue } from '../defaultValue';
import { executionsValidatorEmpty, namedEntitiesValidatorExecutionsEmpty } from '../validators';
import {
  executionTaskWorkflowVersions,
  executionTaskWorkflowViewAll,
  executionsPeerExecutionList,
  executonNamedEntityAsyncValue,
  executonTaskWorkFlowNameAsyncSelfLink,
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
    popoverTitle: 'Projects',
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
    asyncSelfLink: namedEntitiesSelfLink,
    defaultValue: namedEntitiesDefaultValue,
    asyncData: namedEntities,
    validator: namedEntitiesValidatorExecutionsEmpty,
  }),
  makeBreadcrumb({
    id: 'executions:named-entity',
    label: 'Entity Search Lists',
    defaultValue: 'Executions',
    asyncSelfLink: namedEntitiesSelfLinkExecutions,
    asyncValue: executonNamedEntityAsyncValue,
    asyncData: namedEntities,
    validator: executionsValidatorEmpty,
  }),
  makeBreadcrumb({
    id: 'executions:task-workflow-name',
    label: 'Launch Plan Name',
    defaultValue: 'Executions',
    popoverTitle: 'Versions',
    asyncValue: executonTaskWorkFlowNameAsyncValue,
    asyncData: executionTaskWorkflowVersions,
    asyncViewAllLink: executionTaskWorkflowViewAll,
    asyncSelfLink: executonTaskWorkFlowNameAsyncSelfLink,
  }),
  makeBreadcrumb({
    id: 'executions',
    label: 'Executions',
    defaultValue: 'Executions',
    popoverTitle: 'Executions',
    asyncData: executionsPeerExecutionList,
  }),
  makeBreadcrumb({
    id: 'tasks:details',
    label: 'Tasks',
    selfLink: taskSelfLink,
    popoverTitle: 'Versions',
    asyncData: taskVersions,
    asyncViewAllLink: taskVersionsLink,
  }),
  makeBreadcrumb({
    id: 'task:versions',
    label: 'Tasks',
    selfLink: taskSelfLink,
  }),
  makeBreadcrumb({
    id: 'workflows:details',
    label: 'Workflow',
    selfLink: workflowSelfLink,
    popoverTitle: 'Versions',
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
    popoverTitle: 'Versions',
    asyncData: launchPlanVersions,
    asyncViewAllLink: launchPlanVersionsLink,
  }),
  makeBreadcrumb({
    id: 'launch_plan:versions',
    label: 'Launch Plan',
    selfLink: launchPlanSelfLink,
  }),
];
