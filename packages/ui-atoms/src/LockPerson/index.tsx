import React from 'react';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';

export const LockPerson = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <LockPersonIcon />
  </SvgIcon>
);
export default LockPerson;
