import React, { FC, useEffect, useMemo, useState } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import styled from '@mui/system/styled';
import Core from '@clients/common/flyteidl/core';
import { BlobDimensionality } from '../../../../models/Common/types';
import t from '../strings';
import { BlobValue, InputProps, InputTypeDefinition, InputValue } from '../types';
import { getLaunchInputId, isBlobValue } from '../utils';
import { StyledCard } from './StyledCard';
import { getHelperForInput } from '../inputHelpers/getHelperForInput';
import { InputHelper } from '../inputHelpers/types';

const BlobInputContainer = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(1),
  paddingLeft: theme.spacing(1),

  '.dimensionalityInput': {
    flex: '1 1 auto',
    marginLeft: theme.spacing(2),
  },
  '.formatInput': {
    flex: '1 1 auto',
  },
  '.metadataContainer': {
    display: 'flex',
    marginTop: theme.spacing(1),
    width: '100%',
  },
}));

const tryGetBlobValue = (
  typeDefinition: InputTypeDefinition,
  helper: InputHelper,
  value?: InputValue,
) => {
  if (isBlobValue(value)) {
    return value;
  }

  let finalValue;
  try {
    finalValue = helper.fromLiteral(value as Core.ILiteral, typeDefinition) as BlobValue;
  } catch {
    finalValue = helper.typeDefinitionToDefaultValue(typeDefinition) as BlobValue;
  }

  return finalValue;
};

/** A micro form for entering the values related to a Blob Literal */
export const BlobInput: FC<InputProps> = (props) => {
  const { error, name, onChange, value: propValue, typeDefinition, label } = props;

  const helper = useMemo(() => getHelperForInput(typeDefinition.type), [typeDefinition]);

  const [blobValue, setBlobValue] = useState<BlobValue>(
    tryGetBlobValue(typeDefinition, helper, propValue),
  );

  const handleChange = (input: Partial<BlobValue>) => {
    const value = { ...blobValue, ...input } as BlobValue;
    setBlobValue(value);
  };

  useEffect(() => {
    if (!blobValue) {
      return;
    }
    onChange(blobValue);
  }, [blobValue]);

  const id = getLaunchInputId(name);
  const selectId = `${id}-select`;

  return (
    <StyledCard error={error} label={label} name={name}>
      <BlobInputContainer id={id}>
        <TextField
          id={getLaunchInputId(`${name}-uri`)}
          helperText={t('blobUriHelperText')}
          fullWidth
          label="uri"
          onChange={(e) => handleChange({ uri: e.target.value })}
          value={blobValue?.uri}
          variant="outlined"
        />
        <div className="metadataContainer">
          <TextField
            className="formatInput"
            id={getLaunchInputId(`${name}-format`)}
            helperText={t('blobFormatHelperText')}
            label="format"
            onChange={(e) => handleChange({ format: e.target.value })}
            value={blobValue?.format}
            variant="outlined"
          />
          <FormControl className="dimensionalityInput">
            <InputLabel id={`${selectId}-label`}>Dimensionality</InputLabel>
            <Select
              labelId={`${selectId}-label`}
              id={selectId}
              value={blobValue?.dimensionality}
              onChange={(e) =>
                handleChange({
                  dimensionality: e.target.value as BlobDimensionality,
                })
              }
              disabled
              variant="standard"
            >
              <MenuItem value={BlobDimensionality.SINGLE}>Single (File)</MenuItem>
              <MenuItem value={BlobDimensionality.MULTIPART}>Multipart (Directory)</MenuItem>
            </Select>
          </FormControl>
        </div>
      </BlobInputContainer>
    </StyledCard>
  );
};
