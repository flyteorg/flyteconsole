import { useState } from 'react';
import { FilterOperation, FilterOperationName } from 'models/AdminEntity/types';
import { ExecutionState } from 'models/Execution/enums';

interface ArchiveFilterState {
  includeArchived: boolean;
  setIncludeArchived: (newValue: boolean) => void;
  getFilter: () => FilterOperation | null;
}

/**
 *  Allows to filter by Archive state
 */
export function useExecutionShowArchivedState(): ArchiveFilterState {
  const [includeArchived, setIncludeArchived] = useState(false);

  // By default all values are returned with EXECUTION_ACTIVE state,
  // so filter need to be applied only for ARCHIVED executions
  const getFilter = (): FilterOperation | null => {
    if (!includeArchived) {
      return null;
    }

    return {
      key: 'state',
      operation: FilterOperationName.VALUE_IN,
      value: [
        ExecutionState.EXECUTION_ARCHIVED,
        ExecutionState.EXECUTION_ACTIVE,
      ],
    };
  };

  return {
    includeArchived,
    setIncludeArchived,
    getFilter,
  };
}
