import { SectionHeader } from 'components/common/SectionHeader';
import { useCommonStyles } from 'components/common/styles';
import { WaitForData } from 'components/common/WaitForData';
import { LiteralMapViewer } from 'components/Literals/LiteralMapViewer';
import { RemoteLiteralMapViewer } from 'components/Literals/RemoteLiteralMapViewer';
import { NodeDetailsProps } from 'components/WorkflowGraph/NodeDetails/NodeDetails';
import { useStyles as useBaseStyles } from 'components/WorkflowGraph/NodeDetails/styles';
import { emptyLiteralMapBlob } from 'models/Common/constants';
import { Execution } from 'models/Execution/types';
import * as React from 'react';
import { ExecutionContext } from '../../contexts';
import { useWorkflowExecutionData } from '../../useWorkflowExecution';

const RemoteExecutionOutputs: React.FC<{ execution: Execution }> = ({
    execution
}) => {
    const executionData = useWorkflowExecutionData(execution.id);
    return (
        <WaitForData {...executionData}>
            {() => (
                <RemoteLiteralMapViewer
                    map={executionData.value.fullOutputs}
                    blob={executionData.value.outputs}
                />
            )}
        </WaitForData>
    );
};

/** Details panel renderer for the end/outputs node in a graph. Displays the
 * top level `WorkflowExecution` outputs.
 */
export const OutputNodeDetails: React.FC<NodeDetailsProps> = () => {
    const commonStyles = useCommonStyles();
    const baseStyles = useBaseStyles();
    const { execution } = React.useContext(ExecutionContext);
    const outputs = execution.closure.outputs || emptyLiteralMapBlob;

    // Small outputs will be stored directly in the execution.
    // For larger outputs, we need to fetch them using the /data endpoint
    const content = outputs.uri ? (
        <RemoteExecutionOutputs execution={execution} />
    ) : (
        <LiteralMapViewer map={outputs.values} />
    );

    return (
        <section className={baseStyles.container}>
            <header className={baseStyles.header}>
                <div className={baseStyles.headerContent}>
                    <SectionHeader title="Execution Outputs" />
                </div>
            </header>
            <div className={baseStyles.content}>
                <div className={commonStyles.detailsPanelCard}>
                    <div className={commonStyles.detailsPanelCardContent}>
                        {content}
                    </div>
                </div>
            </div>
        </section>
    );
};
