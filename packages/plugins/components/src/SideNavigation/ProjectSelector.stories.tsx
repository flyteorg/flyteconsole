import { makeStyles, Theme } from '@material-ui/core/styles';
import { storiesOf } from '@storybook/react';
import { separatorColor } from '@flyteconsole/ui-atoms';
import * as React from 'react';
import { createMockProjects } from './__mocks__/projectData';
import { ProjectSelector } from './ProjectSelector';
import { sideNavGridWidth } from '../Utils';
import { Project } from '../models';

const stories = storiesOf('Navigation', module);

const projects = createMockProjects();

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderRight: `1px solid ${separatorColor}`,
    display: 'flex',
    flexDirection: 'column',
    bottom: 0,
    left: 0,
    position: 'fixed',
    top: 0,
    width: theme.spacing(sideNavGridWidth),
  },
}));

stories.addDecorator((story) => <div className={useStyles().root}>{story()}</div>);

stories.add('ProjectSelector', () => {
  const [selectedProject, setSelectedProject] = React.useState(projects[0]);
  const onProjectSelected = (project: Project) => setSelectedProject(project);
  return (
    <ProjectSelector
      projects={projects}
      selectedProject={selectedProject}
      onProjectSelected={onProjectSelected}
    />
  );
});
