import { Typography } from '@material-ui/core';
import ChevronRight from '@material-ui/icons/ChevronRight';
import { SearchResult, WaitForData } from 'components/common';
import {
    SearchableNamedEntity,
    SearchableNamedEntityList,
    useNamedEntityListStyles
} from 'components/common/SearchableNamedEntityList';
import { useCommonStyles } from 'components/common/styles';
import { useWorkflowNameList } from 'components/hooks/useNamedEntity';
import { SearchableWorkflowNameList } from 'components/Workflow/SearchableWorkflowNameList';
import { Admin } from 'flyteidl';
import {
    FilterOperationName,
    limits,
    SortDirection,
    workflowSortFields
} from 'models';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Routes } from 'routes';

export interface ProjectWorkflowsProps {
    projectId: string;
    domainId: string;
}

/** A listing of the Workflows registered for a project */
export const ProjectWorkflows: React.FC<ProjectWorkflowsProps> = ({
    domainId: domain,
    projectId: project
}) => {
    const workflowNames = useWorkflowNameList(
        { domain, project },
        {
            limit: limits.NONE,
            sort: {
                direction: SortDirection.ASCENDING,
                key: workflowSortFields.name
            },
            // Hide archived workflows from the list
            filter: [
                {
                    key: 'state',
                    operation: FilterOperationName.EQ,
                    value: Admin.NamedEntityState.NAMED_ENTITY_ACTIVE
                }
            ]
        }
    );

    return (
        <WaitForData {...workflowNames}>
            <SearchableWorkflowNameList names={workflowNames.value} />
        </WaitForData>
    );
};
