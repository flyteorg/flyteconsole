import React from 'react';
import Tooltip, { type TooltipProps } from '@mui/material/Tooltip';
import { tooltipClasses } from '@mui/material/Tooltip';
import styled from '@mui/system/styled';

const A = ({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
);
export const InfoTooltip = styled(A)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'white',
    color: theme.palette.common.primary.union500,
    maxWidth: '303px',
    fontSize: (theme.typography as any)?.pxToRem?.(10),
    borderRaidus: 8,
    boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.4)',
    textAlign: 'center',
  },
}));
