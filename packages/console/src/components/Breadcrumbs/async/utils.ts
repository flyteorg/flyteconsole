import { timestampToDate } from 'common';
import { formatDateUTC } from 'common/formatters';
import { Project } from 'models/Project/types';
import { Routes } from 'routes';
import { BreadcrumbEntity } from '../types';

export const formatEntities = data => {
  return data.entities.map(entity => {
    return {
      title: entity.id.name,
      createdAt: entity?.closure?.createdAt
        ? formatDateUTC(timestampToDate(entity.closure.createdAt))
        : '',
      url: Routes.WorkflowDetails.makeUrl(
        entity.id.project,
        entity.id.domain,
        entity.id.name,
      ),
    };
  });
};

export const formatVersions = (data, resourceUrl) => {
  return data.entities.map(entity => {
    return {
      title: entity.id.version,
      createdAt: entity?.closure?.createdAt
        ? formatDateUTC(timestampToDate(entity.closure.createdAt))
        : '',
      url: Routes.EntityVersionDetails.makeUrl(
        entity.id.project,
        entity.id.domain,
        entity.id.name,
        resourceUrl,
        entity.id.version,
      ),
    };
  }) as BreadcrumbEntity[];
};

export const projectIdfromUrl = () => {
  const path = window.location.pathname.split('/');
  const projectIdIndex = path.indexOf('projects') + 1;
  return path[projectIdIndex];
};

export const domainIdfromUrl = (location: Location) => {
  const path = location.pathname.split('/');
  if (path.indexOf('domains') > -1) {
    return path[path.indexOf('domains') + 1] || '';
  }
  if (location.search.includes('domain')) {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('domain') || '';
  }

  return '';
};

export const formatProjectEntities = data => {
  return data.map(project => {
    const url = Routes.ProjectDetails.sections.dashboard.makeUrl(project.id);

    return {
      title: project.name,
      createdAt: '',
      url,
    };
  });
};

export const formatProjectEntitiesAsDomains = (
  data: Project[] = [],
  projectId = '',
) => {
  if (!data.length) return [];

  const project = data.find(p => p.id === projectId) || data[0];

  return project.domains.map(domain => {
    const url = Routes.ProjectDetails.sections.dashboard.makeUrl(
      project.id,
      domain.id,
    );

    return {
      title: domain.name,
      createdAt: '',
      url,
    };
  });
};
