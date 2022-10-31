import { makeStyles, Theme } from '@material-ui/core/styles';
import { separatorColor } from '@flyteconsole/ui-atoms';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { navbarGridHeight, projectBasePath, sideNavGridWidth } from '../Utils';
import { ProjectNavigation } from './ProjectNavigation';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderRight: `1px solid ${separatorColor}`,
    display: 'flex',
    flexDirection: 'column',
    bottom: 0,
    left: 0,
    position: 'fixed',
    top: theme.spacing(navbarGridHeight),
    width: theme.spacing(sideNavGridWidth),
  },
}));

/** Renders the left-side application navigation content */
export const SideNavigation: React.FC = () => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <Route path={`${projectBasePath}/:section?`} component={ProjectNavigation} />
    </div>
  );
};
