import * as React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { type Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import { storiesOf } from '@storybook/react';
import { ErrorBoundary } from '../ErrorBoundary';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    '& > *': {
      marginBottom: theme.spacing(2),
    },
  },
  errorContainer: {
    padding: theme.spacing(2),
  },
}));

const ThrowError = () => {
  throw new Error('This failed on purpose');
};

const stories = storiesOf('Common/ErrorBoundary', module);

stories.add('fixed', () => (
  <ErrorBoundary fixed>
    <ThrowError />
  </ErrorBoundary>
));

stories.add('block', () => {
  const styles = useStyles();
  return (
    <div className={styles.container}>
      <header>
        <Typography variant="h2">Page Title</Typography>
      </header>
      <Typography variant="body1">
        This is some page content. Below this, maybe there is a section that attempts to load some
        data and fails. We don't want the ErrorBoundary to take up the entire screen in this case.
      </Typography>
      <Paper className={styles.errorContainer} elevation={1}>
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      </Paper>
    </div>
  );
});
