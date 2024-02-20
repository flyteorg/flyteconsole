import React, { FC, useEffect, useMemo, useState } from 'react';
import TextField from '@mui/material/TextField';
import styled from '@mui/system/styled';
import t from '../strings';
import { DatasetValue, InputProps } from '../types';
import { getLaunchInputId } from '../utils';
import { StyledCard } from './StyledCard';
import { getHelperForInput } from '../inputHelpers/getHelperForInput';

const StructuredDatasetInputContainer = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(1),
  paddingLeft: theme.spacing(1),

  '.formatInput': {
    flex: '1 1 auto',
  },
  '.metadataContainer': {
    display: 'flex',
    marginTop: theme.spacing(1),
    width: '100%',
  },
}));

/** A micro form for entering the values related to a Structured Dataset Literal */
export const StructuredDatasetInput: FC<InputProps> = (props) => {
  const { error, name, onChange, value: propValue, typeDefinition, label } = props;

  const helper = useMemo(() => getHelperForInput(typeDefinition.type), [typeDefinition]);

  const [datasetValue, setDatasetValue] = useState<DatasetValue>(
    propValue || (helper.typeDefinitionToDefaultValue(typeDefinition) as DatasetValue),
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
    <StyledCard error={error} label={label} name={name}>
      <StructuredDatasetInputContainer>
        <TextField
          id={`${inputId}-uri`}
          helperText={t('sdsUriHelperText')}
          fullWidth
          label="uri"
          onChange={(e) => handleChange({ uri: e.target.value })}
          value={datasetValue?.uri}
          variant="outlined"
        />
        <div className="metadataContainer">
          <TextField
            className="formatInput"
            id={`${inputId}-format`}
            helperText={t('sdsFormatHelperText')}
            label="format"
            onChange={(e) => handleChange({ format: e.target.value })}
            value={datasetValue?.format}
            variant="outlined"
          />
        </div>
      </StructuredDatasetInputContainer>
    </StyledCard>
  );
};
