import { Dialog } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { contentMarginGridUnits } from 'common/layout';
import { WaitForData } from 'components/common/WaitForData';
import { EntityDescription } from 'components/Entities/EntityDescription';
import { useProject } from 'components/hooks/useProjects';
import { useChartState } from 'components/hooks/useChartState';
import { LaunchForm } from 'components/Launch/LaunchForm/LaunchForm';
import { ResourceIdentifier, ResourceType } from 'models/Common/types';
import * as React from 'react';
import { entitySections } from './constants';
import { EntityDetailsHeader } from './EntityDetailsHeader';
import { EntityExecutions } from './EntityExecutions';
import { EntitySchedules } from './EntitySchedules';
import { EntityVersions } from './EntityVersions';
import classNames from 'classnames';
import { StaticGraphContainer } from 'components/Workflow/StaticGraphContainer';
import { WorkflowId } from 'models/Workflow/types';
import { EntityExecutionsBarChart } from './EntityExecutionsBarChart';

const useStyles = makeStyles((theme: Theme) => ({
    metadataContainer: {
        display: 'flex',
        marginBottom: theme.spacing(5),
        marginTop: theme.spacing(2),
        width: '100%'
    },
    descriptionContainer: {
        flex: '2 1 auto',
        marginRight: theme.spacing(2)
    },
    executionsContainer: {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        margin: `0 -${theme.spacing(contentMarginGridUnits)}px`,
        flexBasis: theme.spacing(80)
    },
    verionDetailsContatiner: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        overflow: 'hidden'
    },
    versionDetailsContainerStaticGraph: {
        height: `calc(100vh - ${theme.spacing(1)}rem)`
    },
    staticGraphContainer: {
        display: 'flex',
        height: '60%',
        width: '100%',
        flex: '1'
    },
    versionsContainer: {
        display: 'flex',
        flex: '0 1 auto',
        height: '40%',
        flexDirection: 'column'
    },
    versionView: {
        flex: '0 0 auto'
    },
    schedulesContainer: {
        flex: '1 2 auto',
        marginRight: theme.spacing(30)
    }
}));

export interface EntityDetailsProps {
    id: ResourceIdentifier;
    versionView?: boolean;
    showStaticGraph?: boolean;
}

function getLaunchProps(id: ResourceIdentifier) {
    if (id.resourceType === ResourceType.TASK) {
        return { taskId: id };
    }

    return { workflowId: id };
}

/**
 * A view which optionally renders description, schedules, executions, and a
 * launch button/form for a given entity. Note: not all components are suitable
 * for use with all entities (not all entities have schedules, for example).
 * @param id
 * @param versionView
 * @param showStaticGraph
 */
export const EntityDetails: React.FC<EntityDetailsProps> = ({
    id,
    versionView = false,
    showStaticGraph = false
}) => {
    const sections = entitySections[id.resourceType];
    const workflowId = id as WorkflowId;
    const project = useProject(id.project);
    const styles = useStyles();
    const [showLaunchForm, setShowLaunchForm] = React.useState(false);
    const onLaunch = () => setShowLaunchForm(true);
    const onCancelLaunch = () => setShowLaunchForm(false);
    const { chartIds, onToggle, clearCharts } = useChartState();

    return (
        <WaitForData {...project}>
            <EntityDetailsHeader
                project={project.value}
                id={id}
                launchable={!!sections.launch}
                versionView={versionView}
                onClickLaunch={onLaunch}
            />
            {!versionView && (
                <div className={styles.metadataContainer}>
                    {sections.description ? (
                        <div className={styles.descriptionContainer}>
                            <EntityDescription id={id} />
                        </div>
                    ) : null}
                    {sections.schedules ? (
                        <div className={styles.schedulesContainer}>
                            <EntitySchedules id={id} />
                        </div>
                    ) : null}
                </div>
            )}
            {sections.versions ? (
                <div
                    className={classNames(styles.verionDetailsContatiner, {
                        [styles.versionDetailsContainerStaticGraph]: versionView
                    })}
                >
                    {showStaticGraph ? (
                        <div
                            className={classNames(styles.staticGraphContainer)}
                        >
                            <StaticGraphContainer workflowId={workflowId} />
                        </div>
                    ) : null}
                    <div
                        className={classNames(styles.versionsContainer, {
                            [styles.versionView]: versionView
                        })}
                    >
                        <EntityVersions id={id} versionView={versionView} />
                    </div>
                </div>
            ) : null}
            {!versionView && (
                <EntityExecutionsBarChart
                    onToggle={onToggle}
                    chartIds={chartIds}
                    id={id}
                />
            )}
            {sections.executions && !versionView ? (
                <div className={styles.executionsContainer}>
                    <EntityExecutions
                        chartIds={chartIds}
                        id={id}
                        clearCharts={clearCharts}
                    />
                </div>
            ) : null}
            {sections.launch ? (
                <Dialog
                    scroll="paper"
                    maxWidth="sm"
                    fullWidth={true}
                    open={showLaunchForm}
                >
                    <LaunchForm
                        onClose={onCancelLaunch}
                        {...getLaunchProps(id)}
                    />
                </Dialog>
            ) : null}
        </WaitForData>
    );
};
