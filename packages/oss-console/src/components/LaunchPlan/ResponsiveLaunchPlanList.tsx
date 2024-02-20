import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { LaunchPlan } from '../../models/Launch/types';
import { useSearchableListState, SearchResult } from '../common/useSearchableListState';
import { NamedEntity } from '../../models/Common/types';
import LaunchPlanCardView from './LaunchPlanCardList/LaunchPlanCardView';
import { LaunchPlanTableView } from './LaunchPlanTable/LaunchPlanTableView';
import { SearchBox } from './components/SearchBox';
import { LaunchPlanTableRow } from './LaunchPlanTable/LaunchPlanTableRow';
import LaunchPlanListCard from './LaunchPlanCardList/LaunchPlanListCard';
import { ItemRenderer } from '../common/FilterableNamedEntityList';

export interface ResponsiveLaunchPlanListProps {
  projectId: string;
  domainId: string;
  showScheduled: boolean;
  onScheduleFilterChange: (showScheduledItems: boolean) => void;
  placeholder: string;
  noDivider?: boolean;
  launchPlanEntities: NamedEntity[];
  scheduledLaunchPlans: LaunchPlan[];
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
  scheduledLaunchPlans: onlyScheduledLaunchPlans,
}) => {
  const theme = useTheme();
  const isWidthLessThanLg = useMediaQuery(theme.breakpoints.down('lg'));
  const [scheduledLaunchPlans, setScheduledLaunchPlans] = useState<NamedEntity[]>([]);

  const { results, setSearchString, searchString } = useSearchableListState({
    items: showScheduled ? scheduledLaunchPlans : launchPlanEntities,
    propertyGetter: 'id.name' as any,
  });

  useEffect(() => {
    if (onlyScheduledLaunchPlans.length > 0) {
      const onlyScheduledLaunchNames = onlyScheduledLaunchPlans.map(
        (launchPlan) => launchPlan.id.name,
      );
      const onlyScheduledEntities = launchPlanEntities.filter((entity) => {
        return onlyScheduledLaunchNames.includes(entity.id.name);
      });
      setScheduledLaunchPlans(onlyScheduledEntities);
    }
  }, [onlyScheduledLaunchPlans]);

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchString = event.target.value;
    setSearchString(searchString);
  };

  const onClear = () => setSearchString('');

  const renderTableRow: ItemRenderer = (searchResult: SearchResult<NamedEntity>) => {
    const { key, value, content, result } = searchResult;

    return <LaunchPlanTableRow content={content} value={value} key={key} result={result} />;
  };

  const renderCard: ItemRenderer = (searchResult: SearchResult<NamedEntity>) => {
    const { key, value, content, result } = searchResult;

    return <LaunchPlanListCard content={content} value={value} key={key} result={result} />;
  };

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
          <LaunchPlanCardView results={results} renderItem={renderCard} loading={isLoading} />
        ) : (
          <LaunchPlanTableView results={results} renderItem={renderTableRow} loading={isLoading} />
        )}
      </Grid>
    </Grid>
  );
};
