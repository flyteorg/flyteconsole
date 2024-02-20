import { useEffect, useMemo, useState } from 'react';
import { FilterOperationName } from '@clients/common/types/adminEntityTypes';
import { useQueryState } from '../../hooks/useQueryState';
import { SearchFilterState } from './types';
import { useFilterButtonState } from './useFilterButtonState';

interface SearchFilterStateArgs {
  defaultValue?: string;
  filterKey: string;
  filterOperation?: FilterOperationName;
  label: string;
  placeholder: string;
  queryStateKey: string;
}

/** Maintains the state for a `SearchInputForm` filter.
 * The generated `FilterOperation` will use the provided `key` and `operation`
 * (defaults to `EQ`)
 * The current search value will be synced to the query string using the
 * provided `queryStateKey` value.
 */
export function useSearchFilterState({
  defaultValue = '',
  filterKey,
  filterOperation = FilterOperationName.EQ,
  label,
  placeholder,
  queryStateKey,
}: SearchFilterStateArgs): SearchFilterState {
  const [params, setQueryStateValue] = useQueryState();
  const queryStateValue = useMemo(() => params[queryStateKey], [params, queryStateKey]);

  const [value, setValue] = useState(defaultValue);
  const active = useMemo(() => value !== defaultValue, [value, defaultValue]);

  const button = useFilterButtonState();
  const onChange = (newValue: string) => {
    setValue(newValue);
    // Automatically hide the form on submission of a new value
    button.setOpen(false);
  };

  const onReset = () => {
    setValue(defaultValue);
    button.setOpen(false);
  };

  useEffect(() => {
    const queryValue = value === defaultValue ? '' : value;
    setQueryStateValue(queryStateKey, queryValue || '');
  }, [value, queryStateKey]);

  useEffect(() => {
    if (queryStateValue) {
      setValue(queryStateValue);
    } else {
      onReset();
    }
  }, [queryStateValue]);

  const getFilter = () =>
    value
      ? [
          {
            value,
            key: filterKey,
            operation: filterOperation,
          },
        ]
      : [];

  return {
    active,
    button,
    getFilter,
    onChange,
    onReset,
    label,
    placeholder,
    value,
    type: 'search',
  };
}
