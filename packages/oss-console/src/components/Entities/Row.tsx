import React, { PropsWithChildren } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import styled from '@mui/system/styled';

const RowContainer = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  flexWrap: 'nowrap',
  // Workaround for display issue in chrome
  display: '-webkit-box',
  ' display': 'box',

  '.title': {
    width: 120,
    color: theme.palette.common.grays[30],
    fontSize: '14px',
  },
}));

interface RowProps {
  title: String;
}
export const Row: React.FC<PropsWithChildren<RowProps>> = (props) => {
  return (
    <RowContainer container>
      <Grid item className="title">
        <Typography>{props.title}</Typography>
      </Grid>
      <Grid item sx={{ flexGrow: 1 }}>
        {props.children}
      </Grid>
    </RowContainer>
  );
};
