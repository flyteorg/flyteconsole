import { useContext, useMemo, useState } from 'react';
import { ExecutionContext } from '../contexts';
import { DetailedNodeExecution } from '../types';
import { mapNodeExecutionDetails } from '../utils';
import { NodeExecutionsTableProps } from './NodeExecutionsTable';
import { NodeExecutionsTableState } from './types';

export function useNodeExecutionsTableState({
    value
}: NodeExecutionsTableProps): NodeExecutionsTableState {
    const { dataCache } = useContext(ExecutionContext);
    const executions = useMemo(
        () => mapNodeExecutionDetails(value, dataCache),
        [value]
    );

    const [
        selectedExecution,
        setSelectedExecution
    ] = useState<DetailedNodeExecution | null>(null);

    return {
        executions,
        selectedExecution,
        setSelectedExecution
    };
}
