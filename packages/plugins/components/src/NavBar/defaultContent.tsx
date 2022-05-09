import * as React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import { IconButton } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  spacer: {
    flexGrow: 1,
  },
  rightNavBarItem: {
    marginLeft: theme.spacing(2),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
}));

/** Renders the default content for the app bar, which is the logo and help links */
export const DefaultNavBarContent: React.FC = () => {
  // const commonStyles = useCommonStyles();
  const styles = useStyles();
  return (
    <>
      <div className={styles.spacer} />
      {' NASTYA IS HERE '}
      <div className={styles.spacer} />
      <IconButton edge="start" className={styles.menuButton} color="inherit" aria-label="menu">
        <MenuIcon />
      </IconButton>
    </>
  );
};
