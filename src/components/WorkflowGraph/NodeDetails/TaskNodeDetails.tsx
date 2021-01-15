import { DumpJSON } from 'components/common/DumpJSON';
import { WaitForData } from 'components/common/WaitForData';
import { useTaskTemplate } from 'components/hooks/useTask';
import { Identifier } from 'models/Common/types';
import * as React from 'react';

interface TaskNodeDetailsProps {
    taskId: Identifier;
}

/** Renders information about a Task node in a workflow graph. */
export const TaskNodeDetails: React.FC<TaskNodeDetailsProps> = ({ taskId }) => {
    const template = useTaskTemplate(taskId);
    return (
        <WaitForData {...template}>
            <DumpJSON value={template.value} />
        </WaitForData>
    );
};
