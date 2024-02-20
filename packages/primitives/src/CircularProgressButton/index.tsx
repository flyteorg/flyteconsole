import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import styled from '@mui/system/styled';

const StyledCircularProgress = styled(CircularProgress)(() => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  marginTop: -12,
  marginLeft: -12,
}));

export const CircularProgressButton: React.FC<{}> = () => {
  return <StyledCircularProgress size={24} />;
};

export default CircularProgressButton;
