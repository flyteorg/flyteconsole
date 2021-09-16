import {
    Identifier,
    IdentifierScope,
    ResourceIdentifier
} from 'models/Common/types';
import { RequestConfig } from 'models/AdminEntity/types';
import { getWorkflow } from 'models/Workflow/api';
import { Workflow } from 'models/Workflow/types';
import { usePagination } from './usePagination';
import { WorkflowInitialLaunchParameters } from 'components/Launch/LaunchForm/types';
import { useAPIContext } from 'components/data/apiContext';
import { useFetchableData } from './useFetchableData';
import { fetchWorkflow } from 'components/Workflow/workflowQueries';
import { useQueryClient } from 'react-query';
import { QueryInput } from 'components/data/types';

/*
export interface WorkflowInitialLaunchParameters
    extends BaseInitialLaunchParameters {
    launchPlan?: Identifier;
    workflowId?: WorkflowId;
}

/**
 * A hook for fetching a paginated list of workflow versions.
 * @param scope
 * @param config
 */
export function useWorkflow(id: Identifier) {
    console.log('@USE WORKFLOW');
    const queryClient = useQueryClient();
    return useFetchableData({
        defaultValue: {} as QueryInput<Workflow>,
        doFetch: async () => {
            const values = await fetchWorkflow(queryClient, id);
            return { values };
        }
    });
}
