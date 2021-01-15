import { Button, Dialog, Link, Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import ArrowBack from '@material-ui/icons/ArrowBack';
import * as classnames from 'classnames';
import { navbarGridHeight } from 'common/layout';
import { MoreOptionsMenu } from 'components/common/MoreOptionsMenu';
import { useCommonStyles } from 'components/common/styles';
import { useLocationState } from 'components/hooks/useLocationState';
import { NavBarContent } from 'components/Navigation/NavBarContent';
import { interactiveTextDisabledColor } from 'components/Theme/constants';
import { Execution } from 'models/Execution/types';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ExecutionInputsOutputsModal } from '../ExecutionInputsOutputsModal';
import { ExecutionStatusBadge } from '../ExecutionStatusBadge';
import { TerminateExecutionButton } from '../TerminateExecution/TerminateExecutionButton';
import { executionIsRunning, executionIsTerminal } from '../utils';
import { backLinkTitle, executionActionStrings } from './constants';
import { RelaunchExecutionForm } from './RelaunchExecutionForm';
import { getExecutionBackLink, getExecutionSourceId } from './utils';

const useStyles = makeStyles((theme: Theme) => {
    return {
        actionButton: {
            marginLeft: theme.spacing(2)
        },
        actions: {
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'flex-end',
            flex: '1 0 auto',
            height: '100%',
            marginLeft: theme.spacing(2)
        },
        backLink: {
            color: 'inherit',
            marginRight: theme.spacing(1)
        },
        container: {
            alignItems: 'center',
            display: 'flex',
            flex: '1 1 auto',
            maxWidth: '100%'
        },
        inputsOutputsLink: {
            color: interactiveTextDisabledColor
        },
        moreActions: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(-2)
        },
        title: {
            flex: '0 1 auto',
            marginLeft: theme.spacing(2)
        },
        titleContainer: {
            alignItems: 'center',
            display: 'flex',
            flex: '0 1 auto',
            flexDirection: 'column',
            maxHeight: theme.spacing(navbarGridHeight),
            overflow: 'hidden'
        },
        version: {
            flex: '0 1 auto',
            overflow: 'hidden'
        }
    };
});

/** Renders information about a given Execution into the NavBar */
export const ExecutionDetailsAppBarContent: React.FC<{
    execution: Execution;
}> = ({ execution }) => {
    const commonStyles = useCommonStyles();
    const styles = useStyles();
    const [showInputsOutputs, setShowInputsOutputs] = React.useState(false);
    const [showRelaunchForm, setShowRelaunchForm] = React.useState(false);
    const { domain, name, project } = execution.id;
    const { phase } = execution.closure;
    const sourceId = getExecutionSourceId(execution);
    const { backLink = getExecutionBackLink(execution) } = useLocationState();
    const isRunning = executionIsRunning(execution);
    const isTerminal = executionIsTerminal(execution);
    const onClickShowInputsOutputs = () => setShowInputsOutputs(true);
    const onClickRelaunch = () => setShowRelaunchForm(true);
    const onCloseRelaunch = () => setShowRelaunchForm(false);

    let modalContent: JSX.Element | null = null;
    if (showInputsOutputs) {
        const onClose = () => setShowInputsOutputs(false);
        modalContent = (
            <ExecutionInputsOutputsModal
                execution={execution}
                onClose={onClose}
            />
        );
    }

    const actionContent = isRunning ? (
        <TerminateExecutionButton className={styles.actionButton} />
    ) : isTerminal ? (
        <Button
            variant="outlined"
            color="primary"
            className={classnames(
                styles.actionButton,
                commonStyles.buttonWhiteOutlined
            )}
            onClick={onClickRelaunch}
            size="small"
        >
            Relaunch
        </Button>
    ) : null;

    // For non-terminal executions, add an overflow menu with the ability to clone
    const moreActionsContent = !isTerminal ? (
        <MoreOptionsMenu
            className={styles.moreActions}
            options={[
                {
                    label: executionActionStrings.clone,
                    onClick: onClickRelaunch
                }
            ]}
        />
    ) : null;

    return (
        <>
            <NavBarContent>
                <div className={styles.container}>
                    <RouterLink
                        title={backLinkTitle}
                        className={styles.backLink}
                        to={backLink}
                    >
                        <ArrowBack />
                    </RouterLink>
                    <ExecutionStatusBadge phase={phase} type="workflow" />
                    <div className={styles.titleContainer}>
                        <Typography
                            variant="body1"
                            className={classnames(
                                styles.title,
                                commonStyles.textWrapped
                            )}
                        >
                            <span>
                                {`${project}/${domain}/${sourceId.name}/`}
                                <strong>{`${name}`}</strong>
                            </span>
                        </Typography>
                    </div>
                    <div className={styles.actions}>
                        <Link
                            className={styles.inputsOutputsLink}
                            component="button"
                            onClick={onClickShowInputsOutputs}
                            variant="body1"
                        >
                            View Inputs &amp; Outputs
                        </Link>
                        {actionContent}
                        {moreActionsContent}
                    </div>
                </div>
                <Dialog
                    scroll="paper"
                    maxWidth="sm"
                    fullWidth={true}
                    open={showRelaunchForm}
                >
                    <RelaunchExecutionForm
                        execution={execution}
                        onClose={onCloseRelaunch}
                    />
                </Dialog>
            </NavBarContent>
            {modalContent}
        </>
    );
};
