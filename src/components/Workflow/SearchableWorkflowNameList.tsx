import { makeStyles, Theme } from '@material-ui/core/styles';
import DeviceHub from '@material-ui/icons/DeviceHub';
import classNames from 'classnames';
import { useNamedEntityListStyles } from 'components/common/SearchableNamedEntityList';
import { useCommonStyles } from 'components/common/styles';
import {
    separatorColor,
    primaryTextColor,
    workflowLabelColor
} from 'components/Theme/constants';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Routes } from 'routes/routes';
import { WorkflowListItem } from './types';
import ProjectStatusBar from '../Project/ProjectStatusBar';
import { WorkflowExecutionPhase } from 'models/Execution/enums';
import { workflowNoInputsString } from '../Launch/LaunchForm/constants';
import { SearchableInput } from '../common/SearchableList';
import { useSearchableListState } from '../common/useSearchableListState';

interface SearchableWorkflowNameListProps {
    workflows: WorkflowListItem[];
}

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        padding: 13,
        paddingRight: 71
    },
    itemContainer: {
        marginBottom: 15,
        borderRadius: 16,
        padding: '23px 30px',
        border: `1px solid ${separatorColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    itemName: {
        display: 'flex',
        fontWeight: 600,
        color: primaryTextColor,
        marginBottom: 10
    },
    itemDescriptionRow: {
        color: '#757575',
        marginBottom: 30
    },
    itemIcon: {
        marginRight: 14,
        color: '#636379'
    },
    itemRow: {
        display: 'flex',
        marginBottom: 10,
        '&:last-child': {
            marginBottom: 0
        }
    },
    itemLabel: {
        width: 140,
        fontSize: 14,
        color: workflowLabelColor
    },
    searchInputContainer: {
        padding: '0 13px',
        margin: '32px 0 23px'
    }
}));

const padExecutions = (items: WorkflowExecutionPhase[]) => {
    if (items.length >= 10) {
        return items.slice(0, 10).reverse();
    }
    const emptyExecutions = new Array(10 - items.length).fill(
        WorkflowExecutionPhase.QUEUED
    );
    return [...items, ...emptyExecutions].reverse();
};

/**
 * Renders a searchable list of Workflow names, with associated descriptions
 * @param workflows
 * @constructor
 */
export const SearchableWorkflowNameList: React.FC<SearchableWorkflowNameListProps> = ({
    workflows
}) => {
    const commonStyles = useCommonStyles();
    const listStyles = useNamedEntityListStyles();
    const styles = useStyles();
    const { results, searchString, setSearchString } = useSearchableListState({
        items: workflows,
        propertyGetter: ({ id, description, inputs }) =>
            id.name + description + inputs
    });
    const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchString = event.target.value;
        setSearchString(searchString);
    };
    const onClear = () => setSearchString('');

    const renderItem = (workflowItem: WorkflowListItem, idx: number) => {
        const {
            id,
            inputs,
            outputs,
            latestExecutionTime,
            description,
            executionStatus
        } = workflowItem;
        const key = `${id.project}/${id.domain}/${id.name}/${idx}`;
        return (
            <Link
                key={key}
                className={commonStyles.linkUnstyled}
                to={Routes.WorkflowDetails.makeUrl(
                    id.project,
                    id.domain,
                    id.name
                )}
            >
                <div
                    className={classNames(
                        listStyles.searchResult,
                        styles.itemContainer
                    )}
                >
                    <div className={styles.itemName}>
                        <DeviceHub className={styles.itemIcon} />
                        <div>{id.name}</div>
                    </div>
                    <div className={styles.itemDescriptionRow}>
                        {description?.length
                            ? description
                            : 'This workflow has no description.'}
                    </div>
                    <div className={styles.itemRow}>
                        <div className={styles.itemLabel}>
                            Last execution time
                        </div>
                        <div>
                            {latestExecutionTime ? (
                                latestExecutionTime
                            ) : (
                                <em>No executions found</em>
                            )}
                        </div>
                    </div>
                    <div className={styles.itemRow}>
                        <div className={styles.itemLabel}>
                            Last 10 executions
                        </div>
                        <ProjectStatusBar
                            items={padExecutions(executionStatus || [])}
                        />
                    </div>
                    <div className={styles.itemRow}>
                        <div className={styles.itemLabel}>Inputs</div>
                        <div>{inputs ?? <em>{workflowNoInputsString}</em>}</div>
                    </div>
                    <div className={styles.itemRow}>
                        <div className={styles.itemLabel}>Outputs</div>
                        <div>{outputs ?? <em>No output data found.</em>}</div>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <>
            <SearchableInput
                onClear={onClear}
                onSearchChange={onSearchChange}
                variant="normal"
                value={searchString}
                className={styles.searchInputContainer}
                placeholder="Search Workflow Name"
            />
            <div className={styles.container}>
                {results.map((workflow, idx) =>
                    renderItem(workflow.value, idx)
                )}
            </div>
        </>
    );
};
