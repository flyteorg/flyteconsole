import { timestampToDate } from 'common';
import { formatDateUTC } from 'common/formatters';
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

export const formatProjectEntities = data => {
  return data.map(project => {
    // replace text in URL segment following "projects" keyword
    const path = window.location.pathname.split('/');
    const projectIdIndex = path.indexOf('projects') + 1;
    path[projectIdIndex] = project.id;

    const urlObj = new URL(window.location.href);
    urlObj.pathname = path.join('/');
    const newUrl = urlObj.toString().replace(urlObj.origin, '');

    return {
      title: project.name,
      createdAt: '',
      url: newUrl,
    };
  });
};
