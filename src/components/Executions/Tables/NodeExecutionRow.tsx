import * as classnames from 'classnames';
import { useTheme } from 'components/Theme/useTheme';
import * as React from 'react';
import {
    ExecutionContext,
    NodeExecutionsRequestConfigContext
} from '../contexts';
import { DetailedNodeExecution } from '../types';
import { useChildNodeExecutions } from '../useChildNodeExecutions';
import { useDetailedChildNodeExecutions } from '../useDetailedNodeExecutions';
import { NodeExecutionsTableContext } from './contexts';
import { ExpandableExecutionError } from './ExpandableExecutionError';
import { NodeExecutionChildren } from './NodeExecutionChildren';
import { RowExpander } from './RowExpander';
import { selectedClassName, useExecutionTableStyles } from './styles';
import { calculateNodeExecutionRowLeftSpacing } from './utils';

interface NodeExecutionRowProps {
    execution: DetailedNodeExecution;
    level?: number;
    style?: React.CSSProperties;
}

/** Renders a NodeExecution as a row inside a `NodeExecutionsTable` */
export const NodeExecutionRow: React.FC<NodeExecutionRowProps> = ({
    execution: nodeExecution,
    level = 0,
    style
}) => {
    const theme = useTheme();
    const { columns, state } = React.useContext(NodeExecutionsTableContext);
    const requestConfig = React.useContext(NodeExecutionsRequestConfigContext);
    const { execution: workflowExecution } = React.useContext(ExecutionContext);

    const [expanded, setExpanded] = React.useState(false);
    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    // For the first level, we want the borders to span the entire table,
    // so we'll use padding to space the content. For nested rows, we want the
    // border to start where the content does, so we'll use margin.
    const spacingProp = level === 0 ? 'paddingLeft' : 'marginLeft';
    const rowContentStyle = {
        [spacingProp]: `${calculateNodeExecutionRowLeftSpacing(
            level,
            theme.spacing
        )}px`
    };

    // TODO: Handle error case for loading children.
    // Maybe show an expander in that case and make the content the error?
    const childNodeExecutions = useChildNodeExecutions({
        nodeExecution,
        requestConfig,
        workflowExecution
    });

    const detailedChildNodeExecutions = useDetailedChildNodeExecutions(
        childNodeExecutions.value
    );

    const isExpandable = detailedChildNodeExecutions.length > 0;
    const tableStyles = useExecutionTableStyles();

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
        <div className={classnames(tableStyles.childrenContainer)}>
            <NodeExecutionChildren
                childGroups={detailedChildNodeExecutions}
                level={level + 1}
            />
        </div>
    ) : null;

    return (
        <div
            className={classnames(tableStyles.row, {
                [selectedClassName]: selected
            })}
            style={style}
        >
            <div className={tableStyles.rowContent} style={rowContentStyle}>
                <div className={tableStyles.rowColumns}>
                    <div
                        className={classnames(
                            tableStyles.rowColumn,
                            tableStyles.expander
                        )}
                    >
                        {expanderContent}
                    </div>
                    {columns.map(
                        ({ className, key: columnKey, cellRenderer }) => (
                            <div
                                key={columnKey}
                                className={classnames(
                                    tableStyles.rowColumn,
                                    className
                                )}
                            >
                                {cellRenderer({
                                    state,
                                    execution: nodeExecution
                                })}
                            </div>
                        )
                    )}
                </div>
                {errorContent}
            </div>
            {extraContent}
        </div>
    );
};
