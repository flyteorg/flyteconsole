import { useState } from 'react';
import { FilterOperation, FilterOperationName } from 'models/AdminEntity/types';
import { ExecutionState } from 'models/Execution/enums';

interface ArchiveFilterState {
    showArchived: boolean;
    setShowArchived: (newValue: boolean) => void;
    getFilter: () => FilterOperation;
}

/**
 *  Allows to filter by Archive state
 */
export function useExecutionShowArchivedState(): ArchiveFilterState {
    const [showArchived, setShowArchived] = useState(false);

    const getFilter = (): FilterOperation => {
        return {
            key: 'state',
            operation: FilterOperationName.EQ,
            value: showArchived
                ? ExecutionState.EXECUTION_ARCHIVED
                : ExecutionState.EXECUTION_ACTIVE
        };
    };

    return {
        showArchived,
        setShowArchived,
        getFilter
    };
}
