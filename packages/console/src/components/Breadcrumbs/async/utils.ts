import { timestampToDate } from 'common';
import { formatDateUTC } from 'common/formatters';
import { Routes } from 'routes';

export const formatEntities = data => {
  console.log('data', data);
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
