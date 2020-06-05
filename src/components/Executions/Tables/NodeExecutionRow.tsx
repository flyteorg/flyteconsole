import * as classnames from 'classnames';
import { useExpandableMonospaceTextStyles } from 'components/common/ExpandableMonospaceText';
import * as React from 'react';
import {
    ExecutionContext,
    NodeExecutionsRequestConfigContext
} from '../ExecutionDetails/contexts';
import { DetailedNodeExecution } from '../types';
import { useChildNodeExecutions } from '../useChildNodeExecutions';
import { useDetailedChildNodeExecutions } from '../useDetailedNodeExecutions';
import { NodeExecutionsTableContext } from './contexts';
import { ExpandableExecutionError } from './ExpandableExecutionError';
import { NodeExecutionChildren } from './NodeExecutionChildren';
import { RowExpander } from './RowExpander';
import { selectedClassName, useExecutionTableStyles } from './styles';

interface NodeExecutionRowProps {
    execution: DetailedNodeExecution;
    style?: React.CSSProperties;
}

/** Renders a NodeExecution as a row inside a `NodeExecutionsTable` */
export const NodeExecutionRow: React.FC<NodeExecutionRowProps> = ({
    execution: nodeExecution,
    style
}) => {
    const { columns, state } = React.useContext(NodeExecutionsTableContext);
    const requestConfig = React.useContext(NodeExecutionsRequestConfigContext);
    const { execution: workflowExecution } = React.useContext(ExecutionContext);

    const [expanded, setExpanded] = React.useState(false);
    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    // TODO: Handle error case for loading children.
    // Maybe show an expander in that case and make the content the error?
    const childNodeExecutions = useChildNodeExecutions({
        nodeExecution,
        requestConfig,
        workflowExecution
    });

    // TODO: Need to map workflow info here.
    const detailedChildNodeExecutions = useDetailedChildNodeExecutions(
        childNodeExecutions.value
    );

    const isExpandable = detailedChildNodeExecutions.length > 0;
    const tableStyles = useExecutionTableStyles();
    const monospaceTextStyles = useExpandableMonospaceTextStyles();

    const selected = state.selectedExecution
        ? state.selectedExecution === nodeExecution
        : false;
    const { error } = nodeExecution.closure;

    const expanderContent = isExpandable ? (
        <RowExpander expanded={expanded} onClick={toggleExpanded} />
    ) : null;

    const errorContent = error ? (
        <ExpandableExecutionError error={error} />
    ) : null;

    const extraContent = expanded ? (
        <div
            className={classnames(
                tableStyles.childrenContainer,
                monospaceTextStyles.nestedParent
            )}
        >
            {errorContent}
            <NodeExecutionChildren childGroups={detailedChildNodeExecutions} />
        </div>
    ) : (
        errorContent
    );

    return (
        <div
            className={classnames(tableStyles.row, {
                [selectedClassName]: selected
            })}
            style={style}
        >
            <div className={tableStyles.rowColumns}>
                <div className={tableStyles.expander}>{expanderContent}</div>
                {columns.map(({ className, key: columnKey, cellRenderer }) => (
                    <div
                        key={columnKey}
                        className={classnames(tableStyles.rowColumn, className)}
                    >
                        {cellRenderer({
                            state,
                            execution: nodeExecution
                        })}
                    </div>
                ))}
            </div>
            {extraContent}
        </div>
    );
};
