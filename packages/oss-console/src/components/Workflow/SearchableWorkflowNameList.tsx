/* eslint-disable no-nested-ternary */
import React, { PropsWithChildren, forwardRef, useMemo, useState } from 'react';
import styled from '@mui/system/styled';
import DeviceHub from '@mui/icons-material/DeviceHub';
import classNames from 'classnames';
import { Shimmer } from '@clients/primitives/Shimmer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import ListItemButton from '@mui/material/ListItemButton';
import UnarchiveOutline from '@mui/icons-material/UnarchiveOutlined';
import { useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import { Link } from 'react-router-dom';
import { IntersectionOptions, useInView } from 'react-intersection-observer';
import ArchiveLogo from '@clients/ui-atoms/ArchiveLogo';
import { FilterOperationName, SortDirection } from '@clients/common/types/adminEntityTypes';
import { NamedEntityState } from '../../models/enums';
import { updateWorkflowState } from '../../models/Workflow/api';
import { padExecutionPaths, padExecutions, timestampToDate } from '../../common/utils';
import { SearchableNamedEntityListProps } from '../common/SearchableNamedEntityList';
import { FilterableNamedEntityList, ItemRenderer } from '../common/FilterableNamedEntityList';
import { Routes } from '../../routes/routes';
import { useConditionalQuery } from '../hooks/useConditionalQuery';
import { makeListLaunchPlansQuery } from '../../queries/launchPlanQueries';
import { getInputsForWorkflow, getOutputsForWorkflow } from '../Launch/LaunchForm/getInputs';
import { EntityCardError } from '../common/EntityCardError';
import ProjectStatusBar from '../ListProjectEntities/ProjectStatusBar';
import {
  SearchResult,
  createHighlightedEntitySearchResult,
} from '../common/useSearchableListState';
import t from '../Executions/Tables/WorkflowExecutionTable/strings';
import { isWorkflowArchived } from './utils';
import {
  makeFilterableWorkflowExecutionsQuery,
  makeListWorkflowsQuery,
} from '../../queries/workflowQueries';
import { NamedEntity } from '../../models/Common/types';
import { executionSortFields } from '../../models/Execution/constants';
import { formatDateUTC } from '../../common/formatters';

interface SearchableWorkflowNameItemActionsProps {
  item: NamedEntity;
  setHideItem: (hide: boolean) => void;
}

interface SearchableWorkflowNameListProps {
  names: NamedEntity[];
  onArchiveFilterChange: (showArchievedItems: boolean) => void;
  showArchived: boolean;
}

export const showOnHoverClass = 'showOnHover';

const SearchableWorkflowNameListContainer = styled(Grid)(({ theme }) => ({
  '.actionContainer': {
    display: 'flex',
    right: 0,
    top: 0,
    position: 'absolute',
    height: '100%',
  },
  '.archiveCheckbox': {
    whiteSpace: 'nowrap',
  },
  '.centeredChild': {
    alignItems: 'center',
    marginRight: 24,
  },
  '.confirmationButton': {
    borderRadius: 0,
    minWidth: '100px',
    minHeight: '53px',
    '&:last-child': {
      borderRadius: '0px 16px 16px 0px', // to ensure that cancel button will have rounded corners on the right side
    },
  },
  '.container': {
    padding: theme.spacing(2),
    paddingRight: theme.spacing(5),
  },
  '.filterGroup': {
    display: 'flex',
    flexWrap: 'nowrap',
    flexDirection: 'row',
    margin: theme.spacing(4, 5, 2, 2),
  },

  '.itemContainer': {
    marginBottom: 15,
    borderRadius: 16,
    padding: '23px 30px',
    border: `1px solid ${CommonStylesConstants.separatorColor}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    position: 'relative',
    // All children using the showOnHover class will be hidden until
    // the mouse enters the container
    [`& .${showOnHoverClass}`]: {
      opacity: 0,
    },
    [`&:hover .${showOnHoverClass}`]: {
      opacity: 1,
    },
  },
  '.itemName': {
    display: 'flex',
    fontWeight: 600,
    color: CommonStylesConstants.primaryTextColor,
    marginBottom: 10,
  },
  '.itemDescriptionRow': {
    color: '#757575',
    marginBottom: 30,
    width: '100%',
  },
  '.itemIcon': {
    marginRight: 14,
    color: '#636379',
  },
  '.itemRow': {
    display: 'flex',
    marginBottom: 10,
    '&:last-child': {
      marginBottom: 0,
    },
    alignItems: 'center',
    width: '100%',
  },
  '.itemLabel': {
    color: theme.palette.common.grays[30],
  },
  '.searchInputContainer': {
    paddingLeft: 0,
  },
  '.w100': {
    flex: 1,
  },
}));

const getArchiveIcon = (isArchived: boolean) =>
  isArchived ? <UnarchiveOutline /> : <ArchiveLogo />;

const SearchableWorkflowNameItemActions: React.FC<SearchableWorkflowNameItemActionsProps> = ({
  item,
  setHideItem,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { id } = item;
  const isArchived = isWorkflowArchived(item);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const mutation = useMutation((newState: NamedEntityState) => updateWorkflowState(id, newState), {
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      enqueueSnackbar(t('archiveSuccess', !isArchived), {
        variant: 'success',
      });
      setHideItem(true);
    },
    onError: () => {
      enqueueSnackbar(`${mutation.error ?? t('archiveError', !isArchived)}`, {
        variant: 'error',
      });
    },
    onSettled: () => {
      setShowConfirmation(false);
      setIsUpdating(false);
    },
  });

  const onArchiveClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setShowConfirmation(true);
  };

  const onConfirmArchiveClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    mutation.mutate(
      isWorkflowArchived(item)
        ? NamedEntityState.NAMED_ENTITY_ACTIVE
        : NamedEntityState.NAMED_ENTITY_ARCHIVED,
    );
  };

  const onCancelClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setShowConfirmation(false);
  };

  const singleItemStyle = isUpdating || !showConfirmation ? 'centeredChild' : '';
  return (
    <div className={classNames('actionContainer', showOnHoverClass, singleItemStyle)}>
      {isUpdating ? (
        <IconButton size="small">
          <CircularProgress size={24} />
        </IconButton>
      ) : showConfirmation ? (
        <>
          <Button
            size="medium"
            variant="contained"
            color="primary"
            className="confirmationButton"
            disableElevation
            onClick={onConfirmArchiveClick}
          >
            {t('archiveAction', isArchived)}
          </Button>
          <Button
            size="medium"
            variant="contained"
            color="inherit"
            className="confirmationButton"
            disableElevation
            onClick={onCancelClick}
          >
            {t('cancelAction')}
          </Button>
        </>
      ) : (
        <IconButton size="small" title={t('archiveAction', isArchived)} onClick={onArchiveClick}>
          {getArchiveIcon(isArchived)}
        </IconButton>
      )}
    </div>
  );
};

const CardRow: React.FC<
  PropsWithChildren<{
    isError: boolean;
    ErrorComponent: React.FC;
    title: string;
    isLoading?: boolean;
  }>
> = ({ title, isLoading = false, isError, ErrorComponent, children }) => {
  return (
    <Grid container sx={{ paddingBottom: (theme) => theme.spacing(0.5) }} spacing={2}>
      <Grid
        item
        sx={{
          width: 128 + 16,
          maxWidth: 128 + 16,
        }}
      >
        <Typography className="itemLabel">{title}</Typography>
      </Grid>
      <Grid item lg={8} md={9} sm={6} xs={6}>
        {isLoading ? <Shimmer /> : isError ? <ErrorComponent /> : children}
      </Grid>
    </Grid>
  );
};

const EXECUTIONS_CONFIG = {
  limit: 10,
  sort: {
    key: executionSortFields.createdAt,
    direction: SortDirection.DESCENDING,
  },
};
const WorkflowCard = ({ item, inView }: { item: NamedEntity; inView: boolean }) => {
  const queryClient = useQueryClient();
  const workflowQuery = useConditionalQuery(
    { ...makeListWorkflowsQuery(queryClient, item.id, { limit: 1 }), enabled: inView },
    (prev) => !prev && !!inView,
  );

  const listExecutionsQuery = useConditionalQuery(
    {
      ...makeFilterableWorkflowExecutionsQuery(queryClient, item.id, {
        ...EXECUTIONS_CONFIG,
        filter: [
          {
            key: 'workflow.name',
            operation: FilterOperationName.EQ,
            value: item.id.name,
          },
        ],
      }),
      enabled: !!inView && !!item.id.name,
    },
    (prev) => !prev && !!inView,
  );

  const launchPlansQuery = useConditionalQuery(
    { ...makeListLaunchPlansQuery(queryClient, item.id, { limit: 1 }), enabled: inView },
    (prev) => !prev && !!inView,
  );

  const workflowMeta = useMemo(() => {
    const workflow = workflowQuery.data?.entities?.[0];
    const returnObj = {
      workflow,
      shortDescription: workflow?.shortDescription,
      isLoading: !workflowQuery.isFetched,
      isError: workflowQuery.isError,
      inputs: workflow?.closure?.compiledWorkflow?.primary.template?.interface?.inputs,
      outputs: workflow?.closure?.compiledWorkflow?.primary.template?.interface?.outputs,
    };
    return returnObj;
  }, [workflowQuery]);

  const executionsMeta = useMemo(() => {
    const returnObj = {
      isLoading: !listExecutionsQuery.isFetched,
      isError: listExecutionsQuery.isError,
      lastExecutionTime: undefined,
      executionStatus: undefined,
      executionIds: undefined,
    };

    const workflowExecutions = listExecutionsQuery.data?.entities;
    if (!workflowExecutions?.length) {
      return returnObj;
    }

    const createdAt = workflowExecutions.at(0)?.closure?.createdAt!;
    const lastExecutionTime = formatDateUTC(timestampToDate(createdAt));
    const executionStatus = workflowExecutions.map((execution) => execution.closure.phase);

    const executionIds = workflowExecutions.map((execution) => execution.id);
    return { ...returnObj, lastExecutionTime, executionStatus, executionIds };
  }, [listExecutionsQuery]);

  const ioMeta = useMemo(() => {
    const returnObj = {
      inputsLoading: !launchPlansQuery.isFetched || !workflowQuery.isFetched,
      outputsLoading: !launchPlansQuery.isFetched,
      inputsError: launchPlansQuery.isError || workflowQuery.isError,
      outputsError: launchPlansQuery.isError,
      inputs: undefined,
      outputs: undefined,
    };
    const workflow = workflowQuery.data?.entities?.[0];
    const launchPlan = launchPlansQuery.data?.entities?.[0];
    if (!workflow || !launchPlan) {
      return returnObj;
    }
    const parsedOutputs = getOutputsForWorkflow(launchPlan);

    const parsedInputs = getInputsForWorkflow(workflow, launchPlan, undefined)?.map(
      (input) => input.label,
    );

    return { ...returnObj, inputs: parsedInputs.join(', '), outputs: parsedOutputs.join(', ') };
  }, [workflowQuery, launchPlansQuery]);

  return (
    <>
      <CardRow
        title="Last execution time"
        isLoading={executionsMeta.isLoading}
        isError={executionsMeta.isError}
        ErrorComponent={() => (
          <EntityCardError errorMessage="Failed to load workflow executions." />
        )}
      >
        <>{executionsMeta.lastExecutionTime || <em>No executions found</em>}</>
      </CardRow>
      <CardRow
        title="Last 10 executions"
        isLoading={executionsMeta.isLoading}
        isError={executionsMeta.isError}
        ErrorComponent={() => (
          <EntityCardError errorMessage="Failed to load workflow executions." />
        )}
      >
        <ProjectStatusBar
          items={padExecutions(executionsMeta.executionStatus || [])}
          paths={padExecutionPaths(executionsMeta.executionIds || [])}
        />
      </CardRow>
      <CardRow
        title="Inputs"
        isLoading={ioMeta.inputsLoading}
        isError={ioMeta.inputsError}
        ErrorComponent={() => (
          <EntityCardError errorMessage="Failed to load workflow interface details." />
        )}
      >
        <Typography fontSize={14} variant={ioMeta.inputs?.length ? 'code' : 'inherit'}>
          {ioMeta.inputs?.length ? ioMeta.inputs : <em>No input data found.</em>}
        </Typography>
      </CardRow>
      <CardRow
        title="Outputs"
        isLoading={ioMeta.outputsLoading}
        isError={ioMeta.outputsError}
        ErrorComponent={() => (
          <EntityCardError errorMessage="Failed to load launch plan details." />
        )}
      >
        <Typography fontSize={14} variant={ioMeta.outputs?.length ? 'code' : 'inherit'}>
          {ioMeta.outputs?.length ? ioMeta.outputs.toString() : <em>No output data found.</em>}
        </Typography>
      </CardRow>
      <CardRow
        title="Description"
        isLoading={workflowMeta.isLoading}
        isError={workflowMeta.isError}
        ErrorComponent={() => <EntityCardError errorMessage="Failed to load workflow details." />}
      >
        <Typography>
          {workflowMeta.shortDescription?.length ? (
            workflowMeta.shortDescription
          ) : (
            <em>No description found.</em>
          )}
        </Typography>
      </CardRow>
    </>
  );
};

interface WorkflowNameRowProps extends SearchResult<NamedEntity> {
  isScrolling: boolean;
}

/**
 * Renders individual searchable workflow item
 * @param item
 * @returns
 */
const SearchableWorkflowNameItem: React.FC<WorkflowNameRowProps> = ({
  value: item,
  result,
  content,
  isScrolling,
}) => {
  const intersectionOptions: IntersectionOptions = {
    rootMargin: '100px 0px',
    triggerOnce: true,
  };
  const [inViewRef, inView] = useInView(intersectionOptions);

  const { id } = item;

  const [hideItem, setHideItem] = useState<boolean>(false);

  const isInView = useMemo(() => {
    return inView && !isScrolling;
  }, [inView, isScrolling]);

  const finalContent = useMemo(() => {
    return result && inView ? createHighlightedEntitySearchResult(result) : content;
  }, [result, content, inView]);

  if (hideItem) {
    return null;
  }

  return (
    <div ref={inViewRef} style={{ minHeight: '400' }}>
      <ListItemButton
        href={Routes.WorkflowDetails.makeUrl(id.project, id.domain, id.name)}
        LinkComponent={forwardRef((props, ref) => {
          return <Link to={props?.href} ref={ref} {...props} />;
        })}
        sx={{
          borderRadius: (theme) => theme.spacing(1.5),
          border: (theme) => `1px solid ${theme.palette.divider}`,
          margin: (theme) => theme.spacing(0, 2, 2, 2),
          padding: (theme) => `${theme.spacing(2)} !important`,
        }}
      >
        <Grid container>
          <Grid item xs={10}>
            <Grid container sx={{ paddingBottom: (theme) => theme.spacing(1), flexWrap: 'nowrap' }}>
              <Grid item>
                <DeviceHub className="itemIcon" />
              </Grid>
              <Grid item>
                <Typography
                  fontWeight={600}
                  sx={{
                    wordBreak: 'break-all',
                  }}
                >
                  {finalContent}
                </Typography>
              </Grid>
            </Grid>
            <WorkflowCard item={item} inView={isInView} />
          </Grid>
          <Grid item xs={2}>
            <SearchableWorkflowNameItemActions item={item} setHideItem={setHideItem} />
          </Grid>
        </Grid>
      </ListItemButton>
    </div>
  );
};

interface SearchableWorkflowNameListProps {
  names: NamedEntity[];
  onArchiveFilterChange: (showArchievedItems: boolean) => void;
  showArchived: boolean;
  loading: boolean;
}

export const SearchableWorkflowNameList: React.FC<
  Omit<SearchableNamedEntityListProps, 'renderItem'> & SearchableWorkflowNameListProps
> = (props) => {
  const { names, onArchiveFilterChange, showArchived, loading } = props;

  const renderItem: ItemRenderer = (item, isScrolling) => {
    const { key, value, content, result } = item;

    return (
      <SearchableWorkflowNameItem
        content={content}
        value={value}
        key={key}
        result={result}
        isScrolling={isScrolling}
      />
    );
  };

  return (
    <SearchableWorkflowNameListContainer container>
      <Grid item xs={12}>
        <FilterableNamedEntityList
          placeholder="Search Workflow Name"
          archiveCheckboxLabel="Show Only Archived Workflows"
          noDivider
          renderItem={renderItem}
          names={names}
          onArchiveFilterChange={onArchiveFilterChange}
          showArchived={showArchived}
          isLoading={loading}
        />
      </Grid>
    </SearchableWorkflowNameListContainer>
  );
};
