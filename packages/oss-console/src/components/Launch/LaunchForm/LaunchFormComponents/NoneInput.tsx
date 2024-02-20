import TextField from '@mui/material/TextField';
import React, { FC } from 'react';
import t from '../strings';
import { InputProps } from '../types';
import { getLaunchInputId } from '../utils';

/** Shared renderer for any launch input type we can't accept via the UI */
export const NoneInput: FC<InputProps> = (props) => {
  const { description, label, name } = props;
  return (
    <TextField
      id={getLaunchInputId(name)}
      fullWidth
      label={label}
      variant="outlined"
      disabled
      helperText={description}
      value={t('noneInputTypeDescription')}
    />
  );
};
