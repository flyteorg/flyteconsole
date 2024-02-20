import React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Slider from '@mui/material/Slider';
import FormControlLabel from '@mui/material/FormControlLabel';
import styled from '@mui/system/styled';
import { TimeZone } from './helpers';
import { useScaleContext } from './ScaleProvider/useScaleContext';

function valueText(value: number) {
  return `${value}s`;
}

const StyledContainer = styled('div')(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: '20px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const CustomSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.brand,
  height: 4,
  padding: '15px 0',
  width: 360,
  active: {},
  valueLabel: {
    left: 'calc(-50% + 12px)',
    color: theme.palette.primary,
    top: -22,
    '& *': {
      background: 'transparent',
      color: theme.palette.primary,
    },
  },
  track: {
    height: 4,
  },
  rail: {
    height: 4,
    opacity: 0.5,
    backgroundColor: theme.palette.common.grays[20],
  },
  mark: {
    backgroundColor: theme.palette.common.grays[20],
    height: 8,
    width: 2,
    marginTop: -2,
  },
  markLabel: {
    top: -6,
    fontSize: 12,
    color: theme.palette.common.grays[40],
  },
  markActive: {
    opacity: 1,
    backgroundColor: 'currentColor',
  },
  marked: {
    marginBottom: 0,
  },
}));

interface ExecutionTimelineFooterProps {
  onTimezoneChange?: (timezone: string) => void;
  timezone: string;
}

export const ExecutionTimelineFooter: React.FC<ExecutionTimelineFooterProps> = ({
  onTimezoneChange,
  timezone,
}) => {
  const timeScale = useScaleContext();

  const handleTimezoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTimezone = (event.target as HTMLInputElement).value;
    if (onTimezoneChange) {
      onTimezoneChange(newTimezone);
    }
  };

  const handleTimeIntervalChange = (event: Event, newValue: number | number[]) => {
    event.stopPropagation();
    if (!(typeof newValue === 'number')) {
      return;
    }
    timeScale.setScaleFactor(newValue);
  };

  return (
    <StyledContainer>
      <CustomSlider
        color="secondary"
        value={timeScale.scaleFactor}
        onChange={handleTimeIntervalChange}
        marks={timeScale.marks}
        max={timeScale.marks.length - 1}
        // ValueLabelComponent={({ children }) => <>{children}</>}
        valueLabelDisplay="auto"
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
          control={<Radio color="secondary" />}
          label="Local Time"
        />
        <FormControlLabel value={TimeZone.UTC} control={<Radio color="secondary" />} label="UTC" />
      </RadioGroup>
    </StyledContainer>
  );
};
