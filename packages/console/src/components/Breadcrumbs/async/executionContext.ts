import { Execution, ResourceType, SortDirection, limits } from 'models';
import { getExecution, listExecutions } from 'models/Execution/api';
import { Routes } from 'routes';
import { timestampToDate } from 'common';
import { formatDateUTC } from 'common/formatters';
import { executionFilterGenerator } from 'components/Entities/generators';
import { executionSortFields } from 'models/Execution/constants';
import {
  BreadcrumbAsyncPopOverData,
  BreadcrumbAsyncValue,
  BreadcrumbAsyncViewAllLink,
  BreadcrumbEntity,
  BreadcrumbFormControlInterface,
} from '../types';
import { fetchVersions } from './fn';

const getExecutionData = async (
  projectId: string,
  domainId: string,
  executionId: string,
) => {
  const resourceId = {
    project: projectId,
    domain: domainId,
    name: executionId,
  };
  if (!executionId)
    throw Error('No id found for execution, cannot fetch execution');

  const executionData = await getExecution(resourceId, {});
  return executionData;
};

const isExecutionTaskOrWorkflow = (executionData: Execution) => {
  return executionData.spec.launchPlan.resourceType === ResourceType.TASK
    ? ResourceType.TASK
    : ResourceType.WORKFLOW;
};

const getTaskOrWorkflowName = (executionData: Execution): string => {
  return executionData.spec.launchPlan.name;
};

const getTaskOrWorkflowVersion = (executionData: Execution): string => {
  return executionData.spec.launchPlan.version;
};

const getExecutionValue = (location: Location) => {
  const segments = decodeURIComponent(location.pathname).split('/');
  const executionSegmentName = segments.findIndex(s =>
    ['execution', 'executions'].includes(s),
  );

  const executionValue = segments[executionSegmentName + 1] || '';
  return executionValue;
};

export const executonNamedEntityAsyncValue: BreadcrumbAsyncValue = async (
  location,
  breadcrumb,
) => {
  const executionValue = getExecutionValue(location);
  const executionData = await getExecutionData(
    breadcrumb.projectId,
    breadcrumb.domainId,
    executionValue,
  );

  const executionType = isExecutionTaskOrWorkflow(executionData);
  if (executionType === ResourceType.TASK) {
    return 'tasks';
  }
  return 'workflows';
};

export const executonTaskWorkFlowNameAsyncValue: BreadcrumbAsyncValue = async (
  location,
  breadcrumb,
) => {
  const executionValue = getExecutionValue(location);
  const executionData = await getExecutionData(
    breadcrumb.projectId,
    breadcrumb.domainId,
    executionValue,
  );

  return getTaskOrWorkflowName(executionData);
};

export const executionTaskWorkflowVersions: BreadcrumbAsyncPopOverData = async (
  location,
  breadcrumb,
) => {
  const executionValue = getExecutionValue(location);
  const executionData = await getExecutionData(
    breadcrumb.projectId,
    breadcrumb.domainId,
    executionValue,
  );

  const executionType = isExecutionTaskOrWorkflow(executionData);
  const entityResourceName = getTaskOrWorkflowName(executionData);
  const entityResourceVersion = getTaskOrWorkflowVersion(executionData);

  const resourceId = {
    project: breadcrumb.projectId,
    domain: breadcrumb.domainId,
    name: entityResourceName,
    resourceType: executionType,
  };

  const entityVersions = await fetchVersions(resourceId);

  const popOverData: BreadcrumbEntity[] = entityVersions.entities.map(
    entityVersion => {
      const title = entityVersion?.id?.version || '';
      const url = Routes.EntityVersionDetails.makeUrl(
        breadcrumb.projectId,
        breadcrumb.domainId,
        entityResourceName,
        executionType === ResourceType.TASK ? 'task' : 'workflow',
        title,
      );
      const createdAt = formatDateUTC(
        timestampToDate(entityVersion?.closure?.createdAt),
      );
      const active =
        entityResourceVersion.trim().toLocaleLowerCase() ===
        title.trim().toLocaleLowerCase();

      return {
        title,
        url,
        createdAt,
        active,
      };
    },
  );

  return popOverData;
};

export const executionTaskWorkflowViewAll: BreadcrumbAsyncViewAllLink = async (
  location: Location,
  breadcrumb: BreadcrumbFormControlInterface,
) => {
  const executionValue = getExecutionValue(location);
  const executionData = await getExecutionData(
    breadcrumb.projectId,
    breadcrumb.domainId,
    executionValue,
  );

  const executionType = isExecutionTaskOrWorkflow(executionData);
  const entityResourceName = getTaskOrWorkflowName(executionData);

  if (executionType === ResourceType.TASK) {
    return Routes.TaskDetails.makeUrl(
      breadcrumb.projectId,
      breadcrumb.domainId,
      entityResourceName,
    );
  }
  return Routes.WorkflowDetails.makeUrl(
    breadcrumb.projectId,
    breadcrumb.domainId,
    entityResourceName,
  );
};

export const executionsPeerExecutionList: BreadcrumbAsyncPopOverData = async (
  location,
  breadcrumb,
) => {
  const executionValue = getExecutionValue(location);
  const executionData = await getExecutionData(
    breadcrumb.projectId,
    breadcrumb.domainId,
    executionValue,
  );

  const executionType = isExecutionTaskOrWorkflow(executionData);
  const entityResourceName = getTaskOrWorkflowName(executionData);

  const resourceId = {
    project: breadcrumb.projectId,
    domain: breadcrumb.domainId,
  };

  const filterId = {
    resourceType: executionType,
    project: breadcrumb.projectId,
    domain: breadcrumb.domainId,
    name: entityResourceName,
  };

  const sort = {
    key: executionSortFields.createdAt,
    direction: SortDirection.DESCENDING,
  };

  const executions = await listExecutions(resourceId, {
    sort,
    filter: executionFilterGenerator[executionType](filterId),
    limit: limits.NONE,
  });

  const popOverData: BreadcrumbEntity[] = executions.entities.map(entity => {
    const title = entity.id.name;
    const url = Routes.ExecutionDetails.makeUrl({
      project: breadcrumb.projectId,
      domain: breadcrumb.domainId,
      name: title,
    });
    const createdAt = formatDateUTC(timestampToDate(entity.closure.createdAt));
    const active = executionValue === title;

    return {
      title,
      url,
      createdAt,
      active,
    };
  });

  return popOverData;
};
