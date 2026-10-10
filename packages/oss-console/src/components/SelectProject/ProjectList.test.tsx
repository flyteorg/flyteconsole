import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { SearchResult } from '../common/useSearchableListState';
import { Project } from '../../models/Project/types';
import { ProjectList } from './ProjectList';

const createProject = (index: number): SearchResult<Project> => ({
  key: `project-${index}`,
  content: `Project ${index}`,
  value: {
    id: `project-${index}`,
    name: `Project ${index}`,
    description: `Description ${index}`,
    domains: [{ id: 'development', name: 'development' }],
  },
});

const renderProjectList = (projects: SearchResult<Project>[]) =>
  render(
    <ThemeProvider theme={muiTheme}>
      <MemoryRouter>
        <ProjectList projects={projects} />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('ProjectList', () => {
  it('renders one page of projects at a time', async () => {
    const user = userEvent.setup();
    const projects = Array.from({ length: 30 }, (_, index) => createProject(index + 1));

    renderProjectList(projects);

    const rows = within(screen.getByRole('table', { name: /projects table/i })).getAllByRole('row');
    expect(rows).toHaveLength(26);
    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 25')).toBeInTheDocument();
    expect(screen.queryByText('Project 26')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText(/go to next page/i));

    expect(screen.getByText('Project 26')).toBeInTheDocument();
    expect(screen.getByText('Project 30')).toBeInTheDocument();
    expect(screen.queryByText('Project 1')).not.toBeInTheDocument();
  });
});
