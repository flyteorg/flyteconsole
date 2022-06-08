import { NamedEntityIdentifier } from 'models/Common/types';
import { SortDirection } from 'models/AdminEntity/types';
import { listLaunchPlans } from 'models/Launch/api';
import { launchSortFields } from 'models/Launch/constants';
import { useQuery } from 'react-query';

export const useLaunchPlanInfoItem = ({ domain, project, name }: NamedEntityIdentifier) => {
  const {
    data: launchPlanInfo,
    isLoading: launchPlanLoading,
    error: launchPlanError,
  } = useQuery(
    ['launch_plans', domain, project, name],
    async () => {
      const {
        entities: [launchPlan],
      } = await listLaunchPlans(
        { domain, project, name },
        {
          limit: 1,
          sort: {
            key: launchSortFields.name,
            direction: SortDirection.DESCENDING,
          },
        },
      );
      const { id } = launchPlan;
      return { id };
    },
    {
      staleTime: 1000 * 60 * 5,
    },
  );

  return {
    data: {
      ...launchPlanInfo,
    },
    isLoading: launchPlanLoading,
    error: launchPlanError,
  };
};
