import React from 'react';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import styled from '@mui/system/styled';
import { useQuery, useQueryClient } from 'react-query';
import { ResourceIdentifier } from '../../../models/Common/types';
import { contentMarginGridUnits } from '../../../common/layout';
import { ReactJsonViewWrapper } from '../../common/ReactJsonView';
import { makeTaskTemplateQuery } from '../../../queries/taskQueries';
import { WaitForQuery } from '../../common/WaitForQuery';
import EnvVarsTable from './EnvVarsTable';
import t, { patternKey } from '../strings';
import { entityStrings } from '../constants';
import { Row } from '../Row';
import { DataError } from '../../Errors/DataError';

const EntityVersionDetailsContainer = styled('div')(({ theme }) => ({
  '.header': {
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(contentMarginGridUnits),
  },

  '.table': {
    marginLeft: theme.spacing(contentMarginGridUnits),
    display: 'flex',
    flexDirection: 'column',
  },
}));

export interface EntityExecutionsProps {
  id: ResourceIdentifier;
}

/** The tab/page content for viewing a workflow's executions */
export const EntityVersionDetails: React.FC<EntityExecutionsProps> = ({ id }) => {
  const queryClient = useQueryClient();
  // NOTE: need to be generic for supporting other type like workflow, etc.
  const templateState = useQuery({ ...makeTaskTemplateQuery(queryClient, id as any) });

  return (
    <EntityVersionDetailsContainer>
      <Typography className="header" variant="h3">
        {t(patternKey('details', entityStrings[id.resourceType]))}
      </Typography>
      <Divider />
      <WaitForQuery query={templateState} errorComponent={DataError}>
        {(template) => (
          <div className="table">
            {template?.container?.image && (
              <Row title={t('imageFieldName')}>
                <Typography>{template?.container?.image}</Typography>
              </Row>
            )}
            {template?.container?.env && (
              <Row title={t('envVarsFieldName')}>
                <EnvVarsTable rows={template?.container?.env} />
              </Row>
            )}
            {template && (
              <Row title={t('commandsFieldName')}>
                <ReactJsonViewWrapper src={template} collapsed={2} />
              </Row>
            )}
          </div>
        )}
      </WaitForQuery>
    </EntityVersionDetailsContainer>
  );
};
