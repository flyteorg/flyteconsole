import React, { FC, useEffect, useMemo, useState } from 'react';
import { TextField } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import t from '../strings';
import { DatasetValue, InputProps } from '../types';
import { getLaunchInputId } from '../utils';
import { StyledCard } from './StyledCard';
import { getHelperForInput } from '../inputHelpers/getHelperForInput';

const useStyles = makeStyles((theme: Theme) => ({
  formatInput: {
    flex: '1 1 auto',
  },
  inputContainer: {
    marginTop: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  metadataContainer: {
    display: 'flex',
    marginTop: theme.spacing(1),
    width: '100%',
  },
}));

/** A micro form for entering the values related to a Structured Dataset Literal */
export const StructuredDatasetInput: FC<InputProps> = props => {
  const styles = useStyles();
  const {
    error,
    name,
    onChange,
    value: propValue,
    typeDefinition,
    label,
  } = props;

  const helper = useMemo(
    () => getHelperForInput(typeDefinition.type),
    [typeDefinition],
  );

  const [datasetValue, setDatasetValue] = useState<DatasetValue>(
    propValue ||
      (helper.typeDefinitionToDefaultValue(typeDefinition) as DatasetValue),
  );

  const handleChange = (input: Partial<DatasetValue>) => {
    const value = { ...datasetValue, ...input } as DatasetValue;
    setDatasetValue(value);
  };

  useEffect(() => {
    onChange(datasetValue);
  }, [datasetValue]);

  const inputId = getLaunchInputId(`${name}-dsd`);

  return (
    <StyledCard error={error} label={label}>
      <div className={styles.inputContainer}>
        <TextField
          id={`${inputId}-uri`}
          helperText={t('sdsUriHelperText')}
          fullWidth={true}
          label="uri"
          onChange={e => handleChange({ uri: e.target.value })}
          value={datasetValue?.uri}
          variant="outlined"
        />
        <div className={styles.metadataContainer}>
          <TextField
            className={styles.formatInput}
            id={`${inputId}-format`}
            helperText={t('sdsFormatHelperText')}
            label="format"
            onChange={e => handleChange({ format: e.target.value })}
            value={datasetValue?.format}
            variant="outlined"
          />
        </div>
      </div>
    </StyledCard>
  );
};
