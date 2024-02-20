import * as React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import styled from '@mui/system/styled';
import { MultiSelectForm } from '../common/MultiSelectForm';
import { SearchInputForm } from '../common/SearchInputForm';
import { SingleSelectForm } from '../common/SingleSelectForm';
import { FilterPopoverButton } from '../Tables/filters/FilterPopoverButton';
import {
  FilterState,
  MultiFilterState,
  SearchFilterState,
  SingleFilterState,
  BooleanFilterState,
} from './filters/types';

const StyledContainer = styled(Grid)(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  paddingLeft: theme.spacing(1),
  paddingBottom: theme.spacing(0.75),
  width: '100%',

  '.filterButton': {
    marginLeft: theme.spacing(1),

    '& button': {
      borderRadius: '8px',
    },
  },
  '.checkbox': {
    marginLeft: theme.spacing(1),
  },
}));

export interface OnlyMyExecutionsFilterState {
  onlyMyExecutionsValue: boolean;
  isFilterDisabled: boolean;
  onOnlyMyExecutionsFilterChange: (filterOnlyMyExecutions: boolean) => void;
}

export interface ExecutionFiltersProps {
  filters: (FilterState | BooleanFilterState)[];
  chartIds?: string[];
  clearCharts?: () => void;
  showArchived?: boolean;
  onArchiveFilterChange?: (showArchievedItems: boolean) => void;
  onlyMyExecutionsFilterState?: OnlyMyExecutionsFilterState;
}

const RenderFilter: React.FC<{ filter: FilterState }> = ({ filter }) => {
  const searchFilterState = filter as SearchFilterState;
  switch (filter.type) {
    case 'single':
      return <SingleSelectForm {...(filter as SingleFilterState<any>)} />;
    case 'multi':
      return <MultiSelectForm {...(filter as MultiFilterState<any, any>)} />;
    case 'search':
      return <SearchInputForm {...searchFilterState} defaultValue={searchFilterState.value} />;
    default:
      return null;
  }
};

/** Renders the set of filter buttons relevant to a table of WorkflowExecutions:
 * Status, Version, Start Time, Duration
 * The state for this component is generated externally by `useExecutionFiltersState` and passed in.
 * This allows for the consuming code to have direct access to the
 * current filters without relying on complicated callback arrangements
 */
export const ExecutionFilters: React.FC<ExecutionFiltersProps> = ({
  filters,
  chartIds,
  clearCharts,
  showArchived,
  onArchiveFilterChange,
  onlyMyExecutionsFilterState,
}) => {
  // eslint-disable-next-line no-param-reassign
  filters = filters.map((filter) => {
    const onChangeFunc = filter.onChange;
    // eslint-disable-next-line no-param-reassign
    filter.onChange = (value) => {
      if (clearCharts) {
        clearCharts();
      }
      if (onChangeFunc) {
        onChangeFunc(value);
      }
    };
    return filter;
  });

  return (
    <StyledContainer container>
      {filters.map((filter: any) => {
        if (filter.hidden) {
          return null;
        }
        if (filter.type === 'boolean') {
          const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
            filter.setActive(event.target.checked);

          return (
            <Grid item key={filter.label}>
              <FormControlLabel
                key={filter.label}
                data-testid="checkbox"
                control={<Checkbox checked={filter.active} onChange={handleChange} />}
                className="checkbox"
                label={filter.label}
              />
            </Grid>
          );
        }
        return (
          <Grid item key={filter.label}>
            <FilterPopoverButton
              {...filter.button}
              active={filter.active}
              key={filter.label}
              onReset={filter.onReset}
              buttonText={filter.label}
              className="filterButton"
              renderContent={() => <RenderFilter filter={filter} />}
            />
          </Grid>
        );
      })}
      {chartIds && chartIds.length > 0 && (
        <FilterPopoverButton
          open={false}
          active
          renderContent={() => <></>}
          className="filterButton"
          buttonText="Clear Manually Selected Executions"
          onReset={clearCharts}
          key="charts"
          data-testid="clear-charts"
        />
      )}
      {!!onlyMyExecutionsFilterState && (
        <Grid item>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={onlyMyExecutionsFilterState.onlyMyExecutionsValue}
                  disabled={onlyMyExecutionsFilterState.isFilterDisabled}
                  onChange={(_, checked) =>
                    onlyMyExecutionsFilterState.onOnlyMyExecutionsFilterChange(checked)
                  }
                />
              }
              className="checkbox"
              label="Only my executions"
            />
          </FormGroup>
        </Grid>
      )}
      {!!onArchiveFilterChange && (
        <Grid item>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showArchived}
                  onChange={(_, checked) => onArchiveFilterChange(checked)}
                />
              }
              className="checkbox"
              label="Show archived executions"
            />
          </FormGroup>
        </Grid>
      )}
    </StyledContainer>
  );
};
