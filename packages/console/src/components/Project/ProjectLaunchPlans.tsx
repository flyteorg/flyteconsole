import { WaitForData } from 'components/common/WaitForData';
import { useLaunchPlanShowArchivedState } from 'components/LaunchPlan/filters/useLaunchPlanShowArchivedState';
import { SearchableLaunchPlanNameList } from 'components/LaunchPlan/SearchableLaunchPlanNameList';
import { limits } from 'models/AdminEntity/constants';
import { SortDirection } from 'models/AdminEntity/types';
import { launchSortFields } from 'models/Launch/constants';
import * as React from 'react';
import { useLaunchPlanInfoList } from '../LaunchPlan/useLaunchPlanInfoList';

export interface ProjectLaunchPlansProps {
  projectId: string;
  domainId: string;
}

const DEFAULT_SORT = {
  direction: SortDirection.ASCENDING,
  key: launchSortFields.name,
};

/** A listing of the LaunchPlans registered for a project */
export const ProjectLaunchPlans: React.FC<ProjectLaunchPlansProps> = ({
  domainId: domain,
  projectId: project,
}) => {
  const archivedFilter = useLaunchPlanShowArchivedState();
  const launchPlans = useLaunchPlanInfoList(
    { domain, project },
    {
      limit: limits.NONE,
      sort: DEFAULT_SORT,
      filter: [archivedFilter.getFilter()],
    },
  );

  return (
    <WaitForData {...launchPlans}>
      <SearchableLaunchPlanNameList
        launchPlans={launchPlans.value}
        showArchived={archivedFilter.showArchived}
        onArchiveFilterChange={archivedFilter.setShowArchived}
      />
    </WaitForData>
  );
};
