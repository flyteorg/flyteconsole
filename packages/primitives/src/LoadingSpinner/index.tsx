import React from 'react';
import CircularProgress, { type CircularProgressProps } from '@mui/material/CircularProgress';
import styled from '@mui/system/styled';
import { useDelayedValue } from '../hooks/useDelayedValue';

const LoadingSpinnerContainer = styled('div')(() => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  '&.large': { height: '300px' },
  '&.medium': { height: '80px' },
  '&.small': { height: '40px' },
}));

type SizeValue = 'xs' | 'small' | 'medium' | 'large';
export type LoadingSpinnerProps = CircularProgressProps & {
  size?: SizeValue;
  useDelay?: boolean;
};

const spinnerSizes: Record<SizeValue, number> = {
  xs: 12,
  small: 24,
  medium: 48,
  large: 96,
};

export const loadingSpinnerDelayMs = 1000;

/** Renders a loading spinner after 1000ms. Size options are 'small', 'medium', and 'large' */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  useDelay = true,
  ...props
}) => {
  const delayMs = useDelay ? loadingSpinnerDelayMs : 0;
  const shouldRender = useDelayedValue(!delayMs, delayMs, true);
  return shouldRender ? (
    <LoadingSpinnerContainer className={size} data-testid="loading-spinner">
      <CircularProgress size={spinnerSizes[size]} {...(props || {})} />
    </LoadingSpinnerContainer>
  ) : null;
};

/** `LoadingSpinner` with a pre-bound size of `medium` */
export const MediumLoadingSpinner: React.FC<LoadingSpinnerProps> = (props) => (
  <LoadingSpinner {...(props || {})} size="medium" />
);
/** `LoadingSpinner` with a pre-bound size of `large` */
export const LargeLoadingSpinner: React.FC<LoadingSpinnerProps> = (props) => (
  <LoadingSpinner {...(props || {})} size="large" />
);

export const LargeLoadingComponent: React.FC<LoadingSpinnerProps> = (props) => {
  return (
    <div style={{ margin: 'auto' }}>
      <LargeLoadingSpinner {...(props || {})} />
    </div>
  );
};

export default LoadingSpinner;
