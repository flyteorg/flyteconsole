import { useState } from 'react';
import { FilterOperation, FilterOperationName } from 'models/AdminEntity/types';
import { useUserProfile } from 'components/hooks/useUserProfile';

interface OnlyMyExecutionsFilterState {
  onlyMyExecutionsValue: boolean;
  isFilterDisabled: boolean;
  onOnlyMyExecutionsFilterChange: (newValue: boolean) => void;
  getFilter: () => FilterOperation | null;
}

/**
 *  Allows to filter executions by Current User Id
 */
export function useOnlyMyExecutionsFilterState(
  isFilterDisabled?: boolean,
  initialState?: boolean,
): OnlyMyExecutionsFilterState {
  const profile = useUserProfile();
  const userId = profile.value?.subject ? profile.value.subject : '';
  const [onlyMyExecutionsValue, setOnlyMyExecutionsValue] = useState<boolean>(
    initialState ?? false,
  );

  const getFilter = (): FilterOperation | null => {
    if (!onlyMyExecutionsValue) {
      return null;
    }

    return {
      key: 'user',
      value: userId,
      operation: FilterOperationName.EQ,
    };
  };

  return {
    onlyMyExecutionsValue,
    isFilterDisabled: isFilterDisabled ?? false,
    onOnlyMyExecutionsFilterChange: setOnlyMyExecutionsValue,
    getFilter,
  };
}
