import React, { FC } from 'react';
import { TextField } from '@material-ui/core';
import { makeStringChangeHandler } from '../handlers';
import { InputProps } from '../types';
import { getLaunchInputId } from '../utils';

/** Handles rendering of the input component for any primitive-type input */
export const TextInput: FC<InputProps> = props => {
  const { error, label, name, onChange, value = '' } = props;

  const id = getLaunchInputId(name);
  return (
    <TextField
      error={!!error}
      id={id}
      key={id}
      helperText={error}
      fullWidth={true}
      label={label}
      onChange={makeStringChangeHandler(onChange)}
      value={value}
      variant="outlined"
    />
  );
};
