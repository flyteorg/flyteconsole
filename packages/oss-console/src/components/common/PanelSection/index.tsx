import React from 'react';
import Grid from '@mui/material/Grid';

interface PanelSectionProps {
  children: React.ReactNode;
}

export const PanelSection = (props: PanelSectionProps) => {
  return (
    <Grid
      container
      sx={{
        padding: (theme) => theme.spacing(2, 3),
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
      direction="column"
      spacing={1}
    >
      {props.children}
    </Grid>
  );
};
