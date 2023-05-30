import { makeStyles, Theme } from '@material-ui/core/styles';
import { sideNavGridWidth } from 'common/layout';
import { separatorColor } from 'components/Theme/constants';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { projectBasePath } from 'routes/constants';
import { ProjectNavigation } from './ProjectNavigation';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    position: 'relative',
    height: '100%',
    width: theme.spacing(sideNavGridWidth),
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  fixed: {
    position: 'fixed',
    height: '100%',
    width: theme.spacing(sideNavGridWidth),
  },
  border: {
    borderRight: `1px solid ${separatorColor}`,
  },
}));

/** Renders the left-side application navigation content */
export const SideNavigation: React.FC = () => {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <div className={styles.absolute}>
        <div
          className={`left-nav-fixed-wrapper ${styles.fixed} ${styles.border}`}
        >
          <Route
            path={`${projectBasePath}/:section?`}
            component={ProjectNavigation}
          />
        </div>
      </div>
    </div>
  );
};
