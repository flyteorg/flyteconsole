import React, { FC, useEffect, useMemo, useState } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { BlobDimensionality } from 'models/Common/types';
import { Core } from '@flyteorg/flyteidl-types';
import { isEqual } from 'lodash';
import t from '../strings';
import { BlobValue, InputProps, InputTypeDefinition } from '../types';
import { getLaunchInputId, isBlobValue } from '../utils';
import { StyledCard } from './StyledCard';
import { getHelperForInput } from '../inputHelpers/getHelperForInput';
import { InputHelper } from '../inputHelpers/types';

const useStyles = makeStyles((theme: Theme) => ({
  dimensionalityInput: {
    flex: '1 1 auto',
    marginLeft: theme.spacing(2),
  },
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

const tryGetBlobValue = (
  value: BlobValue | Core.ILiteral,
  typeDefinition: InputTypeDefinition,
  helper: InputHelper,
) => {
  let finalValue = value as BlobValue;
  try {
    finalValue = helper.fromLiteral(
      value as Core.ILiteral,
      typeDefinition,
    ) as BlobValue;
  } catch {
    // do nothing
  }

  return finalValue;
};

/** A micro form for entering the values related to a Blob Literal */
export const BlobInput: FC<InputProps> = props => {
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

  const [blobValue, setBlobValue] = useState<BlobValue>();

  useEffect(() => {
    const newValue = isBlobValue(propValue)
      ? tryGetBlobValue(propValue, typeDefinition, helper)
      : (helper.typeDefinitionToDefaultValue(typeDefinition) as BlobValue);

    setBlobValue(prev => {
      if (isEqual(prev, newValue)) {
        return prev;
      }

      return newValue;
    });
  }, [propValue, typeDefinition]);

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

  const selectId = getLaunchInputId(`${name}-select`);

  return (
    <StyledCard error={error} label={label}>
      <div className={styles.inputContainer}>
        <TextField
          id={getLaunchInputId(`${name}-uri`)}
          helperText={t('blobUriHelperText')}
          fullWidth={true}
          label="uri"
          onChange={e => handleChange({ uri: e.target.value })}
          value={blobValue?.uri}
          variant="outlined"
        />
        <div className={styles.metadataContainer}>
          <TextField
            className={styles.formatInput}
            id={getLaunchInputId(`${name}-format`)}
            helperText={t('blobFormatHelperText')}
            label="format"
            onChange={e => handleChange({ format: e.target.value })}
            value={blobValue?.format}
            variant="outlined"
          />
          <FormControl className={styles.dimensionalityInput}>
            <InputLabel id={`${selectId}-label`}>Dimensionality</InputLabel>
            <Select
              labelId={`${selectId}-label`}
              id={selectId}
              value={blobValue?.dimensionality}
              onChange={e =>
                handleChange({
                  dimensionality: e.target.value as BlobDimensionality,
                })
              }
              disabled
            >
              <MenuItem value={BlobDimensionality.SINGLE}>
                Single (File)
              </MenuItem>
              <MenuItem value={BlobDimensionality.MULTIPART}>
                Multipart (Directory)
              </MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>
    </StyledCard>
  );
};
