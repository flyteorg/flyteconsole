import { FilterOperationName } from 'models/AdminEntity/types';
import { useEffect, useState } from 'react';
import { FilterByUserState } from './types';
import { useFilterButtonState } from './useFilterButtonState';
import { useUserProfile } from 'components/hooks/useUserProfile';

interface FilterByUserStateArgs {
    queryStateKey: string;
    filterOperation?: FilterOperationName;
}

/** Maintains the state for a button to be used for filtering by user.
 */
export function useUserByFilterState({
    queryStateKey,
    filterOperation = FilterOperationName.EQ
}: FilterByUserStateArgs): FilterByUserState {
    const profile = useUserProfile();
    const filterValue =
        profile.value == null
            ? ''
            : profile.value?.preferredUsername == ''
            ? profile.value.name
            : profile.value?.preferredUsername;
    const button = useFilterButtonState();
    const [value, setValue] = useState('');

    useEffect(() => {
        if (button.open) {
            setValue('');
        } else {
            setValue(filterValue);
        }
    }, [button.open]);

    const getFilter = () => {
        return value.length
            ? [
                  {
                      value,
                      key: queryStateKey,
                      operation: filterOperation
                  }
              ]
            : [];
    };

    return {
        active: true,
        button,
        getFilter,
        label: button.open ? 'My executions' : 'All executions',
        type: 'byUser'
    };
}
