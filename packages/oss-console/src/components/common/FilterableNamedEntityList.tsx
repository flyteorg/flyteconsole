import React from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import { useVirtualizer } from '@tanstack/react-virtual';
import { LargeLoadingComponent } from '@clients/primitives/LoadingSpinner';
import { NoResults } from '@clients/primitives/NoResults';
import { NamedEntity } from '../../models/Common/types';
import { SearchableInput, SearchResult } from './SearchableList';
import { useSearchableListState } from './useSearchableListState';

export type ItemRenderer = (
  item: SearchResult<NamedEntity>,
  isScrolling: boolean,
) => React.ReactNode;

const VARIANT = 'normal';

const SearchBox = ({
  placeholder,
  showArchived,
  onArchiveFilterChange,
  archiveCheckboxLabel,
  onClear,
  onSearchChange,
  searchString,
}: {
  showArchived?: boolean;
  placeholder: string;
  onArchiveFilterChange?: (showArchievedItems: boolean) => void;
  archiveCheckboxLabel?: string;
  onClear: () => void;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchString: string;
}) => {
  return (
    <FormGroup>
      <Box px={2}>
        <Grid container>
          <Grid
            item
            xs={12}
            sm="auto"
            sx={{
              display: 'flex',
              flexGrow: '1 !important',
            }}
          >
            <Box pt={1.25} width="100%">
              <SearchableInput
                onClear={onClear}
                onSearchChange={onSearchChange}
                placeholder={placeholder}
                value={searchString}
                variant={VARIANT}
              />
            </Box>
          </Grid>
          {onArchiveFilterChange ? (
            <Grid item xs={12} sm="auto" alignSelf="center" justifySelf="flex-end">
              <Box pl={2} pb={{ xs: 2, sm: 0 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showArchived}
                      onChange={(_, checked) => onArchiveFilterChange(checked)}
                    />
                  }
                  label={archiveCheckboxLabel}
                />
              </Box>
            </Grid>
          ) : (
            <></>
          )}
        </Grid>
      </Box>
    </FormGroup>
  );
};

export const EntityRowVirtualizer = ({
  results,
  renderItem,
}: {
  results: SearchResult<NamedEntity>[];
  renderItem: ItemRenderer;
}) => {
  const parentRef = React.useRef<any>(document.getElementById('scroll-element'));
  const count = results.length;

  const rowVirtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400,
    overscan: 15,
  });

  const items = rowVirtualizer.getVirtualItems();
  return (
    <>
      <div className="entity-list" data-testid="entity-list">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${items[0]?.start ?? 0}px)`,
            }}
          >
            {items.map((virtualRow) => {
              return (
                <div
                  key={virtualRow.index}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                >
                  {renderItem(results[virtualRow.index], rowVirtualizer.isScrolling)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

interface SearchResultsProps {
  results: SearchResult<NamedEntity>[];
  renderItem: ItemRenderer;
  loading: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ renderItem, results, loading }) => {
  return loading ? (
    <LargeLoadingComponent useDelay={false} />
  ) : results.length === 0 ? (
    <NoResults />
  ) : (
    <EntityRowVirtualizer results={results} renderItem={renderItem} />
  );
};

export interface FilterableNamedEntityListProps {
  names: NamedEntity[];
  onArchiveFilterChange?: (showArchievedItems: boolean) => void;
  showArchived?: boolean;
  placeholder: string;
  archiveCheckboxLabel?: string;
  renderItem: ItemRenderer;
  noDivider?: boolean;
  isLoading: boolean;
}
/** Base component functionalityfor rendering NamedEntities (Workflow/Task/LaunchPlan) */
export const FilterableNamedEntityList: React.FC<FilterableNamedEntityListProps> = ({
  names,
  showArchived,
  renderItem,
  onArchiveFilterChange,
  placeholder,
  archiveCheckboxLabel,
  noDivider = false,
  isLoading,
}) => {
  const { results, setSearchString, searchString } = useSearchableListState({
    items: names,
    propertyGetter: 'id.name' as any,
  });

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchString = event.target.value;
    setSearchString(searchString);
  };

  const onClear = () => setSearchString('');

  return (
    <Grid container sx={{ marginTop: (theme) => theme.spacing(-3) }}>
      <Grid item xs={12}>
        <SearchBox
          {...{
            showArchived,
            onArchiveFilterChange,
            placeholder,
            archiveCheckboxLabel,
            onClear,
            onSearchChange,
            searchString,
          }}
        />
        {!noDivider && <Divider />}

        <SearchResults loading={isLoading} results={results} renderItem={renderItem} />
      </Grid>
    </Grid>
  );
};
