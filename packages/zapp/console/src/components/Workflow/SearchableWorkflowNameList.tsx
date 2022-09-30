import { makeStyles, Theme } from '@material-ui/core/styles';
import DeviceHub from '@material-ui/icons/DeviceHub';
import classNames from 'classnames';
import { useNamedEntityListStyles } from 'components/common/SearchableNamedEntityList';
import { useCommonStyles } from 'components/common/styles';
import { separatorColor, primaryTextColor, workflowLabelColor } from 'components/Theme/constants';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Routes } from 'routes/routes';
import { Shimmer } from 'components/common/Shimmer';
import { debounce } from 'lodash';
import {
  IconButton,
  Typography,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Button,
  CircularProgress,
} from '@material-ui/core';
import UnarchiveOutline from '@material-ui/icons/UnarchiveOutlined';
import ArchiveOutlined from '@material-ui/icons/ArchiveOutlined';
import { useMutation } from 'react-query';
import { NamedEntityState } from 'models/enums';
import { updateWorkflowState } from 'models/Workflow/api';
import { useSnackbar } from 'notistack';
import { padExecutionPaths, padExecutions } from 'common/utils';
import { WorkflowListStructureItem } from './types';
import ProjectStatusBar from '../Project/ProjectStatusBar';
import { workflowNoInputsString } from '../Launch/LaunchForm/constants';
import { SearchableInput } from '../common/SearchableList';
import { useSearchableListState } from '../common/useSearchableListState';
import { useWorkflowInfoItem } from './useWorkflowInfoItem';
import t from '../Executions/Tables/WorkflowExecutionTable/strings';
import { isWorkflowArchived } from './utils';

interface SearchableWorkflowNameItemProps {
  item: WorkflowListStructureItem;
}

interface SearchableWorkflowNameItemActionsProps {
  item: WorkflowListStructureItem;
  setHideItem: (hide: boolean) => void;
}

interface SearchableWorkflowNameListProps {
  workflows: WorkflowListStructureItem[];
  onArchiveFilterChange: (showArchievedItems: boolean) => void;
  showArchived: boolean;
}

export const showOnHoverClass = 'showOnHover';

const useStyles = makeStyles((theme: Theme) => ({
  actionContainer: {
    display: 'flex',
    right: 0,
    top: 0,
    position: 'absolute',
    height: '100%',
  },
  archiveCheckbox: {
    whiteSpace: 'nowrap',
  },
  centeredChild: {
    alignItems: 'center',
    marginRight: 24,
  },
  confirmationButton: {
    borderRadius: 0,
    minWidth: '100px',
    minHeight: '53px',
    '&:last-child': {
      borderRadius: '0px 16px 16px 0px', // to ensure that cancel button will have rounded corners on the right side
    },
  },
  container: {
    padding: theme.spacing(2),
    paddingRight: theme.spacing(5),
  },
  filterGroup: {
    display: 'flex',
    flexWrap: 'nowrap',
    flexDirection: 'row',
    margin: theme.spacing(4, 5, 2, 2),
  },

  itemContainer: {
    marginBottom: 15,
    borderRadius: 16,
    padding: '23px 30px',
    border: `1px solid ${separatorColor}`,
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
  itemName: {
    display: 'flex',
    fontWeight: 600,
    color: primaryTextColor,
    marginBottom: 10,
  },
  itemDescriptionRow: {
    color: '#757575',
    marginBottom: 30,
    width: '100%',
  },
  itemIcon: {
    marginRight: 14,
    color: '#636379',
  },
  itemRow: {
    display: 'flex',
    marginBottom: 10,
    '&:last-child': {
      marginBottom: 0,
    },
    alignItems: 'center',
    width: '100%',
  },
  itemLabel: {
    width: 140,
    fontSize: 14,
    color: workflowLabelColor,
  },
  searchInputContainer: {
    paddingLeft: 0,
  },
  w100: {
    flex: 1,
  },
}));

const getArchiveIcon = (isArchived: boolean) =>
  isArchived ? <UnarchiveOutline /> : <ArchiveOutlined />;

const SearchableWorkflowNameItemActions: React.FC<SearchableWorkflowNameItemActionsProps> = ({
  item,
  setHideItem,
}) => {
  const styles = useStyles();
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

  const singleItemStyle = isUpdating || !showConfirmation ? styles.centeredChild : '';
  return (
    <div className={classNames(styles.actionContainer, showOnHoverClass, singleItemStyle)}>
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
            className={styles.confirmationButton}
            disableElevation
            onClick={onConfirmArchiveClick}
          >
            {t('archiveAction', isArchived)}
          </Button>
          <Button
            size="medium"
            variant="contained"
            color="inherit"
            className={styles.confirmationButton}
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

/**
 * Renders individual searchable workflow item
 * @param item
 * @returns
 */
const SearchableWorkflowNameItem: React.FC<SearchableWorkflowNameItemProps> = React.memo(
  ({ item }) => {
    const commonStyles = useCommonStyles();
    const listStyles = useNamedEntityListStyles();
    const styles = useStyles();
    const { id, description } = item;
    const { data: workflow, isLoading } = useWorkflowInfoItem(id);

    const [hideItem, setHideItem] = useState<boolean>(false);

    if (hideItem) {
      return null;
    }

    return (
      <Link
        className={commonStyles.linkUnstyled}
        to={Routes.WorkflowDetails.makeUrl(id.project, id.domain, id.name)}
      >
        <div className={classNames(listStyles.searchResult, styles.itemContainer)}>
          <div className={styles.itemName}>
            <DeviceHub className={styles.itemIcon} />
            <div>{id.name}</div>
          </div>
          {description && (
            <Typography variant="body2" className={styles.itemDescriptionRow}>
              {description}
            </Typography>
          )}
          <div className={styles.itemRow}>
            <div className={styles.itemLabel}>Last execution time</div>
            <div className={styles.w100}>
              {isLoading ? (
                <Shimmer />
              ) : workflow.latestExecutionTime ? (
                workflow.latestExecutionTime
              ) : (
                <em>No executions found</em>
              )}
            </div>
          </div>
          <div className={styles.itemRow}>
            <div className={styles.itemLabel}>Last 10 executions</div>
            {isLoading ? (
              <Shimmer />
            ) : (
              <ProjectStatusBar
                items={padExecutions(workflow.executionStatus || [])}
                paths={padExecutionPaths(workflow.executionIds || [])}
              />
            )}
          </div>
          <div className={styles.itemRow}>
            <div className={styles.itemLabel}>Inputs</div>
            <div className={styles.w100}>
              {isLoading ? <Shimmer /> : workflow.inputs ?? <em>{workflowNoInputsString}</em>}
            </div>
          </div>
          <div className={styles.itemRow}>
            <div className={styles.itemLabel}>Outputs</div>
            <div className={styles.w100}>
              {isLoading ? <Shimmer /> : workflow?.outputs ?? <em>No output data found.</em>}
            </div>
          </div>
          <SearchableWorkflowNameItemActions item={item} setHideItem={setHideItem} />
        </div>
      </Link>
    );
  },
);

/**
 * Renders a searchable list of Workflow names, with associated descriptions
 * @param workflows
 * @constructor
 */
export const SearchableWorkflowNameList: React.FC<SearchableWorkflowNameListProps> = ({
  workflows,
  onArchiveFilterChange,
  showArchived,
}) => {
  const styles = useStyles();
  const [search, setSearch] = useState('');
  const { results, setSearchString } = useSearchableListState({
    items: workflows,
    propertyGetter: ({ id }) => id.name,
  });

  useEffect(() => {
    const debouncedSearch = debounce(() => setSearchString(search), 1000);
    debouncedSearch();
  }, [search]);

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchString = event.target.value;
    setSearch(searchString);
  };

  const onClear = () => setSearch('');

  return (
    <>
      <FormGroup className={styles.filterGroup}>
        <SearchableInput
          onClear={onClear}
          onSearchChange={onSearchChange}
          variant="normal"
          value={search}
          className={styles.searchInputContainer}
          placeholder="Search Workflow Name"
        />
        <FormControlLabel
          className={styles.archiveCheckbox}
          control={
            <Checkbox
              checked={showArchived}
              onChange={(_, checked) => onArchiveFilterChange(checked)}
            />
          }
          label="Show Only Archived Workflows"
        />
      </FormGroup>
      <div className={styles.container}>
        {results.map(({ value }) => (
          <SearchableWorkflowNameItem
            item={value}
            key={`workflow-name-item-${value.id.domain}-${value.id.name}-${value.id.project}`}
          />
        ))}
      </div>
    </>
  );
};
