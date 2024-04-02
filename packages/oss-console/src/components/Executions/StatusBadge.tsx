import React from 'react';
import classnames from 'classnames';
import Typography from '@mui/material/Typography';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import styled from '@mui/system/styled';

export const StyledWrapper = styled('div')(({ theme }) => ({
  fontWeight: 'normal',
  '&.default': {
    padding: theme.spacing(0.25, 0.5),
    alignItems: 'center',
    backgroundColor: theme.palette.common.primary.white,
    borderRadius: theme.spacing(0.5),
    color: theme.palette.text.primary,
    display: 'flex',
    flex: '0 0 auto',
    height: theme.spacing(2.5),
    fontSize: CommonStylesConstants.smallFontSize,
    justifyContent: 'center',
    textTransform: 'uppercase',
    width: theme.spacing(11), // 88px
  },
  '&.text': {
    backgroundColor: 'inherit',
    border: 'none',
    marginTop: theme.spacing(1),
    textTransform: 'lowercase',
  },
  '&.launchPlan': {
    textTransform: 'none',
    width: theme.spacing(6),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}));

export interface StatusBadgeProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  text: string;
  variant?: 'default' | 'text';
  className?: string;
  sx?: React.CSSProperties;
}
export const StatusBadge = ({
  text,
  variant = 'default',
  className,
  sx,
  ...htmlProps
}: StatusBadgeProps) => {
  return (
    <StyledWrapper className={classnames(variant, className)} sx={sx} {...htmlProps}>
      <Typography variant="label">{text}</Typography>
    </StyledWrapper>
  );
};
