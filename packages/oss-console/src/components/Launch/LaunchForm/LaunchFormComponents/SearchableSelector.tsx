import React, { useState, useMemo } from 'react';
import Skeleton from '@mui/material/Skeleton';
import styled from '@mui/system/styled';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import FormControl, { FormControlProps } from '@mui/material/FormControl';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { useFetchableData } from '../../../hooks/useFetchableData';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { FetchFn } from '../../../hooks/types';
import { useCommonStyles } from '../../../common/styles';
import { isLoadingState } from '../../../hooks/fetchMachine';

const minimumQuerySize = 3;
const searchDebounceTimeMs = 500;

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

export interface SearchableSelectorOption<DataType> {
  id: string;
  data: DataType;
  name: string;
  description?: string;
}

function generateDefaultFetch<DataType>(
  options: SearchableSelectorOption<DataType>[],
): FetchFn<SearchableSelectorOption<DataType>[], string> {
  return (query: string) =>
    Promise.resolve(options.filter((option) => option.name.includes(query)));
}

export interface SearchableSelectorProps<DataType> {
  id?: string;
  label: string;
  options: SearchableSelectorOption<DataType>[];
  selectedItem?: SearchableSelectorOption<DataType>;
  fetchSearchResults?: FetchFn<SearchableSelectorOption<DataType>[], string>;
  onSelectionChanged(newSelection: SearchableSelectorOption<DataType>): void;
}

/**
 * Combines a dropdown selector of default options with a searchable text input
 * that will fetch results using a provided function.
 */
export const SearchableSelector = <DataType extends {}>(
  props: SearchableSelectorProps<DataType>,
) => {
  const { label, onSelectionChanged, options, fetchSearchResults, id, selectedItem } = props;
  const [rawSearchValue, setRawSearchValue] = useState<string>();
  const debouncedSearchValue = useDebouncedValue(rawSearchValue, searchDebounceTimeMs);
  const commonStyles = useCommonStyles();
  const fetchResults = fetchSearchResults || generateDefaultFetch(options);
  const minimumQueryMet = (debouncedSearchValue?.length || 0) > minimumQuerySize;

  const searchResults = useFetchableData<SearchableSelectorOption<DataType>[], string>(
    {
      defaultValue: [],
      autoFetch: minimumQueryMet,
      debugName: 'SearchableSelector Search',
      doFetch: fetchResults,
    },
    debouncedSearchValue,
  );
  const isLoadingOptions = useMemo(() => {
    const isLoading =
      rawSearchValue !== undefined
        ? rawSearchValue.length > minimumQuerySize
          ? // if length is greater than 3, we want to show the loading state
            isLoadingState(searchResults.state)
          : // else show loading
            true
        : false;
    return isLoading;
  }, [searchResults, rawSearchValue]);

  const finalOptions = useMemo(
    () => (rawSearchValue ? searchResults.value : options),
    [rawSearchValue, searchResults.value, options],
  );

  const selectOption = (option?: SearchableSelectorOption<DataType>) => {
    if (!option) {
      return;
    }
    // reset search value when an option is selected
    // so Autocomplete can fill in the value with the selected option
    setRawSearchValue(undefined);
    onSelectionChanged(option);
  };

  return (
    <StyledContainer>
      <Autocomplete
        freeSolo
        forcePopupIcon
        id={id}
        value={selectedItem}
        inputValue={rawSearchValue === undefined ? selectedItem?.id : rawSearchValue}
        options={finalOptions}
        loading={isLoadingOptions}
        loadingText={<Skeleton variant="text" />}
        noOptionsText="No results found."
        onInputChange={(_event, newInputValue, reason) => {
          switch (reason) {
            case 'reset': {
              setRawSearchValue(undefined);

              break;
            }
            case 'clear':
            case 'input':
            default: {
              setRawSearchValue(newInputValue);
            }
          }
        }}
        onBlur={() => {
          setRawSearchValue(undefined);
        }}
        onChange={(_event, newValue, _reason, _details) => {
          if (!newValue || typeof newValue === 'string') {
            return;
          }
          selectOption(newValue);
        }}
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
        getOptionKey={(option) => (typeof option === 'string' ? option : option.name)}
        renderInput={(params) => <TextField {...params} label={label} />}
        renderOption={(props, option, _state, _ownerState) => {
          return (
            <Box
              sx={{
                borderRadius: '8px',
                mb: (theme) => theme.spacing(0.5),
                [`&.${autocompleteClasses.option}`]: {
                  px: (theme) => theme.spacing(0.5),
                  py: 0,
                  '&:div': {
                    margin: 0,
                  },
                },
                width: '100%',
              }}
              component="li"
              {...props}
            >
              <ListItemText
                primary={
                  <Typography variant="inherit" noWrap>
                    <span>{option.name}</span>
                  </Typography>
                }
                secondary={
                  <Typography variant="inherit" noWrap>
                    <span className={commonStyles.hintText}>{option.description}</span>
                  </Typography>
                }
              />
            </Box>
          );
        }}
        ListboxProps={{
          sx: {
            width: '100%',
            px: (theme) => theme.spacing(0.5),
          },
        }}
        componentsProps={{
          paper: {
            sx: {
              width: 'fit-content',
              minWidth: 250,
            },
          },
        }}
      />
    </StyledContainer>
  );
};
