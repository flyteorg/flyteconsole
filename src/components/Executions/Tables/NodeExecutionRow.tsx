import * as classnames from 'classnames';
import { useExpandableMonospaceTextStyles } from 'components/common/ExpandableMonospaceText';
import * as React from 'react';
import { NodeExecutionsRequestConfigContext } from '../ExecutionDetails/contexts';
import { DetailedNodeExecution } from '../types';
import { useChildNodeExecutions } from '../useChildNodeExecutions';
import { NodeExecutionsTableContext } from './contexts';
import { ExpandableExecutionError } from './ExpandableExecutionError';
import { NodeExecutionChildren } from './NodeExecutionChildren';
import { RowExpander } from './RowExpander';
import { selectedClassName, useExecutionTableStyles } from './styles';
import { NodeExecutionColumnDefinition } from './types';

interface NodeExecutionRowProps {
    columns: NodeExecutionColumnDefinition[];
    execution: DetailedNodeExecution;
    style?: React.CSSProperties;
}

/** Renders a NodeExecution as a row inside a `NodeExecutionsTable` */
export const NodeExecutionRow: React.FC<NodeExecutionRowProps> = ({
    columns,
    execution,
    style
}) => {
    const state = React.useContext(NodeExecutionsTableContext);
    const requestConfig = React.useContext(NodeExecutionsRequestConfigContext);

    const [expanded, setExpanded] = React.useState(false);
    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    const childNodeExecutions = useChildNodeExecutions(
        execution,
        requestConfig
    );

    const isExpandable = childNodeExecutions.value.length > 0;
    const tableStyles = useExecutionTableStyles();
    const monospaceTextStyles = useExpandableMonospaceTextStyles();

    const selected = state.selectedExecution
        ? state.selectedExecution === execution
        : false;
    const { error } = execution.closure;

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
            <NodeExecutionChildren execution={execution} />
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
                            execution,
                            state
                        })}
                    </div>
                ))}
            </div>
            {extraContent}
        </div>
    );
};
