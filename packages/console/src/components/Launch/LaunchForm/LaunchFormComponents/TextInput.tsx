import React, { FC } from 'react';
import { TextField, TextFieldProps } from '@material-ui/core';
import { makeStringChangeHandler } from '../handlers';
import { InputProps } from '../types';
import { getLaunchInputId } from '../utils';

/** Handles rendering of the input component for any primitive-type input */
export const TextInput: FC<
  InputProps & { textInputProps?: Partial<TextFieldProps> }
> = props => {
  const { error, label, name, onChange, value = '', textInputProps } = props;

  const id = getLaunchInputId(name);
  return (
    <TextField
      error={!!error}
      id={id}
      key={id}
      helperText={error}
      label={label}
      onChange={makeStringChangeHandler(onChange)}
      value={value}
      fullWidth={true}
      variant="outlined"
      {...textInputProps}
    />
  );
};
