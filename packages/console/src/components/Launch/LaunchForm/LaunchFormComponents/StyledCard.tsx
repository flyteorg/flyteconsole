import {
  Card,
  CardContent,
  FormHelperText,
  Typography,
  styled,
} from '@material-ui/core';
import React, { FC } from 'react';

export const StyledCardContainer = styled(Card)(() => ({
  position: 'relative',
  overflow: 'visible',

  '&.error': {
    border: '1px solid red',
    '& .inlineTitle': {
      color: 'red',
    },
  },

  '& .inlineTitle': {
    position: 'absolute',
    top: '-8px',
    color: 'gray',
    background: 'white',
    fontSize: '10px',
  },
}));

export interface StyledCardProps {
  error?: string;
  label: string;
}
export const StyledCard: FC<StyledCardProps> = ({ error, label, children }) => {
  return label ? (
    <StyledCardContainer className={error ? 'error' : ''}>
      <CardContent>
        <Typography variant="body1" component="label" className="inlineTitle">
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
