import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import CheckIcon from '@material-ui/icons/Check';
import { useLaunchPlans } from 'components/hooks/useLaunchPlans';
import { formatType, getInputDefintionForLiteralType } from 'components/Launch/LaunchForm/utils';
import { FilterOperationName } from 'models/AdminEntity/types';
import { ResourceIdentifier } from 'models/Common/types';
import { LaunchPlanClosure, LaunchPlanSpec } from 'models/Launch/types';
import * as React from 'react';
import t from './strings';
import { transformLiterals } from '../Literals/helpers';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    marginBottom: theme.spacing(1),
  },
  divider: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(1),
  },
  inputsContainer: {
    display: 'flex',
  },
  expectedInputsContainer: {
    flexGrow: 3,
  },
  fixedInputsContainer: {
    flexGrow: 2,
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
  const styles = useStyles();

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

  const expectedInputs = React.useMemo<Input[]>(() => {
    const results = [] as Input[];
    Object.keys(closure?.expectedInputs?.parameters || {}).forEach((name) => {
      const parameter = closure?.expectedInputs.parameters[name];
      if (parameter?.var?.type) {
        const typeDefinition = getInputDefintionForLiteralType(parameter?.var?.type);
        results.push({
          name,
          type: formatType(typeDefinition),
          required: !!parameter?.required,
          defaultValue: parameter?.default?.value,
        });
      }
    });
    return results;
  }, [closure]);

  const fixedInputs = React.useMemo<Input[]>(() => {
    const inputsMap = transformLiterals(spec?.fixedInputs?.literals || {});
    return Object.keys(inputsMap).map((name) => ({ name, defaultValue: inputsMap[name] }));
  }, [spec]);

  return (
    <>
      <Typography className={styles.header} variant="h3">
        {t('launchPlanLatest')}
      </Typography>
      <div className={styles.divider} />
      <div className={styles.inputsContainer}>
        <div className={styles.expectedInputsContainer}>
          <Typography className={styles.header} variant="h4">
            {t('expectedInputs')}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('inputsName')}</TableCell>
                  <TableCell>{t('inputsType')}</TableCell>
                  <TableCell>{t('inputsRequired')}</TableCell>
                  <TableCell>{t('inputsDefault')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expectedInputs.map(({ name, type, required, defaultValue }) => (
                  <TableRow key={name}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{type}</TableCell>
                    <TableCell>{required ? <CheckIcon /> : ''}</TableCell>
                    <TableCell>{defaultValue || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <div className={styles.fixedInputsContainer}>
          <Typography className={styles.header} variant="h4">
            {t('fixedInputs')}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
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
                    <TableCell>{defaultValue || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </>
  );
};
