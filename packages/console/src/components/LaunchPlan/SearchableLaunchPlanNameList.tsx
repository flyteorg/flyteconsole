import { makeStyles, Theme } from '@material-ui/core/styles';
import classNames from 'classnames';
import { useNamedEntityListStyles } from 'components/common/SearchableNamedEntityList';
import { useCommonStyles } from 'components/common/styles';
import {
  separatorColor,
  primaryTextColor,
  launchPlanLabelColor,
} from 'components/Theme/constants';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Routes } from 'routes/routes';
import { debounce } from 'lodash';
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  IconButton,
} from '@material-ui/core';
import { ResourceType } from 'models/Common/types';
import { MuiLaunchPlanIcon } from '@flyteorg/ui-atoms';
import UnarchiveOutlined from '@material-ui/icons/UnarchiveOutlined';
import ArchiveOutlined from '@material-ui/icons/ArchiveOutlined';
import { useSnackbar } from 'notistack';
import { useMutation } from 'react-query';
import { NamedEntityState } from 'models/enums';
import { updateLaunchPlanState } from 'models/Launch/api';
import { LaunchPlanListStructureItem } from './types';
import { SearchableInput } from '../common/SearchableList';
import { useSearchableListState } from '../common/useSearchableListState';
import t, { patternKey } from '../Entities/strings';
import { entityStrings } from '../Entities/constants';
import { isLaunchPlanArchived } from './utils';

interface SearchableLaunchPlanNameItemProps {
  item: LaunchPlanListStructureItem;
}

interface SearchableLaunchPlanNameItemActionsProps {
  item: LaunchPlanListStructureItem;
  setHideItem: (hide: boolean) => void;
}

interface SearchableLaunchPlanNameListProps {
  launchPlans: LaunchPlanListStructureItem[];
  onArchiveFilterChange: (showArchievedItems: boolean) => void;
  showArchived: boolean;
}

export const showOnHoverClass = 'showOnHover';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing(2),
    paddingRight: theme.spacing(5),
  },
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
  filterGroup: {
    display: 'flex',
    flexWrap: 'nowrap',
    flexDirection: 'row',
    margin: theme.spacing(4, 5, 0, 2),
  },
  itemContainer: {
    padding: theme.spacing(3, 3),
    border: 'none',
    borderTop: `1px solid ${separatorColor}`,
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
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: theme.spacing(2),
    color: '#636379',
  },
  itemRow: {
    display: 'flex',
    marginBottom: theme.spacing(1),
    '&:last-child': {
      marginBottom: 0,
    },
    alignItems: 'center',
    width: '100%',
  },
  itemLabel: {
    width: 140,
    fontSize: 14,
    color: launchPlanLabelColor,
  },
  searchInputContainer: {
    padding: 0,
    paddingRight: theme.spacing(3),
  },
}));

const getArchiveIcon = (isArchived: boolean) =>
  isArchived ? <UnarchiveOutlined /> : <ArchiveOutlined />;

const SearchableLaunchPlanNameItemActions: React.FC<
  SearchableLaunchPlanNameItemActionsProps
> = ({ item, setHideItem }) => {
  const styles = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = item;
  const isArchived = isLaunchPlanArchived(item);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const mutation = useMutation(
    (newState: NamedEntityState) => updateLaunchPlanState(id, newState),
    {
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
    },
  );

  const onArchiveClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setShowConfirmation(true);
  };

  const onConfirmArchiveClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    mutation.mutate(
      isLaunchPlanArchived(item)
        ? NamedEntityState.NAMED_ENTITY_ACTIVE
        : NamedEntityState.NAMED_ENTITY_ARCHIVED,
    );
  };

  const onCancelClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setShowConfirmation(false);
  };

  const singleItemStyle =
    isUpdating || !showConfirmation ? styles.centeredChild : '';
  return (
    <div
      className={classNames(
        styles.actionContainer,
        showOnHoverClass,
        singleItemStyle,
      )}
    >
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
        <IconButton
          size="small"
          title={t('archiveAction', isArchived)}
          onClick={onArchiveClick}
        >
          {getArchiveIcon(isArchived)}
        </IconButton>
      )}
    </div>
  );
};

/**
 * Renders individual searchable launchPlan item
 * @param item
 * @returns
 */
const SearchableLaunchPlanNameItem: React.FC<SearchableLaunchPlanNameItemProps> =
  React.memo(({ item }) => {
    const commonStyles = useCommonStyles();
    const listStyles = useNamedEntityListStyles();
    const styles = useStyles();
    const { id } = item;

    const [hideItem, setHideItem] = useState<boolean>(false);

    if (hideItem) {
      return null;
    }

    return (
      <Link
        className={commonStyles.linkUnstyled}
        to={Routes.LaunchPlanDetails.makeUrl(id.project, id.domain, id.name)}
      >
        <div
          className={classNames(listStyles.searchResult, styles.itemContainer)}
        >
          <div className={styles.itemName}>
            <MuiLaunchPlanIcon width={16} height={16} />
            <div>{id.name}</div>
          </div>
          <SearchableLaunchPlanNameItemActions
            item={item}
            setHideItem={setHideItem}
          />
        </div>
      </Link>
    );
  });

/**
 * Renders a searchable list of LaunchPlan names, with associated descriptions
 * @param launchPlans
 * @constructor
 */
export const SearchableLaunchPlanNameList: React.FC<
  SearchableLaunchPlanNameListProps
> = ({ launchPlans, onArchiveFilterChange, showArchived }) => {
  const styles = useStyles();
  const [search, setSearch] = useState('');
  const { results, setSearchString } = useSearchableListState({
    items: launchPlans,
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
          placeholder={t(
            patternKey('searchName', entityStrings[ResourceType.LAUNCH_PLAN]),
          )}
        />
        <FormControlLabel
          className={styles.archiveCheckbox}
          control={
            <Checkbox
              checked={showArchived}
              onChange={(_, checked) => onArchiveFilterChange(checked)}
            />
          }
          label="Include Archived LaunchPlans"
        />
      </FormGroup>
      <div className={styles.container}>
        {results.map(({ value }) => (
          <SearchableLaunchPlanNameItem
            item={value}
            key={`launch-plan-name-item-${value.id.domain}-${value.id.name}-${value.id.project}`}
          />
        ))}
      </div>
    </>
  );
};
