import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { LaunchPlan } from '../../models/Launch/types';
import { useSearchableListState } from '../common/useSearchableListState';
import { NamedEntity } from '../../models/Common/types';
import LaunchPlanCardView from './LaunchPlanCardList/LaunchPlanCardView';
import { LaunchPlanTableView } from './LaunchPlanTable/LaunchPlanTableView';
import { SearchBox } from './components/SearchBox';

export interface ResponsiveLaunchPlanListProps {
  projectId: string;
  domainId: string;
  showScheduled: boolean;
  onScheduleFilterChange: (showScheduledItems: boolean) => void;
  placeholder: string;
  noDivider?: boolean;
  launchPlanEntities: NamedEntity[];
  launchPlansWithTriggers: LaunchPlan[];
  isLoading: boolean;
}

/** Base component functionalityfor rendering NamedEntities (Workflow/Task/LaunchPlan) */
export const ResponsiveLaunchPlanList: FC<ResponsiveLaunchPlanListProps> = ({
  showScheduled,
  onScheduleFilterChange,
  placeholder,
  noDivider = false,
  isLoading,
  launchPlanEntities,
  launchPlansWithTriggers,
}) => {
  const theme = useTheme();
  const isWidthLessThanLg = useMediaQuery(theme.breakpoints.down('lg'));
  const [scheduledLaunchPlanEntities, setScheduledLaunchPlanEntities] = useState<NamedEntity[]>([]);

  const { results, setSearchString, searchString } = useSearchableListState({
    items: showScheduled ? scheduledLaunchPlanEntities : launchPlanEntities,
    propertyGetter: 'id.name' as any,
  });

  useEffect(() => {
    if (launchPlansWithTriggers.length > 0) {
      const onlyScheduledLaunchNames = launchPlansWithTriggers.map(
        (launchPlan) => launchPlan.id.name,
      );
      const onlyScheduledEntities = launchPlanEntities.filter((entity) => {
        return onlyScheduledLaunchNames.includes(entity.id.name);
      });
      setScheduledLaunchPlanEntities(onlyScheduledEntities);
    }
  }, [launchPlansWithTriggers]);

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchString = event.target.value;
    setSearchString(searchString);
  };

  const onClear = () => setSearchString('');

  return (
    <Grid container sx={{ marginTop: (theme) => theme.spacing(-3) }}>
      <Grid item xs={12}>
        <SearchBox
          {...{
            showScheduled,
            onScheduleFilterChange,
            placeholder,
            onClear,
            onSearchChange,
            searchString,
          }}
        />

        {!noDivider && <Divider />}

        {isWidthLessThanLg ? (
          <LaunchPlanCardView results={results} loading={isLoading} />
        ) : (
          <LaunchPlanTableView results={results} loading={isLoading} />
        )}
      </Grid>
    </Grid>
  );
};
