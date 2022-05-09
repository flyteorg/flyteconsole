import { makeStyles, Theme } from '@material-ui/core/styles';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { FlyteLogo } from '.';

const useStyles = makeStyles((theme: Theme) => ({
  darkContainer: {
    backgroundColor: theme.palette.secondary.main,
    height: '100%',
    padding: theme.spacing(2),
    width: '100%',
  },
  lightContainer: {
    height: '100%',
    padding: theme.spacing(2),
    width: '100%',
  },
}));

const stories = storiesOf('UI Atoms/FlyteLogo', module);

stories.add('Dark', () => (
  <div className={useStyles().darkContainer}>
    <FlyteLogo background="dark" size={64} />
  </div>
));

stories.add('Light', () => (
  <div className={useStyles().lightContainer}>
    <FlyteLogo background="light" size={64} />
  </div>
));
