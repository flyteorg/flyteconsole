import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import merge from 'lodash/merge';
import Admin from '@clients/common/flyteidl/admin';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import styled from '@mui/system/styled';
import { LoadingSpinner } from '@clients/primitives/LoadingSpinner';
import { DataTable } from './DataTable';
import t from './strings';
import {
  makeProjectAttributesQuery,
  makeProjectDomainAttributesQuery,
} from '../../queries/projectQueries';
import { useConditionalQuery } from '../hooks/useConditionalQuery';
import { WaitForQuery } from './WaitForQuery';

const StyledWrapper = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(0, 2, 0, 2),
  '& .collapseButton': {
    marginTop: theme.spacing(-0.5),
  },
  '& .domainSettings': {
    padding: theme.spacing(1, 2, 1, 2),
    display: 'flex',
    justifyContent: 'space-between',
  },
  '.title': {
    marginTop: theme.spacing(1),
    paddingBottom: theme.spacing(0),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '& .subHeader': {
    margin: 0,
    paddingBottom: theme.spacing(1),
    fontSize: '16px',
    fontWeight: 600,
  },
  '& .grayText': {
    padding: theme.spacing(1, 0, 0, 0),
    color: theme.palette.common.grays[30],
  },
}));

interface DomainSettingsSectionProps {
  project: string;
  domain: string;
  /**
   * Use for testing to force the meta data section to be rendered
   */
  loadOpened?: boolean;
}

const Loader = () => (
  <Grid container sx={{ padding: (theme) => theme.spacing(2) }} data-testid="loader">
    <Grid item xs={12} justifyContent="center" alignItems="center">
      <LoadingSpinner size="small" useDelay={false} />
    </Grid>
  </Grid>
);

export const DomainSettingsSection = ({
  loadOpened = false,
  project,
  domain,
}: DomainSettingsSectionProps) => {
  const queryClient = useQueryClient();
  const [showTable, setShowTable] = useState(loadOpened);

  const projectDomainAttributesQuery = useConditionalQuery(
    { ...makeProjectDomainAttributesQuery({ project, domain }, queryClient), enabled: showTable },
    (prev) => !prev,
  );

  const projectAttributesQuery = useConditionalQuery(
    {
      ...makeProjectAttributesQuery({ project }, queryClient),
      enabled: showTable && !projectDomainAttributesQuery.isFetching,
    },
    (prev) => !prev,
  );

  return (
    <StyledWrapper container>
      <Grid
        item
        xs={12}
        className="title pointer"
        onClick={() => setShowTable(!showTable)}
        onMouseDown={(e) => e.preventDefault()}
      >
        <Grid container alignContent="center">
          <Grid item>
            <IconButton
              size="small"
              disableRipple
              disableTouchRipple
              title={t('collapseButton', showTable)}
            >
              {showTable ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h3">{t('domainSettingsTitle')}</Typography>
          </Grid>
        </Grid>
      </Grid>
      {showTable ? (
        <WaitForQuery query={projectDomainAttributesQuery} loadingComponent={Loader}>
          {(projectDomainAttributes) => (
            <WaitForQuery query={projectAttributesQuery} loadingComponent={Loader}>
              {(projectAttributes) => {
                const configData: Admin.IWorkflowExecutionConfig | undefined =
                  merge(
                    projectAttributes?.attributes?.matchingAttributes?.workflowExecutionConfig,
                    projectDomainAttributes?.attributes?.matchingAttributes
                      ?.workflowExecutionConfig,
                  ) ?? undefined;

                const role = configData?.securityContext?.runAs?.iamRole || t('noValue');
                const serviceAccount =
                  configData?.securityContext?.runAs?.k8sServiceAccount || t('noValue');
                const rawData =
                  configData?.rawOutputDataConfig?.outputLocationPrefix || t('noValue');
                const maxParallelism = configData?.maxParallelism || undefined;

                return (
                  <Grid
                    item
                    xs={12}
                    className="domainSettings"
                    data-testid="domain-meta-data-container"
                  >
                    <div>
                      <p className="subHeader">{t('securityContextHeader')}</p>
                      <div>
                        <Typography variant="body1" className="grayText">
                          {t('iamRoleHeader')}
                        </Typography>
                        <Typography variant="body2">{role}</Typography>
                      </div>
                      <div>
                        <Typography variant="body1" className="grayText">
                          {t('serviceAccountHeader')}
                        </Typography>
                        <Typography variant="body2">{serviceAccount}</Typography>
                      </div>
                    </div>
                    <div>
                      <p className="subHeader">{t('labelsHeader')}</p>
                      {configData?.labels?.values ? (
                        <DataTable data={configData?.labels.values} />
                      ) : (
                        t('noValue')
                      )}
                    </div>
                    <div>
                      <p className="subHeader">{t('annotationsHeader')}</p>
                      {configData?.annotations?.values ? (
                        <DataTable data={configData?.annotations.values} />
                      ) : (
                        t('noValue')
                      )}
                    </div>
                    <div>
                      <div>
                        <p className="subHeader">{t('rawDataHeader')}</p>
                        <Typography variant="body2">{rawData}</Typography>
                      </div>
                      <div>
                        <p className="subHeader" style={{ paddingTop: '20px' }}>
                          {t('maxParallelismHeader')}
                        </p>
                        <Typography variant="body2">{maxParallelism ?? t('noValue')}</Typography>
                      </div>
                    </div>
                  </Grid>
                );
              }}
            </WaitForQuery>
          )}
        </WaitForQuery>
      ) : (
        <></>
      )}
    </StyledWrapper>
  );
};
