import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import styled from '@mui/system/styled';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { SortDirection } from '@clients/common/types/adminEntityTypes';
import { history } from '../../routes/history';
import { LocalCacheItem, useLocalCache } from '../../basics/LocalCache';
import { WaitForData } from '../common/WaitForData';
import { EntityVersionsTable } from '../Executions/Tables/EntityVersionsTable';
import { isLoadingState } from '../hooks/fetchMachine';
import { useEntityVersions } from '../hooks/Entity/useEntityVersions';
import { Identifier, ResourceIdentifier, ResourceType } from '../../models/Common/types';
import { executionSortFields } from '../../models/Execution/constants';
import { executionFilterGenerator, versionDetailsUrlGenerator } from './generators';
import { WorkflowVersionsTablePageSize, entityStrings } from './constants';
import t, { patternKey } from './strings';

const EntityVersionsContainer = styled('div')(() => ({
  '& .MuiTableCell-root:first-of-type': {
    paddingLeft: 0,
  },
  '.viewAll': {
    color: CommonStylesConstants.interactiveTextColor,
    cursor: 'pointer',
  },
}));

export interface EntityVersionsProps {
  id: ResourceIdentifier;
  showAll?: boolean;
}

/**
 * The tab/page content for viewing a workflow's versions.
 * @param id
 * @param showAll - shows all available entity versions
 */
export const EntityVersions: React.FC<EntityVersionsProps> = ({ id, showAll = false }) => {
  const { domain, project, resourceType, name } = id;
  const [showTable, setShowTable] = useLocalCache(LocalCacheItem.ShowWorkflowVersions);
  const sort = {
    key: executionSortFields.createdAt,
    direction: SortDirection.DESCENDING,
  };

  const baseFilters = React.useMemo(
    () => executionFilterGenerator[resourceType](id),
    [id, resourceType],
  );

  // we are getting all the versions for this id
  // so we don't want to specify which version
  const versions = useEntityVersions(
    { ...id, version: '' },
    {
      sort,
      filter: baseFilters,
      limit: showAll ? 100 : WorkflowVersionsTablePageSize,
    },
  );

  const preventDefault: React.MouseEventHandler<HTMLDivElement> = (e) => e.preventDefault();
  const handleViewAll = React.useCallback(() => {
    history.push(
      versionDetailsUrlGenerator({
        ...id,
        version: versions.value[0].id.version ?? '',
      } as Identifier),
    );
  }, [project, domain, name, versions]);

  return (
    <EntityVersionsContainer>
      {!showAll && (
        <Grid container item alignSelf="center" justifyContent="space-between">
          <Grid item xs={8}>
            <Grid
              container
              onClick={() => setShowTable(!showTable)}
              onMouseDown={preventDefault}
              className="pointer"
            >
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
              <Grid item alignSelf="center">
                <Typography variant="h3">
                  {t(patternKey('versionsTitle', entityStrings[id.resourceType]))}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item alignSelf="center" justifyItems="flex-end">
            <Box pr={2}>
              <Typography
                className="viewAll"
                variant="body2"
                color="secondary"
                onClick={handleViewAll}
              >
                {t('viewAll')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      )}
      <WaitForData {...versions}>
        {showTable || showAll ? (
          <EntityVersionsTable
            {...versions}
            isFetching={isLoadingState(versions.state)}
            versionView={showAll && resourceType !== ResourceType.LAUNCH_PLAN}
            resourceType={resourceType}
          />
        ) : (
          <Divider />
        )}
      </WaitForData>
    </EntityVersionsContainer>
  );
};
