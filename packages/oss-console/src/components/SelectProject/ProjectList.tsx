import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import styled from '@mui/system/styled';
import { Link } from 'react-router-dom';
import {
  LocalStorageProjectDomain,
  LOCAL_PROJECT_DOMAIN,
  setLocalStore,
} from '../common/LocalStoreDefaults';
import { Project } from '../../models/Project/types';
import { Routes } from '../../routes/routes';
import {
  SearchResult,
  createHighlightedEntitySearchResult,
} from '../common/useSearchableListState';
import { defaultProjectDescription } from './constants';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxWidth: '1440px',
  margin: theme.spacing(0, 'auto'),
  // allow the page scrollbar to take over
  overflowX: 'initial',

  '& .ellipsis': {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  '& .breakword': {
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    color: `${theme.palette.info.main} !important`,
  },
  '& .environments': {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1.5),
    justifyContent: 'space-between',

    [theme.breakpoints.down(1040)]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },
  '& .MuiTableCell-head': {
    color: theme.palette.info.main,
    padding: theme.spacing(0.5, 2),
    borderTop: `1px solid ${theme.palette.grey[300]}`,
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
    textTransform: 'uppercase',
  },
  '& .MuiTableCell-head:first-of-type': {
    minWidth: 0,
    maxWidth: '280px',
    width: '280px',
    flexGrow: 1,
  },
  '& .MuiTableCell-head:nth-of-type(2)': {
    width: '670px',
    maxWidth: '670px',
    flexGrow: 3,
  },
  '& .MuiTableCell-head:nth-of-type(3)': {
    flexGrow: 2,
    width: '460px',
    maxWidth: '460px',
  },
  '& .MuiTableRow-root:last-of-type > .MuiTableCell-body': {
    border: 0,
  },
}));

interface ProjectListProps {
  projects: SearchResult<Project>[];
}

const defaultRowsPerPage = 25;
const rowsPerPageOptions = [25, 50, 100];

/** Displays the available Projects and domains as a list of cards */
export const ProjectList: React.FC<ProjectListProps> = (props) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const selectProject = useCallback((domainId: string, projectId: string) => {
    /**
     * The last project/domain selected by a user is saved here and used by
     * ApplicationRouter to bypass the project select UX when reopening the
     * application if this value
     * exists
     */
    const projectDomain: LocalStorageProjectDomain = {
      domain: domainId,
      project: projectId,
    };
    setLocalStore(LOCAL_PROJECT_DOMAIN, projectDomain);
  }, []);

  const paginatedProjects = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return props.projects.slice(startIndex, startIndex + rowsPerPage);
  }, [page, props.projects, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [props.projects]);

  const onPageChange = (_event: unknown, nextPage: number) => {
    setPage(nextPage);
  };

  const onRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  return (
    <StyledTableContainer>
      <Table aria-label="projects table">
        <TableHead>
          <TableRow>
            <TableCell>Project Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Domains</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedProjects.map(({ value: project, result, content }) => (
            <TableRow key={project.id}>
              <TableCell scope="row">
                <Typography variant="h5" className="ellipsis" data-cy="project-name">
                  {result ? createHighlightedEntitySearchResult(result) : content}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" className="breakword" data-cy="project-description">
                  {project.description || defaultProjectDescription}
                </Typography>
              </TableCell>
              <TableCell>
                <Box className="environments" sx={{ marginLeft: -1 }}>
                  {project?.domains?.map?.(({ id: domainId, name }) => (
                    <Button
                      key={`${project.id}_${domainId}`}
                      data-cy="project-env"
                      variant="text"
                      color="primary"
                      size="small"
                      LinkComponent={forwardRef((props, ref) => (
                        <Link to={props.href} ref={ref} {...props} />
                      ))}
                      onClick={() => selectProject(domainId, project.id)}
                      href={Routes.ProjectDetails.sections.dashboard.makeUrl(project.id, domainId)}
                    >
                      {name}
                    </Button>
                  )) || null}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={props.projects.length}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={rowsPerPageOptions}
      />
    </StyledTableContainer>
  );
};
