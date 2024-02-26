import React, { useMemo } from 'react';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import styled from '@mui/system/styled';
import CheckIcon from '@mui/icons-material/Check';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { FilterOperationName } from '@clients/common/types/adminEntityTypes';
import { useLaunchPlans } from '../hooks/useLaunchPlans';
import { formatType, getInputDefintionForLiteralType } from '../Launch/LaunchForm/utils';
import { ResourceIdentifier } from '../../models/Common/types';
import { LaunchPlanClosure, LaunchPlanSpec } from '../../models/Launch/types';
import t from './strings';
import { transformLiterals } from '../Literals/helpers';

const coerceDefaultValue = (value: string | object | undefined): string | undefined => {
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value;
};

const EntityInputsContainer = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  '& .MuiTableHead-root .MuiTableCell-root': {
    borderTop: 'none',
  },
  '& .MuiTableCell-root:first-of-type': {
    paddingLeft: 0,
  },
  '& .configs': {
    listStyleType: 'none',
    paddingInlineStart: 0,
  },
  '& .config': {
    display: 'flex',
  },
  '& .configName': {
    color: theme.palette.grey[400],
    marginRight: theme.spacing(2),
    minWidth: '95px',
  },
  '& .configValue': {
    color: '#333',
    fontSize: '14px',
  },
  '& .noInputs': {
    color: theme.palette.grey[400],
  },
}));

interface Input {
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}

/** Fetches and renders the expected & fixed inputs for a given Entity (LaunchPlan) ID */
export const EntityInputs: React.FC<{
  id: ResourceIdentifier;
}> = ({ id }) => {
  const launchPlanState = useLaunchPlans(
    { project: id.project, domain: id.domain },
    {
      limit: 1,
      filter: [
        {
          key: 'launch_plan.name',
          operation: FilterOperationName.EQ,
          value: id.name,
        },
      ],
    },
  );

  const closure = launchPlanState?.value?.length
    ? launchPlanState.value[0].closure
    : ({} as LaunchPlanClosure);

  const spec = launchPlanState?.value?.length
    ? launchPlanState.value[0].spec
    : ({} as LaunchPlanSpec);

  const expectedInputs = useMemo<Input[]>(() => {
    const results: Input[] = [];
    Object.keys(closure?.expectedInputs?.parameters ?? {}).forEach((name) => {
      const parameter = closure?.expectedInputs.parameters[name];
      if (parameter?.var?.type) {
        const typeDefinition = getInputDefintionForLiteralType(parameter.var.type);
        results.push({
          name,
          type: formatType(typeDefinition),
          required: !!parameter.required,
          defaultValue: parameter.default?.value,
        });
      }
    });
    return results;
  }, [closure]);

  const fixedInputs = useMemo<Input[]>(() => {
    const inputsMap = transformLiterals(spec?.fixedInputs?.literals ?? {});
    return Object.keys(inputsMap).map((name) => ({
      name,
      defaultValue: inputsMap[name],
    }));
  }, [spec]);

  const [showChart, setShowChart] = React.useState(true);

  return (
    <EntityInputsContainer container spacing={2}>
      <Grid item xs={12} onClick={() => setShowChart(!showChart)} className="pointer">
        <Grid container alignContent="center">
          <Grid item>
            <IconButton
              size="small"
              disableRipple
              disableTouchRipple
              title={t('collapseButton', showChart)}
            >
              {showChart ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h3">{t('launchPlanLatest')}</Typography>
          </Grid>
        </Grid>
        <Divider />
      </Grid>
      {showChart && (
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} lg={6}>
              <Typography className="header" variant="h4" marginBottom={1}>
                {t('expectedInputs')}
              </Typography>
              {expectedInputs.length ? (
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('inputsName')}</TableCell>
                        <TableCell>{t('inputsType')}</TableCell>
                        <TableCell align="center">{t('inputsRequired')}</TableCell>
                        <TableCell>{t('inputsDefault')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expectedInputs.map(({ name, type, required, defaultValue }) => (
                        <TableRow key={name}>
                          <TableCell>{name}</TableCell>
                          <TableCell>{type}</TableCell>
                          <TableCell align="center">
                            {required ? <CheckIcon fontSize="small" /> : ''}
                          </TableCell>
                          <TableCell>{coerceDefaultValue(defaultValue) || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <p className="noInputs">{t('noExpectedInputs')}</p>
              )}
            </Grid>
            <Grid item xs={12} lg={6}>
              <Typography className="header" variant="h4" marginBottom={1}>
                {t('fixedInputs')}
              </Typography>
              {fixedInputs.length ? (
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('inputsName')}</TableCell>
                        <TableCell>{t('inputsDefault')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fixedInputs.map(({ name, defaultValue }) => (
                        <TableRow key={name}>
                          <TableCell>{name}</TableCell>
                          <TableCell>{coerceDefaultValue(defaultValue) || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <p className="noInputs">{t('noFixedInputs')}</p>
              )}
            </Grid>
          </Grid>
        </Grid>
      )}
    </EntityInputsContainer>
  );
};
