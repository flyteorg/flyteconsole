import { useState, useEffect } from 'react';
import { useFlyteApi } from '@clients/flyte-api/ApiProvider';
import { FilterOperation, FilterOperationName } from '@clients/common/types/adminEntityTypes';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useOnlyMineSelectedValue } from '../../hooks/useOnlyMineSelectedValue';
import { OnlyMyFilter } from '../../../basics/LocalCache/onlyMineDefaultConfig';
import { FeatureFlag, useFeatureFlag } from '../../../basics/FeatureFlags';

interface OnlyMyExecutionsFilterState {
  onlyMyExecutionsValue: boolean;
  isFilterDisabled: boolean;
  onOnlyMyExecutionsFilterChange: (newValue: boolean) => void;
  getFilter: () => FilterOperation | null;
}

interface OnlyMyExecutionsFilterStateProps {
  isFilterDisabled?: boolean;
  initialValue?: boolean;
}

/**
 *  Allows to filter executions by Current User Id
 */
export function useOnlyMyExecutionsFilterState({
  isFilterDisabled,
  initialValue,
}: OnlyMyExecutionsFilterStateProps): OnlyMyExecutionsFilterState {
  const profile = useUserProfile();
  const apiContext = useFlyteApi();
  const userId = profile.value?.subject ?? '';
  const isFlagEnabled = useFeatureFlag(FeatureFlag.OnlyMine);
  const onlyMineExecutionsSelectedValue = useOnlyMineSelectedValue(OnlyMyFilter.OnlyMyExecutions);
  const [onlyMyExecutionsValue, setOnlyMyExecutionsValue] = useState<boolean>(
    isFlagEnabled ? onlyMineExecutionsSelectedValue : initialValue ?? false, // if flag is enable let's use the value from only mine
  );
  const defaultIsFilterDisabled = !apiContext;

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

  // update the state value when state value in olny mine change
  useEffect(() => {
    if (isFlagEnabled) {
      setOnlyMyExecutionsValue(onlyMineExecutionsSelectedValue);
    }
  }, [onlyMineExecutionsSelectedValue]);

  return {
    onlyMyExecutionsValue,
    isFilterDisabled: isFilterDisabled ?? defaultIsFilterDisabled,
    onOnlyMyExecutionsFilterChange: setOnlyMyExecutionsValue,
    getFilter,
  };
}
