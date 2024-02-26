import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { SortDirection } from '@clients/common/types/adminEntityTypes';
import { useCommonStyles } from '../common/styles';
import { WaitForData } from '../common/WaitForData';
import { IdentifierScope, ResourceIdentifier, Variable } from '../../models/Common/types';
import { useEntityVersions } from '../hooks/Entity/useEntityVersions';
import { executionSortFields } from '../../models/Execution/constants';
import { TaskClosure } from '../../models/Task/types';
import { VariablesList } from '../Task/SimpleTaskInterface';
import { executionFilterGenerator } from './generators';
import { Row } from './Row';
import t, { patternKey } from './strings';
import { entityStrings, entitySections } from './constants';
import { useDescriptionEntityList } from '../hooks/useDescription';

const InputsAndOuputs: React.FC<{
  id: ResourceIdentifier;
}> = ({ id }) => {
  const sort = {
    key: executionSortFields.createdAt,
    direction: SortDirection.DESCENDING,
  };

  const baseFilters = executionFilterGenerator[id.resourceType](id);

  // to render the input and output,
  // need to fetch the latest version and get the input and ouptut data
  const versions = useEntityVersions({ ...id, version: '' } as IdentifierScope, {
    sort,
    filter: baseFilters,
    limit: 1,
  });

  let inputs: Record<string, Variable> | undefined;
  let outputs: Record<string, Variable> | undefined;

  if ((versions?.value?.[0]?.closure as TaskClosure)?.compiledTask?.template) {
    const template = (versions?.value?.[0]?.closure as TaskClosure)?.compiledTask?.template;
    inputs = template?.interface?.inputs?.variables;
    outputs = template?.interface?.outputs?.variables;
  }

  const [showVariables, setShowVariables] = React.useState<boolean>(false);

  return (
    <Grid container spacing={1}>
      <Grid
        item
        xs={12}
        className="pointer"
        onClick={() => setShowVariables(!showVariables)}
        onMouseDown={(e) => e.preventDefault()}
      >
        <Grid
          container
          alignContent="center"
          sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
        >
          <Grid item>
            <IconButton
              size="small"
              disableRipple
              disableTouchRipple
              title={t('collapseButton', showVariables)}
            >
              {showVariables ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h3">Inputs &amp; Outputs</Typography>
          </Grid>
        </Grid>
      </Grid>
      {showVariables && (
        <Grid item xs={12}>
          <WaitForData {...versions}>
            {inputs && (
              <Row title={t('inputsFieldName')}>
                {/* <ReactJsonViewWrapper src={inputs} shouldCollapse={(field) => !field?.name} /> */}
                <Box
                  sx={{
                    '& .typeAnnotation': {
                      color: (theme) => theme.palette.secondary.main,
                    },
                    width: '100%',
                    wordBreak: 'break-word',
                  }}
                >
                  <VariablesList variables={inputs} />
                </Box>
              </Row>
            )}
            {outputs && (
              <Row title={t('outputsFieldName')}>
                <Box
                  sx={{
                    '& .typeAnnotation': {
                      color: (theme) => theme.palette.secondary.main,
                    },
                  }}
                >
                  <VariablesList variables={outputs} />
                </Box>
              </Row>
            )}
          </WaitForData>
        </Grid>
      )}
    </Grid>
  );
};

/** Fetches and renders the description for a given Entity (LaunchPlan,Workflow,Task) ID */
export const EntityDescription: React.FC<{
  id: ResourceIdentifier;
}> = ({ id }) => {
  const commonStyles = useCommonStyles();

  const { resourceType } = id;
  const sort = {
    key: executionSortFields.createdAt,
    direction: SortDirection.DESCENDING,
  };

  const baseFilters = React.useMemo(
    () => executionFilterGenerator[resourceType](id),
    [id, resourceType],
  );

  const descriptionEntities = useDescriptionEntityList(
    { ...id, version: '' },
    {
      sort,
      filter: baseFilters,
      limit: 1,
    },
  );

  const descriptionEntity = descriptionEntities?.value?.[0];
  const hasDescription = descriptionEntity?.longDescription.value.length !== 0;
  const hasLink = !!descriptionEntity?.sourceCode?.link;
  const sections = entitySections[id.resourceType];

  return (
    <Grid container>
      <Grid item xs={12} sx={{ marginBottom: (theme) => theme.spacing(2) }}>
        <Typography variant="body2" component="span" className="description">
          <span className={commonStyles.hintText}>
            {hasDescription
              ? descriptionEntity?.longDescription?.value
              : t(patternKey('noDescription', entityStrings[id.resourceType]))}
          </span>

          {hasLink && (
            <span>
              {hasLink ? (
                <Button
                  href={descriptionEntity?.sourceCode?.link ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  variant="text"
                  color="primary"
                >
                  {descriptionEntity?.sourceCode?.link}
                </Button>
              ) : (
                t(patternKey('noGithubLink', entityStrings[id.resourceType]))
              )}
            </span>
          )}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        {sections?.descriptionInputsAndOutputs && <InputsAndOuputs id={id} />}
      </Grid>
    </Grid>
  );
};
