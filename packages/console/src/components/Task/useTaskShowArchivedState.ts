import { useState } from 'react';
import { FilterOperation, FilterOperationName } from 'models/AdminEntity/types';
import { NamedEntityState } from 'models/enums';

interface ArchiveFilterState {
  includeArchived: boolean;
  setIncludeArchived: (newValue: boolean) => void;
  getFilter: () => FilterOperation;
}

/**
 *  Allows to filter by Archive state
 */
export function useTaskShowArchivedState(): ArchiveFilterState {
  const [includeArchived, setIncludeArchived] = useState(false);

  // By default all values are returned with NAMED_ENTITY_ACTIVE state
  const getFilter = (): FilterOperation => {
    return {
      key: 'state',
      operation: FilterOperationName.EQ,
      value: includeArchived
        ? NamedEntityState.NAMED_ENTITY_ARCHIVED
        : NamedEntityState.NAMED_ENTITY_ACTIVE,
    };
  };

  return {
    includeArchived,
    setIncludeArchived,
    getFilter,
  };
}
