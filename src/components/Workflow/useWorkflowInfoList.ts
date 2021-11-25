import { DomainIdentifierScope, ResourceType } from 'models/Common/types';
import {
    FilterOperationName,
    RequestConfig,
    SortDirection
} from 'models/AdminEntity/types';
import { useAPIContext } from '../data/apiContext';
import { usePagination } from 'components/hooks/usePagination';
import { executionSortFields } from 'models/Execution/constants';
import { listExecutions } from 'models/Execution/api';
import { listWorkflows } from 'models/Workflow/api';
import { listLaunchPlans } from 'models/Launch/api';
import { workflowSortFields } from 'models/Workflow/constants';
import { WorkflowListItem } from './types';
import { getInputsForWorkflow } from '../Launch/LaunchForm/getInputs';
import * as Long from 'long';
import { formatDateUTC } from 'common/formatters';
import { timestampToDate } from 'common/utils';

export const useWorkflowInfoList = (
    scope: DomainIdentifierScope,
    config?: RequestConfig
) => {
    const { listNamedEntities } = useAPIContext();
    return usePagination<WorkflowListItem, DomainIdentifierScope>(
        { ...config, fetchArg: scope },
        async (scope, requestConfig) => {
            const { entities, ...rest } = await listNamedEntities(
                { ...scope, resourceType: ResourceType.WORKFLOW },
                requestConfig
            );

            const metadata = await Promise.all(
                entities.map(async entity => {
                    const {
                        id: { domain, project, name },
                        metadata: { description }
                    } = entity;
                    const { entities: executions } = await listExecutions(
                        { domain, project },
                        {
                            sort: {
                                key: executionSortFields.createdAt,
                                direction: SortDirection.DESCENDING
                            },
                            filter: [
                                {
                                    key: 'workflow.name',
                                    operation: FilterOperationName.EQ,
                                    value: name
                                }
                            ],
                            limit: 10
                        }
                    );
                    const {
                        entities: [workflow]
                    } = await listWorkflows(
                        { domain, project, name },
                        {
                            limit: 1,
                            sort: {
                                key: workflowSortFields.createdAt,
                                direction: SortDirection.DESCENDING
                            }
                        }
                    );
                    const { id } = workflow;
                    const {
                        entities: [launchPlan]
                    } = await listLaunchPlans(
                        { domain, project, name },
                        { limit: 1 }
                    );
                    const parsedInputs = getInputsForWorkflow(
                        workflow,
                        launchPlan,
                        undefined
                    );
                    const inputs =
                        parsedInputs.length > 0
                            ? parsedInputs.map(input => input.label).join(', ')
                            : undefined;
                    let latestExecutionTime;
                    const hasExecutions = executions.length > 0;
                    if (hasExecutions) {
                        const latestExecution = executions[0].closure.createdAt;
                        const timeStamp = {
                            nanos: latestExecution.nanos,
                            seconds: Long.fromValue(latestExecution.seconds!)
                        };
                        latestExecutionTime = formatDateUTC(
                            timestampToDate(timeStamp)
                        );
                    }
                    const executionStatus = executions.map(
                        execution => execution.closure.phase
                    );

                    return {
                        description,
                        id,
                        inputs,
                        latestExecutionTime,
                        executionStatus
                    };
                })
            );

            return {
                entities: metadata,
                ...rest
            };
        }
    );
};
