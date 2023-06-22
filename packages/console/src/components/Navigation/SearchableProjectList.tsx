import { Box, Fade, Grid, Tooltip, Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import classnames from 'classnames';
import { NoResults } from 'components/common/NoResults';
import { SearchableList, SearchResult } from 'components/common/SearchableList';
import { useCommonStyles } from 'components/common/styles';
import { defaultProjectDescription } from 'components/SelectProject/constants';
import { primaryHighlightColor } from 'components/Theme/constants';
import { Project } from 'models/Project/types';
import * as React from 'react';
import { Routes } from 'routes';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginBottom: theme.spacing(2),
    width: '100%',
  },
  itemName: {
    flex: '1 0 0',
    fontWeight: 'bold',
  },
  searchResult: {
    alignItems: 'center',
    borderLeft: '4px solid transparent',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    height: theme.spacing(5),
    padding: `0 ${theme.spacing(1)}px`,
    width: '100%',
    '&:hover': {
      borderColor: primaryHighlightColor,
    },
    '& mark': {
      backgroundColor: 'unset',
      color: primaryHighlightColor,
      fontWeight: 'bold',
    },
  },
}));

type ProjectSelectedCallback = (project: Project) => void;

interface SearchResultsProps {
  onProjectSelected: ProjectSelectedCallback;
  results: SearchResult<Project>[];
}
const SearchResults: React.FC<SearchResultsProps> = ({
  onProjectSelected,
  results,
}) => {
  const viewAllProjects = {
    id: Routes.SelectProject.id,
    name: 'View All Projects',
    description: 'View All Projects',
    domains: [],
  } as Project;

  const commonStyles = useCommonStyles();
  const styles = useStyles();
  return (
    <>
      <Tooltip
        TransitionComponent={Fade}
        placement="bottom-end"
        enterDelay={500}
        title={
          <Typography variant="body1">
            <div className={commonStyles.textMonospace}>
              {viewAllProjects.description}
            </div>
          </Typography>
        }
      >
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          className={styles.searchResult}
          onClick={() => onProjectSelected(viewAllProjects)}
        >
          <Grid item>
            <Typography color="primary" className={styles.itemName}>
              {viewAllProjects.name}…
            </Typography>
          </Grid>
        </Grid>
      </Tooltip>
      {!results.length ? (
        <NoResults />
      ) : (
        <ul className={commonStyles.listUnstyled}>
          <li>
            {results.map(({ content, value }) => (
              <Tooltip
                TransitionComponent={Fade}
                key={value.id}
                placement="bottom-end"
                enterDelay={500}
                title={
                  <Typography variant="body1">
                    <div className={commonStyles.textMonospace}>{value.id}</div>
                    <div>
                      <em>{value.description || defaultProjectDescription}</em>
                    </div>
                  </Typography>
                }
              >
                <div
                  className={styles.searchResult}
                  onClick={onProjectSelected.bind(null, value)}
                >
                  <div
                    className={classnames(
                      styles.itemName,
                      commonStyles.textWrapped,
                    )}
                  >
                    <Grid
                      container
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item>
                        <Box>{content}</Box>
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </Tooltip>
            ))}
          </li>
        </ul>
      )}
    </>
  );
};

export interface SearchableProjectListProps {
  onProjectSelected: ProjectSelectedCallback;
  projects: Project[];
}
/** Given a list of Projects, renders a searchable list of items which
 * navigate to the details page for the project on click
 */
export const SearchableProjectList: React.FC<SearchableProjectListProps> = ({
  onProjectSelected,
  projects,
}) => {
  const styles = useStyles();

  const renderItems = (results: SearchResult<Project>[]) => (
    <SearchResults onProjectSelected={onProjectSelected} results={results} />
  );

  return (
    <div className={styles.container}>
      <SearchableList
        items={projects}
        placeholder="Filter Projects"
        propertyGetter="name"
        renderContent={renderItems}
        variant="minimal"
      />
    </div>
  );
};
