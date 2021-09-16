import { withRouteParams } from 'components/common/withRouteParams';
import { EntityDetails } from 'components/Entities/EntityDetails';
import { ResourceIdentifier, ResourceType } from 'models/Common/types';
import * as React from 'react';

export interface WorkflowVersionDetailsRouteParams {
    projectId: string;
    domainId: string;
    workflowName: string;
<<<<<<< HEAD
    workflowVersion: string;
=======
>>>>>>> 9920e0a (Feat/version details (#198))
}
export type WorkflowDetailsProps = WorkflowVersionDetailsRouteParams;

/**
 * The view component for the Workflow Versions page
 * @param projectId
 * @param domainId
 * @param workflowName
 */
export const WorkflowVersionDetailsContainer: React.FC<WorkflowVersionDetailsRouteParams> = ({
    projectId,
    domainId,
<<<<<<< HEAD
    workflowName,
    workflowVersion
=======
    workflowName
>>>>>>> 9920e0a (Feat/version details (#198))
}) => {
    const id = React.useMemo<ResourceIdentifier>(
        () => ({
            resourceType: ResourceType.WORKFLOW,
            project: projectId,
            domain: domainId,
<<<<<<< HEAD
            name: workflowName,
            version: workflowVersion
        }),
        [projectId, domainId, workflowName, workflowVersion]
=======
            name: workflowName
        }),
        [projectId, domainId, workflowName]
>>>>>>> 9920e0a (Feat/version details (#198))
    );
    return <EntityDetails id={id} versionView />;
};

export const WorkflowVersionDetails = withRouteParams<
    WorkflowVersionDetailsRouteParams
>(WorkflowVersionDetailsContainer);
