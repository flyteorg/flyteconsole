import { useState } from 'react';
import { FilterOperation, FilterOperationName } from '@clients/common/types/adminEntityTypes';

interface ScheduleFilterState {
  showScheduled: boolean;
  setShowScheduled: (newValue: boolean) => void;
  getFilter: () => FilterOperation;
}

/**
 *  Allows to filter by Archive state
 */
export function useLaunchPlanScheduledState(): ScheduleFilterState {
  const [showScheduled, setShowScheduled] = useState(false);

  const getFilter = (): FilterOperation => {
    return {
      key: 'schedule_type',
      operation: FilterOperationName.NE,
      value: showScheduled ? ['NONE'] : [],
    };
  };

  return {
    showScheduled,
    setShowScheduled,
    getFilter,
  };
}
