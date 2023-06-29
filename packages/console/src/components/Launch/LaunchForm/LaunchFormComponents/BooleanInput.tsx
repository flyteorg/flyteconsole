import React, { FC } from 'react';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Switch,
} from '@material-ui/core';
import { InputProps } from '../types';
import { getLaunchInputId } from '../utils';
import { makeSwitchChangeHandler } from '../handlers';

/** A micro form for entering the values related to a Blob Literal */
export const BooleanInput: FC<InputProps> = props => {
  const { name, value, onChange, label, error, required } = props;

  return (
    <FormControl>
      <FormControlLabel
        control={
          <Switch
            id={getLaunchInputId(name)}
            checked={!!value}
            onChange={makeSwitchChangeHandler(onChange)}
            value={name}
            required={required}
          />
        }
        label={label}
      />
      <FormHelperText error={!!error}>{error}</FormHelperText>
    </FormControl>
  );
};
