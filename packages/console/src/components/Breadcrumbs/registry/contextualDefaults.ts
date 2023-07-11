import { Routes } from 'routes';
import { domains, namedEntities, projects } from '../async/fn';
import { projectSelfLink } from '../selfLinks';
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
  executonNamedEntityAsyncValue,
  executonTaskWorkFlowNameAsyncValue,
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
    asyncValue: executonNamedEntityAsyncValue,
    asyncData: namedEntities,
    valididator: executionsValidatorEmpty,
  }),
  makeBreadcrumb({
    id: 'executions:task-workflow-name',
    label: 'Workflow',
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
];
