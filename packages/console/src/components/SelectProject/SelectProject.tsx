import * as React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { SearchableList, SearchResult } from 'components/common/SearchableList';
import { useProjects } from 'components/hooks/useProjects';
import { Project } from 'models/Project/types';
import { TopLevelLayoutContext } from 'components/Navigation/TopLevelLayoutState';
import { ProjectList } from './ProjectList';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    textAlign: 'center',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: `${theme.spacing(2)} 0`,
  },
  searchContainer: {
    minWidth: theme.spacing(45),
  },
}));

const renderProjectList = (projects: SearchResult<Project>[]) => (
  <ProjectList projects={projects.map(p => p.value)} />
);

/** The view component for the landing page of the application. */
export const SelectProject: React.FC = () => {
  const styles = useStyles();
  const [projects] = useProjects();

  const { isSideNavOpen, closeSideNav } = React.useContext(
    TopLevelLayoutContext,
  );
  React.useEffect(() => {
    // Side nav is always closed on this page
    closeSideNav();
  }, [closeSideNav, isSideNavOpen]);

  return (
    <div className={styles.container}>
      <h1>Welcome to Flyte</h1>
      <Typography variant="h6">
        <p>Select a project to get started...</p>
      </Typography>
      <section className={styles.buttonContainer}>
        <div className={styles.searchContainer}>
          <SearchableList
            items={projects}
            placeholder="Search for projects by name"
            propertyGetter="name"
            renderContent={renderProjectList}
          />
        </div>
      </section>
    </div>
  );
};
