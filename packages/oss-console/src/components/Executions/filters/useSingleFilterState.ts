import { useEffect, useMemo, useState } from 'react';
import { log } from '../../../common/log';
import { useQueryState } from '../../hooks/useQueryState';
import { FilterMap, FilterValue, SingleFilterState } from './types';
import { useFilterButtonState } from './useFilterButtonState';

interface SingleFilterStateArgs<FilterKey extends string> {
  options: FilterMap<FilterKey>;
  defaultValue: FilterValue<FilterKey>;
  label: string;
  queryStateKey: string;
}

function valueOrDefault<FilterKey extends string>(
  options: FilterMap<FilterKey>,
  newValue: string | undefined,
  defaultValue: FilterValue<FilterKey>,
) {
  if (newValue === undefined) {
    return defaultValue;
  }

  if (!{}.hasOwnProperty.call(options, newValue)) {
    log.warn(`Filter has no option ${newValue}, using default`);
    return defaultValue;
  }
  return options[newValue as FilterKey];
}

/** Maintains the state for a generic SingleSelectForm filter.
 * The generated filter depends on the `data` of the provided items.
 * The selection state for this filter will be synced with the query string using
 * the provided `queryStateKey`.
 */
export function useSingleFilterState<FilterKey extends string>({
  options,
  defaultValue,
  label,
  queryStateKey,
}: SingleFilterStateArgs<FilterKey>): SingleFilterState<FilterKey> {
  const [params, setQueryStateValue] = useQueryState();
  const queryStateValue = useMemo(() => params[queryStateKey], [params, queryStateKey]);

  const [selectedOption, setSelectedOption] = useState(
    valueOrDefault(options, queryStateValue, defaultValue),
  );

  const active = useMemo(
    () => selectedOption.value !== defaultValue.value,
    [selectedOption.value, defaultValue.value],
  );
  const button = useFilterButtonState();

  const onReset = () => {
    setSelectedOption(defaultValue);
    button.setOpen(false);
  };

  const onChange = (newValue: string) => {
    const val = valueOrDefault(options, newValue, defaultValue);
    setSelectedOption(val);
    // Automatically hide the form on selection of a new option
    button.setOpen(false);
  };

  useEffect(() => {
    const { value } = selectedOption;
    const queryValue = active ? value ?? '' : '';
    setQueryStateValue(queryStateKey, queryValue || '');
  }, [selectedOption, queryStateKey]);

  useEffect(() => {
    if (queryStateValue) {
      const val = valueOrDefault(options, queryStateValue, defaultValue);

      setSelectedOption(val);
    } else {
      onReset();
    }
  }, [queryStateValue]);

  const getFilter = () => selectedOption.data;

  return {
    active,
    button,
    getFilter,
    label,
    onChange,
    onReset,
    selectedValue: selectedOption.value,
    type: 'single',
    values: Object.values(options),
  };
}
