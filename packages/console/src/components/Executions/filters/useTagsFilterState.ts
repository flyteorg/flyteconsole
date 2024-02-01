import { useQueryState } from 'components/hooks/useQueryState';
import { FilterOperationName } from 'models/AdminEntity/types';
import { useEffect, useState } from 'react';
import { TagsFilterState } from './types';
import { useFilterButtonState } from './useFilterButtonState';

function serializeForQueryState(values: any[]) {
  return values.join(';');
}
function deserializeFromQueryState(stateValue = '') {
  return stateValue.split(';');
}

interface TagsFilterStateStateArgs {
  defaultValue?: string[];
  filterKey: string;
  filterOperation?: FilterOperationName;
  label: string;
  placeholder: string;
  queryStateKey: string;
}

/** Maintains the state for a `TagsInputForm` filter.
 * The generated `FilterOperation` will use the provided `key` and `operation`
 * (defaults to `VALUE_IN`)
 * The current search value will be synced to the query string using the
 * provided `queryStateKey` value.
 */
export function useTagsFilterState({
  defaultValue = [],
  filterKey,
  filterOperation = FilterOperationName.VALUE_IN,
  label,
  placeholder,
  queryStateKey,
}: TagsFilterStateStateArgs): TagsFilterState {
  const { params, setQueryStateValue } =
    useQueryState<Record<string, string>>();
  const queryStateValue = params[queryStateKey];

  const [tags, setTags] = useState(defaultValue);
  const active = tags.length !== 0;

  const button = useFilterButtonState();
  const onChange = (newValue: string[]) => {
    setTags(newValue);
  };

  const onReset = () => {
    setTags(defaultValue);
    button.setOpen(false);
  };

  useEffect(() => {
    const queryValue = tags.length ? serializeForQueryState(tags) : undefined;
    setQueryStateValue(queryStateKey, queryValue);
  }, [tags.join(), queryStateKey]);

  useEffect(() => {
    if (queryStateValue) {
      setTags(deserializeFromQueryState(queryStateValue));
    }
  }, [queryStateValue]);

  const getFilter = () =>
    tags.length
      ? [
          {
            value: tags,
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
    tags,
    type: 'tags',
  };
}
