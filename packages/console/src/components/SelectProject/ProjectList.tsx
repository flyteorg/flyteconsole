import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { ButtonLink } from 'components/common/ButtonLink';
import {
  LocalStorageProjectDomain,
  LOCAL_PROJECT_DOMAIN,
  setLocalStore,
} from 'components/common/LocalStoreDefaults';
import { useCommonStyles } from 'components/common/styles';
import { Project } from 'models/Project/types';
import * as React from 'react';
import { Routes } from 'routes/routes';
import { defaultProjectDescription } from './constants';

const useStyles = makeStyles((theme: Theme) => ({
  projectCard: {
    textAlign: 'left',
    marginBottom: theme.spacing(2),
    minWidth: theme.spacing(36),
    maxWidth: theme.spacing(48),
    '&:first-of-type': {
      marginTop: theme.spacing(1),
    },
  },
  projectTitle: {
    paddingBottom: 0,
  },
}));

interface ProjectListProps {
  projects: Project[];
}

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const styles = useStyles();
  const commonStyles = useCommonStyles();
  const description = project.description
    ? project.description
    : defaultProjectDescription;
  return (
    <Card className={styles.projectCard} elevation={1}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom={true}>
          {project.name}
        </Typography>
        <Typography
          className={commonStyles.textWrapped}
          variant="body2"
          color="textSecondary"
          component="p"
        >
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        {project.domains.map(({ id: domainId, name }) => (
          <Button
            color="primary"
            key={domainId}
            component={ButtonLink}
            onClick={() => {
              /**
               * The last project/domain selected by a user is saved here and used by
               * ApplicationRouter to bypass the project select UX when reopening the
               * application if this value
               * exists
               */
              const projectDomain: LocalStorageProjectDomain = {
                domain: domainId,
                project: project.name,
              };
              setLocalStore(LOCAL_PROJECT_DOMAIN, projectDomain);
            }}
            to={Routes.ProjectDetails.sections.dashboard.makeUrl(
              project.id,
              domainId,
            )}
          >
            {name}
          </Button>
        ))}
      </CardActions>
    </Card>
  );
};

/** Displays the available Projects and domains as a list of cards */
export const ProjectList: React.FC<ProjectListProps> = props => {
  const commonStyles = useCommonStyles();
  return (
    <ul className={commonStyles.listUnstyled}>
      {props.projects.map(project => (
        <li key={project.id}>
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
};
