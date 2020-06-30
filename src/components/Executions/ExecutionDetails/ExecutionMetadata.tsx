import { Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import * as classnames from 'classnames';
import { formatDateUTC, protobufDurationToHMS } from 'common/formatters';
import { timestampToDate } from 'common/utils';
import { useCommonStyles } from 'components/common/styles';
import { secondaryBackgroundColor, smallFontSize } from 'components/Theme';
import { Execution } from 'models';
import * as React from 'react';

const useStyles = makeStyles((theme: Theme) => {
    return {
        container: {
            alignItems: 'center',
            background: secondaryBackgroundColor,
            display: 'flex',
            flex: '0 1 auto',
            paddingTop: theme.spacing(3),
            paddingBottom: theme.spacing(2)
        },
        detailItem: {
            flexShrink: 0,
            marginLeft: theme.spacing(4)
        },
        version: {
            flex: '0 1 auto',
            overflow: 'hidden'
        }
    };
});

interface DetailItem {
    className?: string;
    label: React.ReactNode;
    value: React.ReactNode;
}

/** Renders metadata details about a given Execution */
export const ExecutionMetadata: React.FC<{
    execution: Execution;
}> = ({ execution }) => {
    const commonStyles = useCommonStyles();
    const styles = useStyles();

    const { domain } = execution.id;
    const { duration, startedAt, workflowId } = execution.closure;

    const details: DetailItem[] = [
        { label: 'Domain', value: domain },
        {
            className: styles.version,
            label: 'Version',
            value: workflowId.version
        },
        {
            label: 'Time',
            value: startedAt ? formatDateUTC(timestampToDate(startedAt)) : ''
        },
        {
            label: 'Duration',
            value: duration ? protobufDurationToHMS(duration) : ''
        }
    ];

    return (
        <div className={styles.container}>
            {details.map(({ className, label, value }, idx) => (
                <div
                    className={classnames(styles.detailItem, className)}
                    key={idx}
                >
                    <Typography
                        className={commonStyles.truncateText}
                        variant="subtitle1"
                    >
                        {label}
                    </Typography>
                    <Typography
                        className={commonStyles.truncateText}
                        variant="h6"
                    >
                        {value}
                    </Typography>
                </div>
            ))}
        </div>
    );
};
