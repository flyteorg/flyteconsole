import { FilterOperationName } from 'models/AdminEntity/types';
import { UserProfile } from 'models/Common/types';
import { useState } from 'react';
import { BooleanFilterState } from './types';
import { useFilterButtonState } from './useFilterButtonState';
import { useUserProfile } from 'components/hooks/useUserProfile';

/** Maintains the state for a button to be used for filtering by user.
 */
function getUserId(profile: UserProfile): string {
    return profile.sub ? profile.sub : '';
}

export function useCurrentUserOnlyFilterState(): BooleanFilterState {
    const profile = useUserProfile();
    const userId = profile.value ? getUserId(profile.value) : '';
    const [active, setActive] = useState(true);

    const button = useFilterButtonState();

    const getFilter = () => {
        return active && userId
            ? [
                  {
                      value: userId,
                      key: 'user',
                      operation: FilterOperationName.EQ
                  }
              ]
            : [];
    };

    return {
        active,
        button,
        hidden: !userId,
        label: 'Only my executions',
        getFilter,
        setActive,
        onReset: () => {},
        type: 'boolean'
    };
}
