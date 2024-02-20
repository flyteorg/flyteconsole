import React, { FC } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import styled from '@mui/system/styled';
import isEmpty from 'lodash/isEmpty';
import { InputProps } from '../types';
import { getLaunchInputId } from '../utils';

const StyledFormControl = styled(FormControl)(() => ({
  minWidth: '100%',
}));

/** Handles rendering of the input component for any primitive-type input */
export const EnumInput: FC<InputProps> = (props) => {
  const {
    label,
    name,
    onChange,
    typeDefinition: { literalType },
    value,
    error,
  } = props;

  const handleEnumChange = (event: SelectChangeEvent<{ value: unknown }>) => {
    onChange(event.target.value as string);
  };

  const inputId = getLaunchInputId(name);
  const labelId = `${inputId}-label`;
  return (
    <StyledFormControl variant="outlined">
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={inputId}
        label={label}
        // MIGRATION TODO
        value={isEmpty(value) ? '' : (value as any)}
        onChange={handleEnumChange}
        variant="outlined"
        error={!!error}
        placeholder={label}
      >
        {literalType &&
          literalType.enumType?.values.map((item) => <MenuItem value={item}>{item}</MenuItem>)}
      </Select>
    </StyledFormControl>
  );
};
