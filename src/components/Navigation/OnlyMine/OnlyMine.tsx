import { Switch, Typography, FormControl, FormControlLabel } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import classnames from 'classnames';
import { FlyteLogo } from 'components/common/FlyteLogo';
import { useCommonStyles } from 'components/common/styles';
import * as React from 'react';
import { DropdownIcon } from 'components/common/Icons/DropdownIcon';
import { MultiSelectForm } from 'components/common/MultiSelectForm';
import { LocalCacheItem, useLocalCache } from 'basics/LocalCache';
import { FilterPopoverIcon } from './FilterPopoverIcon';
import { filterByDefault, defaultFilterState } from './defaultConfig';

const useStyles = makeStyles((theme: Theme) => ({
  margin: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}));

export const OnlyMine: React.FC = () => {
  const commonStyles = useCommonStyles();
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [selectedValueState, setSelectedValue] = useLocalCache(LocalCacheItem.OnlyMineSetting);
  const [toogleValue, setToggleValue] = useLocalCache(LocalCacheItem.OnlyMineToggle);

  return (
    <>
      <FilterPopoverIcon
        onClick={() => setOpen((prevOpen) => !prevOpen)}
        open={open}
        renderContent={() => (
          <MultiSelectForm
            label="onlyMine"
            listHeader="Filter By"
            onChange={(values) => {
              setToggleValue(true);
              if (values.selectAll && !selectedValueState.selectAll) {
                setSelectedValue({ ...defaultFilterState });
              } else {
                setSelectedValue(values);
              }
            }}
            values={filterByDefault}
            selectedStates={selectedValueState}
          />
        )}
      >
        <DropdownIcon onClick={() => setOpen((prevOpen) => !prevOpen)} />
      </FilterPopoverIcon>
      <Typography>Personal Mode</Typography>

      <Switch
        id="onlyMineToggle"
        className={styles.margin}
        checked={!!toogleValue}
        onChange={() => setToggleValue(!toogleValue)}
        style={{
          paddingLeft: 10,
        }}
      />
    </>
  );
};
