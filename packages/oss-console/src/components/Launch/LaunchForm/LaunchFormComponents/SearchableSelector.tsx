import React, { useState, useMemo } from 'react';
import Skeleton from '@mui/material/Skeleton';
import styled from '@mui/system/styled';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import FormControl, { FormControlOwnProps, FormControlProps } from '@mui/material/FormControl';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import DoneIcon from '@mui/icons-material/Done';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';
import { type IconButtonProps } from '@mui/material/IconButton';
import { type PaperProps } from '@mui/material/Paper';
import { type PopperProps } from '@mui/material/Popper';
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
  isLatest?: boolean;
  isActive?: boolean;
}

function generateDefaultFetch<DataType>(
  options: SearchableSelectorOption<DataType>[],
): FetchFn<SearchableSelectorOption<DataType>[], string> {
  return (query: string) => Promise.resolve(options.filter((option) => option.id.includes(query)));
}

export interface SearchableSelectorProps<DataType> extends FormControlOwnProps {
  id?: string;
  label: string;
  disabled?: boolean;
  disabledLabel?: string;
  options: SearchableSelectorOption<DataType>[];
  selectedItem?: SearchableSelectorOption<DataType>;
  isLoading?: boolean;
  showLatestVersionChip?: boolean;
  formHelperText?: JSX.Element[];
  componentsProps?: {
    clearIndicator?: Partial<IconButtonProps>;
    paper?: PaperProps;
    popper?: Partial<PopperProps>;
    popupIndicator?: Partial<IconButtonProps>;
  };
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
  const {
    id,
    label,
    disabled,
    disabledLabel,
    options,
    selectedItem,
    isLoading = false,
    onSelectionChanged,
    fetchSearchResults,
    showLatestVersionChip,
    formHelperText,
    componentsProps,
    ...htmlProps
  } = props;
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
    const isLoadingOptions =
      isLoading ||
      (rawSearchValue !== undefined
        ? rawSearchValue.length > minimumQuerySize
          ? // if length is greater than 3, we want to show the loading state
            isLoadingState(searchResults.state)
          : // else show loading
            true
        : false);
    return isLoadingOptions;
  }, [searchResults, rawSearchValue, isLoading]);

  const finalOptions = useMemo(() => {
    return !rawSearchValue ? options : searchResults.value;
  }, [rawSearchValue, searchResults.value, options]);

  const selectOption = (option?: SearchableSelectorOption<DataType>) => {
    if (!option) {
      return;
    }
    // reset search value when an option is selected
    // so Autocomplete can fill in the value with the selected option
    setRawSearchValue(undefined);
    onSelectionChanged(option);
  };

  const finalLabel = disabledLabel && disabled ? disabledLabel : label;

  return (
    <StyledContainer data-testid={`searchable-selector-${id}`} {...(htmlProps as any)} disabled>
      <Autocomplete
        freeSolo
        forcePopupIcon
        id={id}
        value={selectedItem}
        inputValue={rawSearchValue === undefined ? selectedItem?.name || '' : rawSearchValue || ''}
        options={finalOptions}
        loading={isLoadingOptions}
        loadingText={<Skeleton variant="text" />}
        noOptionsText="No results found."
        disabled={disabled}
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
        renderInput={(params) => <TextField {...params} label={finalLabel} />}
        renderOption={(props, option, _state, _ownerState) => {
          const isSelected = selectedItem && option.id === selectedItem.id;
          return (
            <Box
              sx={{
                [`&.${autocompleteClasses.option}`]: {
                  px: (theme) => theme.spacing(0.5),
                  py: 0,
                  '&:hover': {
                    backgroundColor: '#F4F6FC',
                  },
                  '&:div': {
                    margin: 0,
                  },
                },
                width: '100%',
                minHeight: '40px',
                display: 'flex',
                flexDirection: 'row',
              }}
              component="li"
              {...props}
            >
              <Box
                sx={{
                  width: '40px',
                  height: '35px',
                }}
              >
                {isSelected ? (
                  <DoneIcon
                    sx={{
                      marginLeft: (theme) => theme.spacing(1.15),
                    }}
                  />
                ) : null}
              </Box>
              <ListItemText
                sx={{
                  paddingLeft: (theme) => theme.spacing(1),
                  paddingRight: (theme) => theme.spacing(2),
                }}
                primary={
                  <>
                    <Typography
                      variant="inherit"
                      noWrap
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <span>{option.name}</span>
                      {option.isLatest && showLatestVersionChip ? (
                        <Chip
                          sx={{
                            backgroundColor: (theme) => theme.palette.common.primary.union200,
                            borderRadius: (theme) => theme.spacing(0.5),
                            color: (theme) => theme.palette.common.primary.black,
                            '& .MuiChip-label': {
                              fontSize: (theme) => theme.spacing(1.5),
                              padding: (theme) => theme.spacing(0.75, 0.75),
                            },
                          }}
                          variant="filled"
                          size="small"
                          label="Latest"
                        />
                      ) : null}
                    </Typography>
                  </>
                }
                secondary={
                  <Typography variant="inherit">
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
            maxWidth: '100%',
          },
        }}
        componentsProps={{
          paper: {
            sx: {
              width: 'fit-content',
              minWidth: 250,
              maxWidth: '100%',
            },
          },
          ...(componentsProps || []),
        }}
      />
      {formHelperText?.map((text, index) => (
        <FormHelperText sx={{ marginTop: 2 }}>{text}</FormHelperText>
      ))}

      <FormHelperText />
    </StyledContainer>
  );
};
