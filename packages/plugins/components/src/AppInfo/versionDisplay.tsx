import * as React from 'react';
import classnames from 'classnames';
import { Link, makeStyles, Theme } from '@material-ui/core';
import { FlyteLogo } from '@flyteconsole/ui-atoms';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: '16px',
    lineHeight: '22px',
    margin: '7px 0 26px 0',
    color: '#000',
  },
  versionWrapper: {
    minWidth: theme.spacing(20),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: '0 0 6px 0',
  },
  versionName: {
    fontFamily: 'Apple SD Gothic Neo',
    fontWeight: 'normal',
    fontSize: '14px',
    lineHeight: '17px',
    color: '#636379',
    margin: '17px 0 2px 0',
  },
  versionLink: {
    color: '#1982E3',
    fontSize: '14px',
  },
}));

type VersionInfo = {
  name: string;
  version: string;
  url: string;
};

export interface VersionDisplayProps {
  versions: VersionInfo[];
  documentationUrl: string;
}

export const VersionDisplay = (props: VersionDisplayProps): JSX.Element => {
  const styles = useStyles();

  const VersionItem = (info: VersionInfo) => {
    return (
      <div className={classnames(styles.versionName, styles.versionWrapper)}>
        <span>{info.name}</span>
        <Link href={info.url} className={styles.versionLink} target="_blank">
          {info.version}
        </Link>
      </div>
    );
  };

  const versionsList = props.versions.map((info) => VersionItem(info));

  return (
    <>
      <FlyteLogo size={32} background="light" hideText={true} />
      <div className={styles.title}>Flyte Console</div>

      {versionsList}

      <div className={styles.versionName}>Documentation Link:</div>
      <Link href={props.documentationUrl} className={styles.versionLink} target="_blank">
        {props.documentationUrl}
      </Link>
    </>
  );
};
