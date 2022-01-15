import { Theme } from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';
import * as React from 'react';
import { TimeZone } from './constant';
import { COLOR_SPECTRUM } from 'components/Theme/colorSpectrum';

type Props = {
    children: React.ReactElement;
    open: boolean;
    value: number;
};

function valueText(value: number) {
    return `${value}s`;
}

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        borderTop: `1px solid ${theme.palette.divider}`,
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }
}));

const CustomSlider = withStyles({
    root: {
        color: '#665AFF',
        height: 4,
        padding: '15px 0',
        width: 360
    },
    active: {},
    valueLabel: {
        left: 'calc(-50% + 12px)',
        color: '#000',
        top: -22,
        '& *': {
            background: 'transparent',
            color: '#000'
        }
    },
    track: {
        height: 4
    },
    rail: {
        height: 4,
        opacity: 0.5,
        backgroundColor: COLOR_SPECTRUM.gray20.color
    },
    mark: {
        backgroundColor: COLOR_SPECTRUM.gray20.color,
        height: 8,
        width: 2,
        marginTop: -2
    },
    markLabel: {
        top: -6,
        fontSize: 12,
        color: COLOR_SPECTRUM.gray40.color
    },
    markActive: {
        opacity: 1,
        backgroundColor: 'currentColor'
    },
    marked: {
        marginBottom: 0
    }
})(Slider);

const formatSeconds = t => {
    const time = Math.floor(t);
    if (time < 60) {
        return `${time}s`;
    }
    if (time % 60 === 0) {
        return `${Math.floor(time / 60)}m`;
    }
    return `${Math.floor(time / 60)}m ${time % 60}s`;
};

const percentage = [0.1, 0.25, 0.5, 0.75, 1];

interface ExecutionTimelineFooterProps {
    maxTime: number;
    onTimezoneChange?: (timezone: string) => void;
    onTimeIntervalChange?: (interval: number) => void;
}

export const ExecutionTimelineFooter: React.FC<ExecutionTimelineFooterProps> = ({
    maxTime,
    onTimezoneChange,
    onTimeIntervalChange
}) => {
    const styles = useStyles();
    const [timezone, setTimezone] = React.useState(TimeZone.Local);
    const [timeInterval, setTimeInterval] = React.useState(1);

    const marks = React.useMemo(
        () => [
            {
                value: 0,
                label: '1s'
            },
            {
                value: 1,
                label: formatSeconds(maxTime * 0.1)
            },
            {
                value: 2,
                label: formatSeconds(maxTime * 0.25)
            },
            {
                value: 3,
                label: formatSeconds(maxTime * 0.5)
            },
            {
                value: 4,
                label: formatSeconds(maxTime * 0.75)
            },
            {
                value: 5,
                label: formatSeconds(maxTime)
            }
        ],
        [maxTime]
    );

    const handleTimezoneChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newTimezone = (event.target as HTMLInputElement).value;
        setTimezone(newTimezone);
        if (onTimezoneChange) {
            onTimezoneChange(newTimezone);
        }
    };

    const handleTimeIntervalChange = (event, newValue) => {
        setTimeInterval(newValue);
        if (onTimeIntervalChange) {
            onTimeIntervalChange(
                newValue === 0
                    ? 1
                    : Math.floor(maxTime * percentage[newValue - 1])
            );
        }
    };

    const getTitle = React.useCallback(
        value => {
            if (value === 0) {
                return '1s';
            }
            return formatSeconds(maxTime * percentage[value - 1]);
        },
        [maxTime]
    );

    return (
        <div className={styles.container}>
            <CustomSlider
                value={timeInterval}
                onChange={handleTimeIntervalChange}
                marks={marks}
                max={5}
                ValueLabelComponent={({ children, open, value }) => (
                    <Tooltip
                        arrow
                        open={open}
                        enterTouchDelay={0}
                        placement="top"
                        title={getTitle(value)}
                    >
                        {children}
                    </Tooltip>
                )}
                valueLabelDisplay="on"
                getAriaValueText={valueText}
            />
            <RadioGroup
                row
                aria-label="timezone"
                name="timezone"
                value={timezone}
                onChange={handleTimezoneChange}
            >
                <FormControlLabel
                    value={TimeZone.Local}
                    control={<Radio />}
                    label="Local Time"
                />
                <FormControlLabel
                    value={TimeZone.UTC}
                    control={<Radio />}
                    label="UTC"
                />
            </RadioGroup>
        </div>
    );
};