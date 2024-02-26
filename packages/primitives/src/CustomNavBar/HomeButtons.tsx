import React from 'react';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import makeStyles from '@mui/styles/makeStyles';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { FlyteLogo } from '../assets/icons/FlyteLogo';

export const HomeButtons = () => {
  const theme = useTheme();
  const styles = makeStyles(() => ({
    wordmark: {
      position: 'relative',
      paddingTop: theme.spacing(2.75),
      '& > svg': {
        height: '22px',
        transform: 'translateX(-53px)',
        marginTop: '1px',
        top: '0',
        position: 'absolute',
      },
      '& > svg > path:first-child': {
        display: 'none',
      },
    },
    flex: {
      display: 'flex',
    },
  }))();

  return (
    <>
      <Grid item textAlign="center" alignItems="center">
        <FlyteLogo size={32} hideText />
        <Box className={styles.wordmark}>
          <FlyteLogo size={32} />
        </Box>

        <Divider
          sx={{
            display: 'flex',
            width: '60px',
            margin: '0 auto',
            height: '2px',
            mx: 0,
            marginLeft: '10px',
            marginTop: theme.spacing(2.75),
            marginBottom: '15px',
            background: (theme) => theme.palette.common.primary.white,
          }}
        />
      </Grid>
    </>
  );
};

export default HomeButtons;
