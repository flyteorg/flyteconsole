import { FilterOperationName } from 'models/AdminEntity/types';
import { useEffect, useState, useContext } from 'react';
import { FilterByUserState } from './types';
import { useFilterButtonState } from './useFilterButtonState';
import { APIContext } from 'components/data/apiContext';

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
    const { profile } = useContext(APIContext);
    const username =
        profile?.value == null
            ? ''
            : profile.value?.preferredUsername == ''
            ? profile.value.name
            : profile.value?.preferredUsername;

    const [value, setValue] = useState(username);
    const button = useFilterButtonState();

    useEffect(() => {
        if (button.open) setValue('');
        else setValue(username);
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
