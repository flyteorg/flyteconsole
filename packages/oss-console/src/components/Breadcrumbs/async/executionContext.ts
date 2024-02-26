import { SimpleCacheCallbackManager } from '@clients/primitives/SimpleCache/SimpleCacheCallbackManager';
import { SortDirection } from '@clients/common/types/adminEntityTypes';
import { Routes } from '../../../routes/routes';
import { getExecution, listExecutions } from '../../../models/Execution/api';
import { formatDateUTC } from '../../../common/formatters';
import { executionFilterGenerator } from '../../Entities/generators';
import { executionSortFields } from '../../../models/Execution/constants';
import {
  BreadcrumbAsyncPopOverData,
  BreadcrumbAsyncValue,
  BreadcrumbAsyncViewAllLink,
  BreadcrumbEntity,
  BreadcrumbEntitySelfLinkAsync,
  BreadcrumbFormControlInterface,
} from '../types';
import { fetchVersions } from './fn';
import { getExecutionSpecProjectDomain } from './utils';
import { Execution } from '../../../models/Execution/types';
import { Identifier, ResourceType } from '../../../models/Common/types';
import { timestampToDate } from '../../../common/utils';

const executionCache = new SimpleCacheCallbackManager({
  size: 25,
  duration: 5 * 1000, // 5 seconds
});

const executionListCache = new SimpleCacheCallbackManager({
  size: 25,
  duration: 5 * 1000, // 5 seconds
});

const getExecutionData = async (projectId: string, domainId: string, executionId: string) => {
  const resourceId = {
    project: projectId,
    domain: domainId,
    name: executionId,
  };
  if (!executionId) throw Error('No id found for execution, cannot fetch execution');

  const options = {};

  const cacheKey = `${JSON.stringify(Object.entries(resourceId).sort())}__${JSON.stringify(
    options,
  )}`;
  const executionData = await executionCache.getCachedOrFetch(cacheKey, () =>
    getExecution(resourceId, options),
  );

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
  const executionSegmentName = segments.findIndex((s) => ['execution', 'executions'].includes(s));

  const executionValue = segments[executionSegmentName + 1] || '';
  return executionValue;
};

const getVersionValue = (location: Location) => {
  const segments = decodeURIComponent(location.pathname).split('/');
  const versionSegmentName = segments.findIndex((s) => s === 'version');

  const versionValue = segments[versionSegmentName + 1] || '';
  return versionValue;
};

export const executonNamedEntityAsyncValue: BreadcrumbAsyncValue = async (location, breadcrumb) => {
  const executionValue = getExecutionValue(location);
  if (!executionValue)
    return typeof breadcrumb.defaultValue === 'string'
      ? breadcrumb.defaultValue
      : breadcrumb.defaultValue(location, breadcrumb);
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

export const executonTaskWorkFlowNameAsyncSelfLink: BreadcrumbEntitySelfLinkAsync = async (
  location,
  breadcrumb,
) => {
  const executionValue = getExecutionValue(location);
  const executionData = await getExecutionData(
    breadcrumb.projectId,
    breadcrumb.domainId,
    executionValue,
  );

  const resourceName = getTaskOrWorkflowName(executionData);
  const resourceType = isExecutionTaskOrWorkflow(executionData);

  const { project: desinationProject, domain: desinationDomain } = getExecutionSpecProjectDomain(
    executionData.spec.launchPlan,
    breadcrumb,
  );

  // return Routes.EntityDetails.makeUrl()
  if (resourceType === ResourceType.TASK) {
    return Routes.TaskDetails.makeUrl(desinationProject, desinationDomain, resourceName);
  }
  return Routes.WorkflowDetails.makeUrl(desinationProject, desinationDomain, resourceName);
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

  const { project: desinationProject, domain: desinationDomain } = getExecutionSpecProjectDomain(
    executionData.spec.launchPlan,
    breadcrumb,
  );

  const resourceId = {
    project: breadcrumb.projectId,
    domain: breadcrumb.domainId,
    name: entityResourceName,
    resourceType: executionType,
  };

  const entityVersions = await fetchVersions(resourceId);

  const popOverData: BreadcrumbEntity[] = entityVersions.entities.map((entityVersion: any) => {
    const title = entityVersion?.id?.version || '';
    const id: Identifier = {
      project: desinationProject,
      domain: desinationDomain,
      name: entityResourceName,
      resourceType: executionType,
      version: title,
    };
    const url = Routes.EntityVersionDetails.makeUrl(id);
    const createdAt = formatDateUTC(timestampToDate(entityVersion?.closure?.createdAt));
    const active =
      entityResourceVersion.trim().toLocaleLowerCase() === title.trim().toLocaleLowerCase();

    return {
      title,
      url,
      createdAt,
      active,
    };
  });

  return popOverData;
};

export const taskVersions: BreadcrumbAsyncPopOverData = async (location, breadcrumb) => {
  const resourceId = {
    project: breadcrumb.projectId,
    domain: breadcrumb.domainId,
    name: breadcrumb.value,
    resourceType: ResourceType.TASK,
  };

  const versionValue = getVersionValue(location);
  const entityVersions = await fetchVersions(resourceId);

  const popOverData: BreadcrumbEntity[] = entityVersions.entities.map(
    (entityVersion: any, index: number) => {
      const title = entityVersion?.id?.version || '';
      const id: Identifier = {
        project: breadcrumb.projectId,
        domain: breadcrumb.domainId,
        name: breadcrumb.value,
        resourceType: ResourceType.TASK,
        version: title,
      };

      const url = Routes.EntityVersionDetails.makeUrl(id);
      const createdAt = formatDateUTC(timestampToDate(entityVersion?.closure?.createdAt));

      // UI only shows last version
      const active = versionValue ? versionValue === title : index === 0;

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

export const workflowVersions: BreadcrumbAsyncPopOverData = async (location, breadcrumb) => {
  const resourceId = {
    project: breadcrumb.projectId,
    domain: breadcrumb.domainId,
    name: breadcrumb.value,
    resourceType: ResourceType.WORKFLOW,
  };

  const versionValue = getVersionValue(location);
  const entityVersions = await fetchVersions(resourceId);

  const popOverData: BreadcrumbEntity[] = entityVersions.entities.map(
    (entityVersion: any, index: number) => {
      const title = entityVersion?.id?.version || '';
      const id: Identifier = {
        project: breadcrumb.projectId,
        domain: breadcrumb.domainId,
        name: breadcrumb.value,
        resourceType: ResourceType.WORKFLOW,
        version: title,
      };

      const url = Routes.EntityVersionDetails.makeUrl(id);
      const createdAt = formatDateUTC(timestampToDate(entityVersion?.closure?.createdAt));

      // UI only shows last version
      const active = versionValue ? versionValue === title : index === 0;

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

export const launchPlanVersions: BreadcrumbAsyncPopOverData = async (location, breadcrumb) => {
  const resourceId = {
    project: breadcrumb.projectId,
    domain: breadcrumb.domainId,
    name: breadcrumb.value,
    resourceType: ResourceType.LAUNCH_PLAN,
  };

  const versionValue = getVersionValue(location);
  const entityVersions = await fetchVersions(resourceId);

  const popOverData: BreadcrumbEntity[] = entityVersions.entities.map(
    (entityVersion: any, index: number) => {
      const title = entityVersion?.id?.version || '';
      const id: Identifier = {
        project: breadcrumb.projectId,
        domain: breadcrumb.domainId,
        name: breadcrumb.value,
        resourceType: ResourceType.LAUNCH_PLAN,
        version: title,
      };
      const url = Routes.EntityVersionDetails.makeUrl(id);
      const createdAt = formatDateUTC(timestampToDate(entityVersion?.closure?.createdAt));

      // UI only shows last version
      const active = versionValue ? versionValue === title : index === 0;

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

export const taskVersionsLink: BreadcrumbAsyncViewAllLink = async (location, breadcrumb) => {
  const data = await taskVersions(location, breadcrumb);
  return data[0].url;
};

export const workflowVersionsLink: BreadcrumbAsyncViewAllLink = async (location, breadcrumb) => {
  const data = await workflowVersions(location, breadcrumb);
  return data[0].url;
};

export const launchPlanVersionsLink: BreadcrumbAsyncViewAllLink = async (location, breadcrumb) => {
  const data = await launchPlanVersions(location, breadcrumb);
  return data[0].url;
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

  const { project: desinationProject, domain: desinationDomain } = getExecutionSpecProjectDomain(
    executionData.spec.launchPlan,
    breadcrumb,
  );

  if (executionType === ResourceType.TASK) {
    return Routes.TaskDetails.makeUrl(desinationProject, desinationDomain, entityResourceName);
  }
  return Routes.WorkflowDetails.makeUrl(desinationProject, desinationDomain, entityResourceName);
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

  const executionsListOptions = {
    sort,
    filter: executionFilterGenerator[executionType](filterId),
    limit: 5,
  };

  const executionsListCacheKey = `${JSON.stringify(
    Object.entries(resourceId).sort(),
  )}__${JSON.stringify(executionsListOptions)}`;

  const executions = await executionListCache.getCachedOrFetch(executionsListCacheKey, () =>
    listExecutions(resourceId, executionsListOptions),
  );

  const popOverData: BreadcrumbEntity[] = executions.entities.map((entity: any) => {
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
