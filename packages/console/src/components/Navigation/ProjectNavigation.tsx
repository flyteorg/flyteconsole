import { makeStyles, Theme } from '@material-ui/core/styles';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import ChevronRight from '@material-ui/icons/ChevronRight';
import DeviceHub from '@material-ui/icons/DeviceHub';
import LinearScale from '@material-ui/icons/LinearScale';
import Dashboard from '@material-ui/icons/Dashboard';
import classnames from 'classnames';
import { useCommonStyles } from 'components/common/styles';
import { withRouteParams } from 'components/common/withRouteParams';
import { useProject, useProjects } from 'components/hooks/useProjects';
import { Project } from 'models/Project/types';
import * as React from 'react';
import { matchPath, NavLinkProps, RouteComponentProps } from 'react-router-dom';
import { history } from 'routes/history';
import { Routes } from 'routes/routes';
import { MuiLaunchPlanIcon } from '@flyteorg/ui-atoms';
import { primaryHighlightColor } from 'components/Theme/constants';
import { ProjectSelector } from './ProjectSelector';
import NavLinkWithSearch from './NavLinkWithSearch';
import { TopLevelLayoutContext } from './TopLevelLayoutState';

interface ProjectNavigationRouteParams {
  domainId?: string;
  projectId: string;
  section?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  navLinksContainer: {
    marginTop: theme.spacing(1),
  },
  navLink: {
    alignItems: 'center',
    borderLeft: '4px solid transparent',
    color: theme.palette.text.secondary,
    display: 'flex',
    height: theme.spacing(6),
    padding: `0 ${theme.spacing(2)}px`,
    '&:hover': {
      borderColor: primaryHighlightColor,
    },
  },
  navLinkActive: {
    color: theme.palette.text.primary,
    fontWeight: 600,
  },
  navLinkChevron: {
    color: theme.palette.grey[500],
    flex: '0 0 auto',
  },
  navLinkIcon: {
    marginRight: theme.spacing(2),
  },
  navLinkText: {
    flex: '1 1 auto',
  },
}));

interface ProjectRoute extends Pick<NavLinkProps, 'isActive'> {
  icon: React.ComponentType<SvgIconProps>;
  path: string;
  text: string;
}

const ProjectNavigationImpl: React.FC<ProjectNavigationRouteParams> = ({
  domainId,
  projectId,
  section,
}) => {
  const styles = useStyles();
  const commonStyles = useCommonStyles();
  const project = useProject(projectId);
  const projects = useProjects();
  const onProjectSelected = (project: Project) =>
    history.push(Routes.ProjectDetails.makeUrl(project.id, section));

  const routes: ProjectRoute[] = [
    {
      icon: Dashboard,
      isActive: (match, location) => {
        const finalMatch = match
          ? match
          : matchPath(location.pathname, {
              path: Routes.ProjectDashboard.path,
              exact: false,
            });
        return !!finalMatch;
      },
      path: Routes.ProjectDetails.sections.dashboard.makeUrl(
        project.value.id,
        domainId,
      ),
      text: 'Project Dashboard',
    },
    {
      icon: DeviceHub,
      isActive: (match, location) => {
        const finalMatch = match
          ? match
          : matchPath(location.pathname, {
              path: Routes.WorkflowDetails.path,
              exact: false,
            });
        return !!finalMatch;
      },
      path: Routes.ProjectDetails.sections.workflows.makeUrl(
        project.value.id,
        domainId,
      ),
      text: 'Workflows',
    },
    {
      icon: LinearScale,
      isActive: (match, location) => {
        const finalMatch = match
          ? match
          : matchPath(location.pathname, {
              path: Routes.TaskDetails.path,
              exact: false,
            });
        return !!finalMatch;
      },
      path: Routes.ProjectDetails.sections.tasks.makeUrl(
        project.value.id,
        domainId,
      ),
      text: 'Tasks',
    },
    {
      icon: MuiLaunchPlanIcon as any,
      isActive: (match, location) => {
        const finalMatch = match
          ? match
          : matchPath(location.pathname, {
              path: Routes.LaunchPlanDetails.path,
              exact: false,
            });
        return !!finalMatch;
      },
      path: Routes.ProjectDetails.sections.launchPlans.makeUrl(
        project.value.id,
        domainId,
      ),
      text: 'Launch Plans',
    },
  ];

  const { isSideNavOpen, openSideNav } = React.useContext(
    TopLevelLayoutContext,
  );
  React.useEffect(() => {
    if (!isSideNavOpen) {
      openSideNav();
    }
  }, [openSideNav, isSideNavOpen]);

  return (
    <>
      {project.value && projects.value && (
        <ProjectSelector
          projects={projects.value}
          selectedProject={project.value}
          onProjectSelected={onProjectSelected}
        />
      )}
      <div className={styles.navLinksContainer}>
        {Object.values(routes).map(({ isActive, path, icon: Icon, text }) => (
          <NavLinkWithSearch
            activeClassName={styles.navLinkActive}
            className={classnames(commonStyles.linkUnstyled, styles.navLink)}
            isActive={isActive}
            key={path}
            to={path}
          >
            <Icon className={styles.navLinkIcon} />
            <span className={styles.navLinkText}>{text}</span>
            <ChevronRight className={styles.navLinkChevron} />
          </NavLinkWithSearch>
        ))}
      </div>
    </>
  );
};

/** Renders the left side navigation between and within projects */
export const ProjectNavigation: React.FunctionComponent<
  RouteComponentProps<ProjectNavigationRouteParams>
> = withRouteParams<ProjectNavigationRouteParams>(ProjectNavigationImpl);
