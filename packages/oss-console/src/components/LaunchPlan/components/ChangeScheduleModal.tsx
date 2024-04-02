import React, { MouseEventHandler, Suspense, useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useMutation, useQueryClient } from 'react-query';
import { FilterOperationName, SortDirection } from '@clients/common/types/adminEntityTypes';
import Typography from '@mui/material/Typography';
import { NamedEntityIdentifier, ResourceIdentifier } from '../../../models/Common/types';
import { workflowSortFields } from '../../../models/Workflow/constants';
import { LaunchPlan, LaunchPlanState } from '../../../models/Launch/types';
import { updateLaunchPlan } from '../../../models/Launch/api';
import { useEscapeKey } from '../../hooks/useKeyListener';
import {
  SearchableSelector,
  SearchableSelectorOption,
} from '../../Launch/LaunchForm/LaunchFormComponents/SearchableSelector';
import { fetchLaunchPlansList } from '../../../queries/launchPlanQueries';
import { WaitForQuery } from '../../common/WaitForQuery';
import { getRawScheduleStringFromLaunchPlan } from '../../Entities/EntitySchedules';
import { getScheduleStringFromLaunchPlan } from '../../Entities/getScheduleStringFromLaunchPlan';
import { useLatestLaunchPlans } from '../hooks/useLatestLaunchPlans';
import { useLatestLaunchPlanVersions } from '../hooks/useLatestScheduledLaunchPlans';
import { useLatestActiveLaunchPlan } from '../hooks/useLatestActiveLaunchPlan';
import { hasAnyEvent } from '../utils';

/** Formats a list of `LaunchPlan` records for use in a `SearchableSelector` */
export function launchPlansToSearchableSelectorOptions(
  launchPlans: LaunchPlan[],
  latestVersion?: string,
): SearchableSelectorOption<LaunchPlan>[] {
  const displayValues = (lp: LaunchPlan): string => {
    if (!hasAnyEvent(lp)) {
      return '';
    }
    return `${getScheduleStringFromLaunchPlan(lp)} (${getRawScheduleStringFromLaunchPlan(lp)})`;
  };

  return (launchPlans || [])?.map<SearchableSelectorOption<LaunchPlan>>((lp) => ({
    data: lp,
    id: lp.id.version,
    name: `${lp.id.version}`,
    isLatest: lp.id.version === latestVersion,
    description: displayValues(lp),
  }));
}

interface ChangeScheduleModalVersionSelectorProps {
  launchPlanVersions: LaunchPlan[];
  mostRecentLaunchPlan?: LaunchPlan;
  selectedLaunchPlan?: LaunchPlan;
  setSelectedLaunchPlan: (selectedLaunchPlan: LaunchPlan) => void;
  open: boolean;
}

const ChangeScheduleModalVersionSelector: React.FC<ChangeScheduleModalVersionSelectorProps> = ({
  selectedLaunchPlan,
  setSelectedLaunchPlan,
  launchPlanVersions,
  mostRecentLaunchPlan,
}) => {
  const queryClient = useQueryClient();

  const launchPlanSelectorOptions = useMemo(
    () =>
      launchPlansToSearchableSelectorOptions(launchPlanVersions, mostRecentLaunchPlan?.id?.version),
    [launchPlanVersions, mostRecentLaunchPlan?.id?.version],
  );

  const [selectedItem, setSelectedItem] = React.useState<
    SearchableSelectorOption<LaunchPlan> | undefined
  >(launchPlanSelectorOptions?.find((l) => l.id === selectedLaunchPlan?.id?.version));

  useEffect(() => {
    const newSelectedItem = launchPlanSelectorOptions.find(
      (l) => l.id === selectedLaunchPlan?.id?.version,
    );

    setSelectedItem(newSelectedItem);
  }, [launchPlanSelectorOptions, selectedLaunchPlan]);

  useEffect(() => {
    if (!selectedItem) return;
    setSelectedLaunchPlan(selectedItem.data);
  }, [selectedItem]);

  const fetchSearchResults = useMemo(() => {
    const doFetch = async (launchPlanVersionId: string, launchPlanId?: NamedEntityIdentifier) => {
      if (!launchPlanId) return [];
      const { project, domain, name } = launchPlanId;
      const { entities: launchPlans } = await fetchLaunchPlansList(
        queryClient,
        { project, domain, name },
        {
          filter: [
            {
              key: 'version',
              operation: FilterOperationName.CONTAINS,
              value: launchPlanVersionId,
            },
          ],
          sort: {
            key: workflowSortFields.createdAt,
            direction: SortDirection.DESCENDING,
          },
        },
      );
      return launchPlansToSearchableSelectorOptions(launchPlans, mostRecentLaunchPlan?.id?.version);
    };

    return async (launchPlanVersionId: string) => {
      const results = await doFetch(launchPlanVersionId, selectedLaunchPlan?.id);
      return results;
    };
  }, [selectedLaunchPlan]);

  const formHelperText = useMemo(() => {
    const formHelperText: JSX.Element[] = [];
    const hasEvent = hasAnyEvent(selectedLaunchPlan);
    if (
      !!selectedLaunchPlan &&
      selectedLaunchPlan?.id.version !== mostRecentLaunchPlan?.id.version
    ) {
      formHelperText.push(
        <Typography variant="label" sx={{ display: 'inline' }}>
          This is not the latest version.
        </Typography>,
      );
    }

    if (selectedLaunchPlan && hasEvent) {
      const triggerDescription = (lp: LaunchPlan): string => {
        return `Schedule: ${getScheduleStringFromLaunchPlan(
          lp,
        )} (${getRawScheduleStringFromLaunchPlan(lp)})`;
      };

      formHelperText.push(
        <Typography variant="label" sx={{ display: 'inline' }}>
          {triggerDescription(selectedLaunchPlan)}
        </Typography>,
      );
    } else {
      formHelperText.push(
        <Typography variant="label" sx={{ display: 'inline' }}>
          No Trigger
        </Typography>,
      );
    }

    return formHelperText;
  }, [launchPlanVersions, selectedLaunchPlan, mostRecentLaunchPlan]);

  return (
    <SearchableSelector
      id="launch-plan-selector"
      label="Launch Plan version"
      onSelectionChanged={setSelectedItem}
      options={launchPlanSelectorOptions}
      fetchSearchResults={fetchSearchResults as any}
      selectedItem={selectedItem}
      showLatestVersionChip
      formHelperText={formHelperText}
      componentsProps={{
        paper: {
          sx: {
            maxWidth: 'none',
          },
        },
      }}
      sx={{
        marginTop: (theme) => theme.spacing(3),
        maxWidth: 'none',
      }}
    />
  );
};
interface ChangeScheduleModalProps {
  id: ResourceIdentifier;
  open: boolean;
  onClose(): void;
  refetch(): void;
}

/** Renders a Modal that will load/display the inputs/outputs for a given
 * Execution in a tabbed/scrollable container
 */
export const ChangeScheduleModal: React.FC<ChangeScheduleModalProps> = ({
  id,
  open,
  onClose,
  refetch,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const activeScheduleLaunchPlanQuery = useLatestActiveLaunchPlan({
    id,
  });

  const activeScheduleLaunchPlan = useMemo(() => {
    return activeScheduleLaunchPlanQuery.data?.entities?.[0];
  }, [activeScheduleLaunchPlanQuery]);

  const [selectedLaunchPlan, setSelectedLaunchPlan] = useState(activeScheduleLaunchPlan);

  useEscapeKey(onClose);

  const latestLaunchPlanQuery = useLatestLaunchPlans({
    id,
    enabled: open,
  });

  const launchPlanVersionsQuery = useLatestLaunchPlanVersions({
    id,
    limit: 10,
    enabled: true,
  });

  const mutation = useMutation(
    (newState: LaunchPlanState) => updateLaunchPlan(selectedLaunchPlan?.id, newState),
    {
      onMutate: () => setIsUpdating(true),
      onSuccess: () => {
        refetch();
        setIsUpdating(false);
        onClose();
      },
      onError: (_data) => {
        // TODO: handle error
      },
      onSettled: (_data) => {
        setIsUpdating(false);
      },
    },
  );

  const onClick = (_event: MouseEventHandler<HTMLButtonElement>) => {
    mutation.mutate(LaunchPlanState.ACTIVE);
  };

  return (
    <Dialog maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>Update active launch plan</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Only one launch plan version can be active at a time. Changing the version will
          automatically deactivate any currently active version.
        </DialogContentText>
        <Suspense>
          <WaitForQuery query={latestLaunchPlanQuery}>
            {({ entities: mostRecentLaunchPlan }) => {
              return (
                <WaitForQuery query={launchPlanVersionsQuery}>
                  {({ entities: lpVersions }) => (
                    <ChangeScheduleModalVersionSelector
                      mostRecentLaunchPlan={mostRecentLaunchPlan?.[0]}
                      launchPlanVersions={lpVersions}
                      selectedLaunchPlan={selectedLaunchPlan}
                      setSelectedLaunchPlan={setSelectedLaunchPlan}
                      open={open}
                    />
                  )}
                </WaitForQuery>
              );
            }}
          </WaitForQuery>
        </Suspense>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={isUpdating}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onClick as any}
          autoFocus
          disabled={isUpdating || !selectedLaunchPlan}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};
