import { makeStyles, Theme } from '@material-ui/core/styles';
import classnames from 'classnames';
import { FlyteLogo, useCommonStyles, headerFontFamily } from '@flyteconsole/ui-atoms';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { FlyteNavItem, NavigationDropdown } from '../NavigationDropdown';
import { AppInfo, VersionInfo } from '../AppInfo';
import { FeatureFlag, useFeatureFlag } from '../hooks';
import { makeRoute } from '../Utils';
import { OnlyMine } from '../OnlyMine';
import { UserInformation } from '../UserInformation';


const useStyles = makeStyles((theme: Theme) => ({
  spacer: {
    flexGrow: 1,
  },
  rightNavBarItem: {
    marginLeft: theme.spacing(2),
  },
}));

interface DefaultAppBarProps {
  items: FlyteNavItem[];
  console?: string;
  versions: VersionInfo[];
  routes: {
    SelectProject: {
      path: string
    }
  }
}

/** Renders the default content for the app bar, which is the logo and help links */
export const DefaultAppBarContent = (props: DefaultAppBarProps) => {
  const { console, items, versions, routes } = props;

  const commonStyles = useCommonStyles();
  const styles = useStyles();

  const isFlagEnabled = useFeatureFlag(FeatureFlag.OnlyMine);

  const dropdownMenuItems = React.useMemo(
    () => [
      {
        title: console ?? 'Console',
        url: makeRoute('/'),
      },
      ...items,
    ],
    [],
  );

  return (
    <>
      <Link
        className={classnames(commonStyles.linkUnstyled)}
        to={routes.SelectProject.path}>
        <FlyteLogo size={32} />
      </Link>
      {items?.length > 0 ? (
        <NavigationDropdown
          config={{ headerFontFamily: headerFontFamily }}
          items={dropdownMenuItems}
        />
      ) : (
        false
      )}
      <div className={styles.spacer} />
      {isFlagEnabled && <OnlyMine />}
      <UserInformation />
      <AppInfo versions={versions} documentationUrl="https://docs.flyte.org/en/latest/" />
    </>
  );
};
