import { Routes } from '../../../../routes/routes';
import { BreadcrumbEntity, BreadcrumbFormControlInterface } from '../../types';
import { formatProjectEntitiesAsDomains } from './formatProjectEntitiesAsDomains';
import { projectIdfromUrl } from './projectIdFromURL';
import { domainIdfromUrl } from './domainIdFromURL';
import { formatProjectEntitiesURLAware } from './formatProjectEntities';
import breadcrumQueryOptions from './breadcrumQueryOptions';
import { DomainIdentifierScope, Identifier } from '../../../../models/Common/types';
import { formatDateUTC } from '../../../../common/formatters';
import { timestampToDate } from '../../../../common/utils';

export {
  formatProjectEntitiesAsDomains,
  projectIdfromUrl,
  domainIdfromUrl,
  formatProjectEntitiesURLAware,
};

export const formatEntities = (data) => {
  return data.entities.map((entity) => {
    return {
      title: entity.id.name,
      createdAt: entity?.closure?.createdAt
        ? formatDateUTC(timestampToDate(entity.closure.createdAt))
        : '',
      url: Routes.WorkflowDetails.makeUrl(entity.id.project, entity.id.domain, entity.id.name),
    };
  });
};

export const formatVersions = (data: any, resourceUrl: string) => {
  return data.entities.map((entity: any) => {
    const { id: entityId } = entity;
    const id: Identifier = {
      project: entityId.project,
      domain: entityId.domain,
      name: entityId.name,
      resourceType: resourceUrl as any,
      version: entityId.version,
    };
    const url = Routes.EntityVersionDetails.makeUrl(id);

    return {
      title: entity.id.version,
      createdAt: entity?.closure?.createdAt
        ? formatDateUTC(timestampToDate(entity.closure.createdAt))
        : '',
      url,
    };
  }) as BreadcrumbEntity[];
};

/**
 * Determine if the execution is from the same project and domain as the current page.
 *
 * @param executionSpecIdentifier
 * @param breadcrumb
 * @see https://docs.flyte.org/projects/flytectl/en/latest/gen/flytectl_create_execution.html
 * @returns
 */
export const getExecutionSpecProjectDomain = (
  executionSpecIdentifier: DomainIdentifierScope,
  breadcrumb: BreadcrumbFormControlInterface,
) => {
  const project =
    breadcrumb.projectId === executionSpecIdentifier.project
      ? breadcrumb.projectId
      : executionSpecIdentifier.project;
  const domain =
    breadcrumb.projectId === executionSpecIdentifier.domain
      ? breadcrumb.domainId
      : executionSpecIdentifier.domain;

  return { project, domain };
};

export { breadcrumQueryOptions };
