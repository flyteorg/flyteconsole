import { Switch, Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import * as React from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import { smallIconSize } from '@flyteconsole/ui-atoms';
import { FilterPopoverIcon } from './FilterPopoverIcon';
import t from './strings';
import {
  defaultSelectedValues,
  filterByDefault,
  LocalCacheItem,
  OnlyMyFilter,
  useLocalCache,
} from '../LocalCache';
import { MultiSelectForm } from '../MultiSelectForm';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
    alignItems: 'center',
  },
  margin: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  menuIcon: {
    fontSize: smallIconSize,
  },
}));

const checkIsSelectedAll = (mapObject: Record<string, boolean>) => {
  return Object.keys(mapObject).every((key) => {
    if (key !== OnlyMyFilter.SelectAll) {
      return mapObject[key];
    }
    return true;
  });
};

const checkIsUnSelectedAll = (mapObject: Record<string, boolean>) => {
  return Object.keys(mapObject).every((key) => {
    return !mapObject[key];
  });
};

export const OnlyMine: React.FC = () => {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [selectedValues, setSelectedValue] = useLocalCache(LocalCacheItem.OnlyMineSetting);
  const [toggleValue, setToggleValue] = useLocalCache(LocalCacheItem.OnlyMineToggle);

  const togglePopup = () => setOpen((prevOpen) => !prevOpen);
  const toggleSwitch = () => setToggleValue(!toggleValue);

  const formOnChange = (newSelectedValues: Record<string, boolean>) => {
    setToggleValue(true);
    // if user clicks the select all, marked all check boxes
    if (newSelectedValues[OnlyMyFilter.SelectAll] && !selectedValues[OnlyMyFilter.SelectAll]) {
      setSelectedValue({ ...defaultSelectedValues });
    }
    // after user clicking, if all the value is selected, makred all check boxes
    else if (checkIsSelectedAll(newSelectedValues)) {
      setSelectedValue({ ...defaultSelectedValues });
    }
    // else we should unmarked select all
    else {
      setSelectedValue({ ...newSelectedValues, [OnlyMyFilter.SelectAll]: false });
    }
  };

  const divRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <FilterPopoverIcon
        onClick={togglePopup}
        open={open}
        refObject={divRef}
        renderContent={() => (
          <MultiSelectForm
            active={!checkIsUnSelectedAll(selectedValues)}
            label={t('onlyMine_popup_label')}
            listHeader={t('onlyMine_popup_header')}
            onChange={formOnChange}
            onReset={() => {}}
            values={filterByDefault}
            selectedStates={selectedValues}
          />
        )}
      >
        <div className={styles.container} ref={divRef} onClick={togglePopup}>
          <MenuIcon className={styles.menuIcon} />
          <Typography>{t('onlyMine_text')}</Typography>
        </div>
      </FilterPopoverIcon>

      <Switch className={styles.margin} checked={!!toggleValue} onChange={toggleSwitch} />
    </>
  );
};
