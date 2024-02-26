import React, { FC, useMemo } from 'react';
/* eslint-disable no-nested-ternary */
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import ListItemButton from '@mui/material/ListItemButton';
import Icon from '@mui/material/Icon';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import styled from '@mui/system/styled';
import { IntersectionOptions, useInView } from 'react-intersection-observer';
import TasksLogo from '@clients/ui-atoms/TasksLogo';
import { SearchResult } from '../common/SearchableList';
import { SearchableNamedEntityListProps } from '../common/SearchableNamedEntityList';
import { useCommonStyles } from '../common/styles';
import { NamedEntity } from '../../models/Common/types';
import { Routes } from '../../routes/routes';
import { FilterableNamedEntityList, ItemRenderer } from '../common/FilterableNamedEntityList';
import { useConditionalQuery } from '../hooks/useConditionalQuery';
import { createHighlightedEntitySearchResult } from '../common/useSearchableListState';
import { EntityCardError } from '../common/EntityCardError';
import { makeLatestTaskVersionQuery } from './useLatestTask';
import { SimpleTaskInterface } from './SimpleTaskInterface';
import { Task } from '../../models/Task/types';

export const showOnHoverClass = 'showOnHover';

const StyledFilterableNamedEntityList = styled(FilterableNamedEntityList)(() => ({
  '.container': {
    // All children using the showOnHover class will be hidden until
    // the mouse enters the container
    [`& .${showOnHoverClass}`]: {
      opacity: 0,
    },
    [`&:hover .${showOnHoverClass}`]: {
      opacity: 1,
    },
  },
}));

// eslint-disable-next-line no-use-before-define
const StyledTaskCard = styled(Grid)(({ theme }) => ({
  padding: `${theme.spacing(2)} ${theme.spacing(3)}`,

  '.taskName': {
    color: theme.palette.common.grays[80],
    fontSize: '16px',
    paddingLeft: theme.spacing(2),
  },
  '.tasks-icon': {
    color: theme.palette.common.grays[40],
    width: '20px',
  },
}));

const TaskDetails: FC<{ entity: NamedEntity; inView?: boolean }> = ({ entity, inView }) => {
  const latestTaskQuery = useConditionalQuery<Task, Error, unknown>(
    {
      ...makeLatestTaskVersionQuery(entity.id),
      // only trigger when in view
      enabled: !!inView,
      // only triger once
      staleTime: Infinity,
      cacheTime: Infinity,
    },
    (prev) => !prev && !!inView,
  );

  const taskMeta = useMemo(() => {
    const task = latestTaskQuery.data;
    const returnObj = {
      task,
      isLoading: !latestTaskQuery.isFetched,
      isError: latestTaskQuery.isError,
    };
    return returnObj;
  }, [latestTaskQuery]);

  return (
    <SimpleTaskInterface
      {...taskMeta}
      ErrorComponent={() => (
        <EntityCardError errorMessage="Failed to load task interface details." />
      )}
    />
  );
};

const intersectionOptions: IntersectionOptions = {
  rootMargin: '100px 0px',
  triggerOnce: true,
};

interface TaskNameRowProps extends SearchResult<NamedEntity> {
  isScrolling: boolean;
}

const TaskCard: React.FC<TaskNameRowProps> = ({
  content: label,
  value: entity,
  result,
  isScrolling,
}) => {
  const [inViewRef, inView] = useInView(intersectionOptions);

  const isInView = useMemo(() => {
    return inView && !isScrolling;
  }, [inView, isScrolling]);

  const finalContent = useMemo(() => {
    return isInView && result ? createHighlightedEntitySearchResult(result) : label;
  }, [result, label, isInView]);

  return (
    <StyledTaskCard container ref={inViewRef}>
      <Grid item xs={12}>
        <Grid container sx={{ paddingBottom: (theme) => theme.spacing(1), flexWrap: 'nowrap' }}>
          <Grid item>
            <Icon>
              <TasksLogo className="tasks-icon" />
            </Icon>
          </Grid>
          <Grid item>
            <Typography
              className="taskName"
              fontWeight={600}
              component="span"
              sx={{
                wordBreak: 'break-all',
              }}
            >
              {finalContent}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={10}>
        <TaskDetails entity={entity} inView={isInView} />
      </Grid>
    </StyledTaskCard>
  );
};

interface SearchableTaskNameListProps {
  names: NamedEntity[];
  onArchiveFilterChange: (showArchievedItems: boolean) => void;
  showArchived: boolean;
  loading: boolean;
}

/** Renders a searchable list of Task names, with associated metadata */
export const SearchableTaskNameList: React.FC<
  Omit<SearchableNamedEntityListProps, 'renderItem'> & SearchableTaskNameListProps
> = (props) => {
  const { names, loading, onArchiveFilterChange, showArchived } = props;
  const commonStyles = useCommonStyles();
  const renderItem: ItemRenderer = (item, isScrolling) => {
    const { key, value, content, result } = item;

    return (
      <>
        <Divider
          sx={{
            width: 'calc(100% - 32px)',
            margin: '0 auto',
          }}
        />
        <ListItemButton
          className={classnames(commonStyles.linkUnstyled, 'container')}
          key={key}
          href={Routes.TaskDetails.makeUrl(value.id.project, value.id.domain, value.id.name)}
          LinkComponent={(props) => <Link to={props?.href} {...props} />}
        >
          <TaskCard
            content={content}
            value={value}
            result={result}
            key={`task-card-${key}`}
            isScrolling={isScrolling}
          />
        </ListItemButton>
        <Divider
          sx={{
            width: 'calc(100% - 32px)',
            margin: '0 auto',
          }}
        />
      </>
    );
  };
  return (
    <StyledFilterableNamedEntityList
      placeholder="Search Task Name"
      archiveCheckboxLabel="Show Only Archived Tasks"
      noDivider
      isLoading={loading}
      names={names}
      onArchiveFilterChange={onArchiveFilterChange}
      showArchived={showArchived}
      renderItem={renderItem}
    />
  );
};
