import { WaitForData } from 'components/common';
import { useWorkflow } from 'components/hooks';
import { LaunchForm } from 'components/Launch/LaunchForm/LaunchForm';
import { useExecutionLaunchConfiguration } from 'components/Launch/LaunchForm/useExecutionLaunchConfiguration';
import { getWorkflowInputs } from 'components/Launch/LaunchForm/utils';
import { Execution, Workflow } from 'models';
import * as React from 'react';

export interface RelaunchExecutionFormProps {
    execution: Execution;
    onClose(): void;
}

const RenderForm: React.FC<RelaunchExecutionFormProps & {
    workflow: Workflow;
}> = ({ execution, onClose, workflow }) => {
    const { workflowId } = execution.closure;
    const workflowInputs = getWorkflowInputs(workflow);
    const launchConfiguration = useExecutionLaunchConfiguration({
        execution,
        workflowInputs
    });
    return (
        <WaitForData {...launchConfiguration}>
            <LaunchForm
                initialParameters={launchConfiguration.value}
                onClose={onClose}
                workflowId={workflowId}
            />
        </WaitForData>
    );
};

/** For a given execution, fetches the associated workflow and renders a
 * `LaunchWorkflowForm` based on the workflow, launch plan, and inputs of the
 * execution. */
export const RelaunchExecutionForm: React.FC<RelaunchExecutionFormProps> = props => {
    const workflow = useWorkflow(props.execution.closure.workflowId);
    return (
        <WaitForData {...workflow}>
            {() => <RenderForm {...props} workflow={workflow.value} />}
        </WaitForData>
    );
};
