import React from 'react';
import Typography from '@mui/material/Typography';
import styled from '@mui/system/styled';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useParams } from 'react-router';
import PageMeta from '@clients/primitives/PageMeta';
import { Project } from '../../models/Project/types';
import { useProjects } from '../hooks/useProjects';
import { SearchableInput, SearchResult } from '../common/SearchableList';
import { useSearchableListState } from '../common/useSearchableListState';
import { ProjectList } from './ProjectList';

const StyledContainer = styled('div')(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4),
}));

const renderProjectList = (projects: SearchResult<Project>[]) => (
  <Box pt={2} sx={{ maxWidth: '100%' }}>
    <ProjectList projects={projects} />
  </Box>
);

/** The view component for the landing page of the application. */
export const SelectProject: React.FC = () => {
  const { data: projects = [] } = useProjects();

  const { results, searchString, setSearchString } = useSearchableListState({
    items: projects,
    propertyGetter: 'name',
  });

  const onClear = () => setSearchString('');

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchString = event.target.value;
    setSearchString(searchString);
  };

  const params = useParams<{ orgId?: string }>();

  return (
    <>
      <PageMeta title="Select Project" />
      <StyledContainer>
        <Grid container>
          <Grid item xs={12}>
            <Box py={3}>
              <Box py={1}>
                <Typography variant="h1">Welcome to Flyte</Typography>
              </Box>
              <Box py={1}>
                <Typography variant="body1" fontWeight="bold">
                  Select a project to get started...
                </Typography>
              </Box>
              {!!params?.orgId && (
                <Box py={1}>
                  <Typography variant="body1" fontWeight="bold">
                    <br />
                    Organization: {params?.orgId && <>{params.orgId}</>}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
        <Grid container justifyContent="center">
          <Grid item xs={12}>
            <Grid container justifyContent="center" alignItems="center">
              <Grid item sm={8} md={6} lg={4} xl={3}>
                <SearchableInput
                  onClear={onClear}
                  onSearchChange={onSearchChange}
                  placeholder="Search for projects by name"
                  value={searchString}
                  variant="normal"
                />
              </Grid>
            </Grid>
            <Grid container justifyContent="center" alignItems="center" sx={{ display: 'block' }}>
              <Grid item xs={12} sx={{ margin: '0 auto', maxWidth: '1920px' }}>
                {renderProjectList(results)}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </StyledContainer>
    </>
  );
};

export default SelectProject;
