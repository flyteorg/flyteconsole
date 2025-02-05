import React, { FC } from 'react';
import { Moment, utc as moment } from 'moment';
import Typography from '@mui/material/Typography';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { getLaunchInputId } from '../utils';
import { InputProps } from '../types';

/** A form field for selecting a date/time from a picker or entering it via
 * keyboard.
 */
export const DatetimeInput: FC<InputProps> = (props) => {
  const { error, label, name, onChange, value: propValue } = props;
  const hasError = !!error;
  const helperText = hasError ? error : props.helperText;
  const value = typeof propValue === 'string' && propValue.length > 0 ? propValue : null;

  const handleChange = (value: Moment | null) => {
    if (value && value.isValid()) {
      onChange(value.toISOString());
    } else if (value != null) {
      onChange(moment(value).toISOString());
    } else {
      onChange('');
    }
  };
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DateTimePicker
        // clearable
        slotProps={{
          actionBar: {
            actions: ['clear', 'today', 'cancel', 'accept'],
          },
          field(ownerState) {
            return {
              ...ownerState,
              id: getLaunchInputId(name),
            };
          },
        }}
        ampm={false}
        format="YYYY-MM-DD HH:mm:ss"
        label={label}
        onChange={handleChange}
        value={!value?.length ? null : moment(value)}
        sx={{
          width: '100%',
        }}
      />
      {hasError && (
        <Typography variant="body2" color="error" px={1} py={0.5}>
          <small>{helperText}</small>
        </Typography>
      )}
    </LocalizationProvider>
  );
};
