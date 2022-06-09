import { Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import classnames from 'classnames';
import { useCommonStyles } from 'components/common/styles';
import { WaitForData } from 'components/common/WaitForData';
import { useNamedEntity } from 'components/hooks/useNamedEntity';
import { NamedEntityMetadata, ResourceIdentifier, Variable } from 'models/Common/types';
import * as React from 'react';
import reactLoadingSkeleton from 'react-loading-skeleton';
import { ReactJsonViewWrapper } from 'components/common/ReactJsonView';
import { useEntityVersions } from 'components/hooks/Entity/useEntityVersions';
import { executionSortFields } from 'models/Execution/constants';
import { SortDirection } from 'models/AdminEntity/types';
import { TaskClosure } from 'models/Task/types';
import { executionFilterGenerator } from './generators';
import { Row } from './Row';
import t, { patternKey } from './strings';
import { entityStrings, entitySections } from './constants';

const Skeleton = reactLoadingSkeleton;

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    marginBottom: theme.spacing(1),
  },
  description: {
    marginTop: theme.spacing(1),
  },
  divider: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(1),
  },
}));

/** Fetches and renders the expected & fixed inputs for a given Entity (LaunchPlan) ID */
export const EntityInputs: React.FC<{
  id: ResourceIdentifier;
}> = ({ id }) => {
  const commonStyles = useCommonStyles();
  const styles = useStyles();
  const namedEntity = useNamedEntity(id);
  const { closure, spec } = namedEntity.value;
  const sections = entitySections[id.resourceType];

  console.log(namedEntity.value);

  return (
    <>
      <Typography className={styles.header} variant="h3">
        {t('basicInformation')}
      </Typography>
      <div className={styles.divider} />
      <Typography variant="body2" component="span" className={styles.description}></Typography>
    </>
  );
};
