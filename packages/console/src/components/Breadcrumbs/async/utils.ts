import { timestampToDate } from 'common';
import { formatDateUTC } from 'common/formatters';
import { Project } from 'models/Project/types';
import { Routes } from 'routes';

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
  });
};

export const projectIdfromUrl = () => {
  const path = window.location.pathname.split('/');
  const projectIdIndex = path.indexOf('projects') + 1;
  return path[projectIdIndex];
};

export const domainIdfromUrl = () => {
  const path = window.location.pathname.split('/');
  if (path.indexOf('domains')) {
    return path[path.indexOf('domains') + 1] || '';
  }
  if (window.location.search.includes('domain')) {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('domain') || '';
  }

  return '';
};

export const formatProjectEntities = data => {
  console.log('*** formatProjectEntities', data);
  return data.map(project => {
    // replace text in URL segment following "projects" keyword
    const projectId = projectIdfromUrl();
    const path = window.location.pathname.replace(projectId, project.id);

    console.log('*** path', path);

    const urlObj = new URL(window.location.href);
    urlObj.pathname = path;
    const newUrl = urlObj.toString().replace(urlObj.origin, '');

    return {
      title: project.name,
      createdAt: '',
      url: newUrl,
    };
  });
};

export const formatProjectEntitiesAsDomains = (
  data: Project[] = [],
  projectId = '',
  domainId = '',
) => {
  if (!data.length) return [];

  const project = data.find(p => p.id === projectId) || data[0];
  project.domains.find(d => d.id === domainId);

  return project.domains.map(domain => {
    const pathSearchHash = `${window.location.href}`.replace(
      window.location.origin,
      '',
    );

    const isDomainInUrl = domainIdfromUrl() === domainId;

    let newUrl = pathSearchHash;

    if (isDomainInUrl) {
      newUrl = pathSearchHash.replace(domainId, domain.id);
    } else {
      // Todo: handle the case where its not in the URL
      newUrl = pathSearchHash.replace(domainId, domain.id);
    }

    return {
      title: domain.name,
      createdAt: '',
      url: newUrl,
    };
  });
};
