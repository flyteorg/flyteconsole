import React, { HTMLAttributes } from 'react';
import styled from '@mui/system/styled';
import isNumber from 'lodash/isNumber';

interface ShimmerProps {
  height?: number;
}
const ShimmerContainer = styled('div')<ShimmerProps>(({ height }) => ({
  height: isNumber(height) ? height : 10,
  animation: '$shimmer 4s infinite linear',
  background: 'linear-gradient(to right, #eff1f3 4%, #e2e2e2 25%, #eff1f3 36%)',
  backgroundSize: '1000px 100%',
  borderRadius: 8,
  width: '100%',

  '@keyframes shimmer': {
    '0%': {
      backgroundPosition: '-1000px 0',
    },
    '100%': {
      backgroundPosition: '1000px 0',
    },
  },
}));

export const Shimmer: React.FC<ShimmerProps & HTMLAttributes<'div'>> = (props) => {
  return <ShimmerContainer data-testid="shimmer" {...(props as any)} />;
};

export default Shimmer;
