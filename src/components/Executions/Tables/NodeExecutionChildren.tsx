import { Typography } from '@material-ui/core';
import * as classnames from 'classnames';
import { useExpandableMonospaceTextStyles } from 'components/common/ExpandableMonospaceText';
import * as React from 'react';
import { DetailedNodeExecutionGroup } from '../types';
import { NodeExecutionRow } from './NodeExecutionRow';
import { useExecutionTableStyles } from './styles';

export interface NodeExecutionChildrenProps {
    childGroups: DetailedNodeExecutionGroup[];
}

/** Renders a nested list of row items for children of a NodeExecution */
export const NodeExecutionChildren: React.FC<NodeExecutionChildrenProps> = ({
    childGroups
}) => {
    const showNames = childGroups.length > 1;
    const tableStyles = useExecutionTableStyles();
    const monospaceTextStyles = useExpandableMonospaceTextStyles();
    return (
        <>
            {childGroups.map(({ name, nodeExecutions }) => {
                const rows = nodeExecutions.map(nodeExecution => (
                    <NodeExecutionRow
                        key={nodeExecution.cacheKey}
                        execution={nodeExecution}
                    />
                ));
                const key = `group-${name}`;
                return showNames ? (
                    <div key={key}>
                        <div className={tableStyles.row}>
                            <Typography variant="overline">{name}</Typography>
                        </div>
                        <div
                            className={classnames(
                                tableStyles.childrenContainer,
                                monospaceTextStyles.nestedParent
                            )}
                        >
                            {rows}
                        </div>
                    </div>
                ) : (
                    <div key={key}>{rows}</div>
                );
            })}
        </>
    );
};
