import React, { FC, PropsWithChildren } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import styled from '@mui/system/styled';
import { getLaunchInputId } from '../utils';

export const StyledCardContainer = styled(Card)(({ theme }) => {
  return {
    position: 'relative',
    overflow: 'visible',
    border: `1px solid ${theme.palette.grey[300]}`,
    boxShadow: 'none',

    '&.error': {
      border: '1px solid red',
      '& .inlineTitle': {
        color: 'red',
      },
    },

    '& .inlineTitle': {
      position: 'absolute',
      top: '-12px',
      left: '10px',
      color: 'gray',
      background: 'white',
      fontSize: '10.5px',
      padding: '0 4px',
    },
  };
});

export interface StyledCardProps {
  error?: string;
  name: string;
  label: string;
}
export const StyledCard: FC<PropsWithChildren<StyledCardProps>> = ({
  error,
  label,
  children,
  name,
}) => {
  const id = getLaunchInputId(name);

  return label ? (
    <StyledCardContainer className={error ? 'error' : ''}>
      <CardContent>
        <Typography variant="body1" component="label" className="inlineTitle" id={`${id}-label`}>
          {label}
        </Typography>

        {children}
      </CardContent>
      <FormHelperText error={!!error}>{error}</FormHelperText>
    </StyledCardContainer>
  ) : (
    <div>
      {children}
      <FormHelperText error={!!error}>{error}</FormHelperText>
    </div>
  );
};
