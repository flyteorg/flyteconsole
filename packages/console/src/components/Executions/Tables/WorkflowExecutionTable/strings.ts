import { createLocalizedString } from '@flyteorg/locale';
import { dateFromNow } from 'common/formatters';
import { timestampToDate } from 'common/utils';
import { Protobuf } from '@flyteorg/flyteidl-types';

const str = {
  tableLabel_name: 'execution id',
  tableLabel_tags: 'tags',
  tableLabel_launchPlan: 'launch plan',
  tableLabel_phase: 'status',
  tableLabel_startedAt: 'start time',
  tableLabel_duration: 'duration',
  tableLabel_actions: '',
  cancelAction: 'Cancel',
  inputOutputTooltip: 'View Inputs & Outputs',
  launchPlanTooltip: 'View Launch Plan',
  archiveAction: (isArchived: boolean) =>
    isArchived ? 'Unarchive' : 'Archive',
  archiveSuccess: (isArchived: boolean) =>
    `Item was successfully ${isArchived ? 'archived' : 'unarchived'}`,
  archiveError: (isArchived: boolean) =>
    `Error: Something went wrong, we can not ${
      isArchived ? 'archive' : 'unarchive'
    } item`,
  lastRunStartedAt: (startedAt?: Protobuf.ITimestamp) => {
    return startedAt
      ? `Last run ${dateFromNow(timestampToDate(startedAt))}`
      : '';
  },
};

export { patternKey } from '@flyteorg/locale';
export default createLocalizedString(str);
