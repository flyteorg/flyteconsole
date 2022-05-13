import { makeStyles, Theme } from '@material-ui/core/styles';
import * as React from 'react';
import { IconButton, Typography } from '@material-ui/core';
import { COLOR_SPECTRUM } from 'components/Theme/colorSpectrum';
import { DataTable } from 'components/common/DataTable';
import { Admin } from 'flyteidl';
import { isEmpty } from 'lodash';
import { LocalCacheItem, useLocalCache } from 'basics/LocalCache';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import t from './strings';

const useStyles = makeStyles((theme: Theme) => ({
  domainSettingsWrapper: {
    padding: theme.spacing(0, 2, 0, 2),
  },
  collapseButton: {
    marginTop: theme.spacing(-0.5),
  },
  domainSettings: {
    padding: theme.spacing(2, 4, 0, 4),
    display: 'flex',
    justifyContent: 'space-between',
  },
  title: {
    marginTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  subHeader: {
    margin: 0,
    paddingBottom: theme.spacing(2),
    fontSize: '16px',
    fontWeight: 600,
  },
  grayText: {
    padding: theme.spacing(1, 0, 1, 0),
    color: COLOR_SPECTRUM.gray40.color,
  },
}));

interface DomainSettingsSectionProps {
  configData?: Admin.IWorkflowExecutionConfig;
}

export const DomainSettingsSection = ({ configData }: DomainSettingsSectionProps) => {
  const styles = useStyles();
  const [showTable, setShowTable] = useLocalCache(LocalCacheItem.ShowDomainSettings);

  if (!configData || isEmpty(configData)) {
    return null;
  }

  const role = configData.securityContext?.runAs?.iamRole || t('inherited');
  const serviceAccount = configData.securityContext?.runAs?.k8sServiceAccount || t('inherited');
  const rawData = configData.rawOutputDataConfig?.outputLocationPrefix || t('inherited');
  const maxParallelism = configData.maxParallelism || undefined;

  return (
    <div className={styles.domainSettingsWrapper}>
      <Typography className={styles.title} variant="h6">
        <IconButton
          className={styles.collapseButton}
          edge="start"
          disableRipple={true}
          disableTouchRipple={true}
          onClick={() => setShowTable(!showTable)}
          onMouseDown={(e) => e.preventDefault()}
          size="small"
          title={t('collapseButton', showTable)}
        >
          {showTable ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
        {t('domainSettingsTitle')}
      </Typography>
      {showTable && (
        <div className={styles.domainSettings}>
          <div>
            <p className={styles.subHeader}>{t('securityContextHeader')}</p>
            <div>
              <Typography variant="body1" className={styles.grayText}>
                {t('iamRoleHeader')}
              </Typography>
              <Typography variant="body2">{role}</Typography>
            </div>
            <div>
              <Typography variant="body1" className={styles.grayText}>
                {t('serviceAccountHeader')}
              </Typography>
              <Typography variant="body2">{serviceAccount}</Typography>
            </div>
          </div>
          <div>
            <p className={styles.subHeader}>{t('labelsHeader')}</p>
            {configData.labels?.values ? (
              <DataTable data={configData.labels.values} />
            ) : (
              t('inherited')
            )}
          </div>
          <div>
            <p className={styles.subHeader}>{t('annotationsHeader')}</p>
            {configData.annotations?.values ? (
              <DataTable data={configData.annotations.values} />
            ) : (
              t('inherited')
            )}
          </div>
          <div>
            <div>
              <p className={styles.subHeader}>{t('rawDataHeader')}</p>
              <Typography variant="body2">{rawData}</Typography>
            </div>
            <div>
              <p className={styles.subHeader} style={{ paddingTop: '20px' }}>
                {t('maxParallelismHeader')}
              </p>
              <Typography variant="body2">{maxParallelism ?? t('inherited')}</Typography>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
