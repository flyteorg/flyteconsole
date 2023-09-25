import React, { ChangeEvent, FC } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { InputProps } from '../types';
import { getLaunchInputId } from '../utils';

const useStyles = makeStyles(() => ({
  formControl: {
    minWidth: '100%',
  },
}));

/** Handles rendering of the input component for any primitive-type input */
export const EnumInput: FC<InputProps> = props => {
  const {
    label,
    name,
    onChange,
    typeDefinition: { literalType },
    value,
    error,
  } = props;
  const classes = useStyles();

  const handleEnumChange = (event: ChangeEvent<{ value: unknown }>) => {
    onChange(event.target.value as string);
  };

  const inputId = getLaunchInputId(name);
  const labelId = `${inputId}-label`;
  return (
    <FormControl className={classes.formControl} variant="outlined">
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={inputId}
        label={label}
        value={value}
        onChange={handleEnumChange}
        variant="outlined"
        error={!!error}
        placeholder={label}
      >
        {literalType &&
          literalType.enumType?.values.map(item => (
            <MenuItem value={item}>{item}</MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};
