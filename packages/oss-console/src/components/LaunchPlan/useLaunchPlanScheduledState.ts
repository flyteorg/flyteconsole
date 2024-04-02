import { useState } from 'react';
import { FilterOperation, FilterOperationName } from '@clients/common/types/adminEntityTypes';

interface ScheduleFilterState {
  showScheduled: boolean;
  setShowScheduled: (newValue: boolean) => void;
  getFilters: () => FilterOperation[];
}

export const getScheduleFilter = (showScheduled: boolean): FilterOperation => {
  return {
    key: 'schedule_type',
    operation: FilterOperationName.NE,
    value: showScheduled ? ['NONE'] : [],
  };
};

/**
 *  Allows to filter by Archive state
 */
export function useLaunchPlanScheduledState(): ScheduleFilterState {
  const [showScheduled, setShowScheduled] = useState(false);

  const getFilters = (): FilterOperation[] => {
    return [getScheduleFilter(showScheduled)];
  };

  return {
    showScheduled,
    setShowScheduled,
    getFilters,
  };
}
