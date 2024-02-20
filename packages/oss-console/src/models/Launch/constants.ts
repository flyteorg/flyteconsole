import { SortDirection } from '@clients/common/types/adminEntityTypes';

export const launchSortFields = {
  name: 'name',
  createdAt: 'created_at',
};

export const CREATED_AT_DESCENDING_SORT = {
  key: launchSortFields.createdAt,
  direction: SortDirection.DESCENDING,
};
