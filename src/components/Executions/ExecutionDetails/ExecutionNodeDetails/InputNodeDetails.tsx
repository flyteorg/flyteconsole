import { SectionHeader } from 'components/common/SectionHeader';
import { NodeDetailsProps } from 'components/WorkflowGraph/NodeDetails/NodeDetails';
import { useStyles as useBaseStyles } from 'components/WorkflowGraph/NodeDetails/styles';
import * as React from 'react';

/** Details panel renderer for the start/input node in a graph. Displays the
 * top level `WorkflowExecution` inputs.
 */
export const InputNodeDetails: React.FC<NodeDetailsProps> = () => {
    const baseStyles = useBaseStyles();

    return (
        <section className={baseStyles.container}>
            <header className={baseStyles.header}>
                <div className={baseStyles.headerContent}>
                    <SectionHeader title="Execution Inputs" />
                </div>
            </header>
            <div className={baseStyles.content} />
        </section>
    );
};
