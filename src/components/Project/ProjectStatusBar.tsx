import * as React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import classNames from 'classnames';
import { WorkflowExecutionPhase } from 'models/Execution/enums';
import { barChartColors } from 'components/common/constants';

const useStyles = makeStyles((theme: Theme) => ({
    barContainer: {
        display: 'block'
    },
    barItem: {
        display: 'inline-block',
        marginRight: 2,
        borderRadius: 2,
        width: 10,
        height: 12,
        backgroundColor: barChartColors.default
    },
    successBarItem: {
        backgroundColor: barChartColors.success
    },
    failedBarItem: {
        backgroundColor: barChartColors.failure
    }
}));

interface ProjectStatusBarProps {
    items: WorkflowExecutionPhase[];
}

/**
 * Renders status of executions
 * @param items
 * @constructor
 */
const ProjectStatusBar: React.FC<ProjectStatusBarProps> = ({ items }) => {
    const styles = useStyles();

    return (
        <div className={styles.barContainer}>
            {items.map((item, idx) => {
                return (
                    <div
                        className={classNames(styles.barItem, {
                            [styles.successBarItem]:
                                item === WorkflowExecutionPhase.SUCCEEDED,
                            [styles.failedBarItem]:
                                item >= WorkflowExecutionPhase.FAILED
                        })}
                        key={`bar-item-${idx}`}
                    />
                );
            })}
        </div>
    );
};

export default ProjectStatusBar;
