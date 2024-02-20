import React, { ChangeEvent, FC, useState, useRef } from 'react';
import reactLoadingSkeleton from 'react-loading-skeleton';
import styled from '@mui/system/styled';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import FormControl, { FormControlProps } from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useFetchableData } from '../../../hooks/useFetchableData';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { FetchableData, FetchFn } from '../../../hooks/types';
import { useCommonStyles } from '../../../common/styles';
import { isLoadingState } from '../../../hooks/fetchMachine';

const Skeleton = reactLoadingSkeleton;

const minimumQuerySize = 3;
const searchDebounceTimeMs = 500;

const placeholderResultStyle = {
  display: 'flex',
  justifyContent: 'center',
  pointerEvents: 'none',
};

const StyledContainer = styled((props: FormControlProps) => <FormControl {...props} />)(
  ({ theme }) => ({
    flexGrow: 1,
    position: 'relative',
    display: 'inline-block',
    marginBottom: theme.spacing(1),
    width: '100%',
    maxWidth: '250px',
    '> *': {
      maxWidth: '100%',
    },

    '& .MuiInputBase-root': {
      width: '100%',
    },
  }),
);

export interface SelectorOptions<DataType> {
  id: string;
  data: DataType;
  name: string;
  description?: string;
}

export interface SelectorProps<DataType> {
  id?: string;
  label: string;
  options: SelectorOptions<DataType>[];
  selectedItem?: SelectorOptions<DataType>;
  fetchSearchResults?: FetchFn<SelectorOptions<DataType>[], string>;
  onSelectionChanged(newSelection: SelectorOptions<DataType>): void;
}

interface SearchableSelectorState<DataType> {
  isExpanded: boolean;
  items: SelectorOptions<DataType>[];
  searchResults: FetchableData<SelectorOptions<DataType>[]>;
  selectedItem?: SelectorOptions<DataType>;
  showList: boolean;
  inputValue: string;
  onBlur(): void;
  onChange(event: ChangeEvent<HTMLInputElement>): void;
  onFocus(): void;
  selectItem(item: SelectorOptions<DataType>): void;
  setIsExpanded(expanded: boolean): void;
}

function generateDefaultFetch<DataType>(
  options: SelectorOptions<DataType>[],
): FetchFn<SelectorOptions<DataType>[], string> {
  return (query: string) =>
    Promise.resolve(options.filter((option) => option.name.includes(query)));
}

function useSelectorState<DataType>({
  fetchSearchResults,
  options,
  selectedItem,
  onSelectionChanged,
}: SelectorProps<DataType>): SearchableSelectorState<DataType> {
  const fetchResults = fetchSearchResults || generateDefaultFetch(options);
  const [hasReceivedInput, setHasReceivedInput] = useState(false);
  const [rawSearchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebouncedValue(rawSearchValue, searchDebounceTimeMs);

  const [isExpanded, setIsExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const minimumQueryMet = hasReceivedInput && debouncedSearchValue.length > minimumQuerySize;

  const searchResults = useFetchableData<SelectorOptions<DataType>[], string>(
    {
      defaultValue: [],
      autoFetch: minimumQueryMet,
      debugName: 'SearchableSelector Search',
      doFetch: fetchResults,
    },
    debouncedSearchValue,
  );
  const items = focused ? searchResults.value : options;

  let inputValue = '';
  if (focused && hasReceivedInput) {
    inputValue = rawSearchValue;
  } else if (selectedItem) {
    inputValue = selectedItem.name;
  }

  const onBlur = () => {
    setFocused(false);
  };

  const onFocus = () => {
    setIsExpanded(false);
    setHasReceivedInput(false);
    setSearchValue('');
    setFocused(true);
  };

  const onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setHasReceivedInput(true);
    setSearchValue(value);
  };

  const selectItem = (item: SelectorOptions<DataType>) => {
    onSelectionChanged(item);
    setFocused(false);
    setIsExpanded(false);
  };

  const showSearchResults = searchResults.value.length && focused && minimumQueryMet;
  const showList = showSearchResults || isExpanded;

  return {
    inputValue,
    isExpanded,
    items,
    onBlur,
    onChange,
    onFocus,
    searchResults,
    selectItem,
    selectedItem,
    setIsExpanded,
    showList,
  };
}

const NoResultsContent: FC = () => (
  <MenuItem sx={placeholderResultStyle} disabled>
    No results found.
  </MenuItem>
);

const LoadingContent: FC = () => (
  <MenuItem sx={placeholderResultStyle} disabled>
    <div style={{ width: '100%' }}>
      <Skeleton />
    </div>
  </MenuItem>
);

/** Combines a dropdown selector of default options with a searchable text input
 * that will fetch results using a provided function.
 */
export const Selector = <DataType extends {}>(props: SelectorProps<DataType>) => {
  const state = useSelectorState(props);
  const { items, inputValue, searchResults, selectItem } = state;
  const inputRef = useRef<HTMLInputElement>();
  const commonStyles = useCommonStyles();

  const isLoading = isLoadingState(searchResults.state);
  const handleChange = (event: SelectChangeEvent) => {
    const selectedItem = items.find((item) => item.id === event.target.value);
    if (!selectedItem) return;

    selectItem(selectedItem);
  };
  return (
    <StyledContainer>
      <InputLabel id={`${props.id}-label`}>{props.label}</InputLabel>
      <Select
        labelId={`${props.id}-label`}
        id={props.id}
        value={inputValue}
        renderValue={(selected) => {
          return selected;
        }}
        onChange={handleChange}
        label={props.label}
        ref={inputRef}
        MenuProps={{}}
      >
        {isLoading ? (
          <LoadingContent />
        ) : items?.length ? (
          items.map((item) => {
            return (
              <MenuItem
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  '& .selected-item': { fontWeight: 'bold' },
                  width: 'auto',
                }}
                key={item.id}
                value={item.id}
              >
                <ListItemText
                  primary={
                    <Typography variant="inherit" noWrap>
                      <span>{item.name}</span>
                    </Typography>
                  }
                  secondary={
                    <Typography variant="inherit" noWrap>
                      <span className={commonStyles.hintText}>{item.description}</span>
                    </Typography>
                  }
                />
              </MenuItem>
            );
          })
        ) : (
          <NoResultsContent />
        )}
      </Select>
    </StyledContainer>
  );
};
