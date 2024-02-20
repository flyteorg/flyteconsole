import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { type SxProps, type Theme } from '@mui/material/styles';

export const LoadingSpinner = ({ style }: { style?: SxProps<Theme> }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200,
      ...style,
    }}
  >
    <CircularProgress color="primary" />
  </Box>
);

export const FloatingLoadingSpinner = ({ style }: { style?: SxProps<Theme> }) => (
  <LoadingSpinner
    style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: '6',
      opacity: '.6',
      top: 0,
      left: 0,
      backgroundColor: (theme) => ({ backgroundColor: theme.palette.common.primary.union100 }),
      ...style,
    }}
  />
);
