import * as React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { MenuItem, Select, SelectProps, StyledComponentProps } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { getBasePathName, makeRoute } from '@flyteconsole/components';
import classNames from 'classnames';
import { FlyteNavItem } from './types';

const DEFAULT_SELECT_LABELID = 'demo-controlled-open-select-label';
const DEFAULT_SELECT_ID = 'demo-controlled-open-select';

export type Style = {
  headerFontFamily?: string;
};

const useStyles = makeStyles<Theme, Style>((theme: Theme) => ({
  selectStyling: {
    minWidth: '120px',
    margin: theme.spacing(0, 2),
    color: 'inherit',
    '&:hover': {
      color: 'inherit',
    },
    '&:before, &:after, &:not(.Mui-disabled):hover::before': {
      border: 'none',
    },
  },
  colorInherit: {
    color: 'inherit',
    fontFamily: ({ headerFontFamily }) => headerFontFamily,
    fontWeight: 600,
    lineHeight: 1.75,
  },
}));

export type MenuItemProps = typeof MenuItem;

export interface Config extends StyledComponentProps {
  headerFontFamily: string;
  Select?: Omit<SelectProps, 'open' | 'onClose' | 'onOpen' | 'value'>;
  MenuProps?: Pick<SelectProps, 'MenuProps'>;
  DefaultMenuItem?: MenuItemProps;
}

export interface NavigationDropdownProps {
  baseUrl: string;
  items: FlyteNavItem[]; // all other navigation items
  config: Config;
}

/** Renders the default content for the app bar, which is the logo and help links */
export const NavigationDropdown = (props: NavigationDropdownProps) => {
  const { baseUrl, items: menuItems, config } = props;

  const basePathName = React.useMemo(() => getBasePathName(), []);
  const selectedMenuItem = menuItems.find((menuItem) => menuItem.url === basePathName);

  const [selectedPage, setSelectedPage] = React.useState<string>(
    selectedMenuItem?.title || menuItems[0].title,
  );
  const [open, setOpen] = React.useState(false);

  const history = useHistory();
  const styles = useStyles({ headerFontFamily: config?.headerFontFamily });

  const handleItemSelection = (item: FlyteNavItem) => {
    setSelectedPage(item.title);

    if (item.url.startsWith('+')) {
      // local navigation with BASE_URL addition
      history.push(makeRoute(baseUrl, item.url.slice(1)));
    } else {
      // treated as external navigation
      window.location.assign(item.url);
    }
  };

  return (
    <Select
      labelId={DEFAULT_SELECT_LABELID}
      id={DEFAULT_SELECT_ID}
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      value={selectedPage}
      className={classNames(styles.selectStyling, config?.Select?.className)}
      classes={{
        // update color of text and icon
        root: styles.colorInherit,
        icon: styles.colorInherit,
      }}
      MenuProps={{
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'left',
        },
        transformOrigin: {
          vertical: 'top',
          horizontal: 'left',
        },
        getContentAnchorEl: null,
      }}
    >
      {menuItems.map((item) => (
        <MenuItem key={item.title} value={item.title} onClick={() => handleItemSelection(item)}>
          {item.title}
        </MenuItem>
      ))}
    </Select>
  );
};
