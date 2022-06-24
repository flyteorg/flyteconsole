import { makeStyles, Theme } from '@material-ui/core/styles';
import DeviceHub from '@material-ui/icons/DeviceHub';
import classNames from 'classnames';
import { useNamedEntityListStyles } from 'components/common/SearchableNamedEntityList';
import { useCommonStyles } from 'components/common/styles';
import { separatorColor, primaryTextColor, launchPlanLabelColor } from 'components/Theme/constants';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Routes } from 'routes/routes';
import { debounce } from 'lodash';
import { Typography, FormGroup } from '@material-ui/core';
import { ResourceType } from 'models/Common/types';
import { LaunchPlanListStructureItem } from './types';
import { SearchableInput } from '../common/SearchableList';
import { useSearchableListState } from '../common/useSearchableListState';
import t, { patternKey } from '../Entities/strings';
import { entityStrings } from '../Entities/constants';

interface SearchableLaunchPlanNameItemProps {
  item: LaunchPlanListStructureItem;
}

interface SearchableLaunchPlanNameListProps {
  launchPlans: LaunchPlanListStructureItem[];
}

export const showOnHoverClass = 'showOnHover';

const useStyles = makeStyles((theme: Theme) => ({
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
    marginBottom: theme.spacing(1),
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2, 3),
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
    alignItems: 'center',
  },
  itemDescriptionRow: {
    color: '#757575',
    marginBottom: theme.spacing(2),
    width: '100%',
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
    paddingLeft: 0,
  },
}));

/**
 * Renders individual searchable launchPlan item
 * @param item
 * @returns
 */
const SearchableLaunchPlanNameItem: React.FC<SearchableLaunchPlanNameItemProps> = React.memo(
  ({ item }) => {
    const commonStyles = useCommonStyles();
    const listStyles = useNamedEntityListStyles();
    const styles = useStyles();
    const { id, description } = item;

    return (
      <Link
        className={commonStyles.linkUnstyled}
        to={Routes.LaunchPlanDetails.makeUrl(id.project, id.domain, id.name)}
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
        </div>
      </Link>
    );
  },
);

/**
 * Renders a searchable list of LaunchPlan names, with associated descriptions
 * @param launchPlans
 * @constructor
 */
export const SearchableLaunchPlanNameList: React.FC<SearchableLaunchPlanNameListProps> = ({
  launchPlans,
}) => {
  const styles = useStyles();
  const [search, setSearch] = React.useState('');
  const { results, setSearchString } = useSearchableListState({
    items: launchPlans,
    propertyGetter: ({ id }) => id.name,
  });

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchString = event.target.value;
    setSearch(searchString);
    const debouncedSearch = debounce(() => setSearchString(searchString), 1000);
    debouncedSearch();
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
          placeholder={t(patternKey('searchName', entityStrings[ResourceType.LAUNCH_PLAN]))}
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
