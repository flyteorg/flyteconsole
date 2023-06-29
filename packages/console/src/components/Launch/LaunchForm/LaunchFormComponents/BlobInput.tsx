import React, { FC, useEffect, useMemo } from 'react';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { BlobDimensionality } from 'models/Common/types';
import t from '../strings';
import { BlobValue, InputProps } from '../types';
import { getLaunchInputId, isBlobValue } from '../utils';
import { StyledCard } from './StyledCard';

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

  const dimensionality = typeDefinition?.literalType?.blob?.dimensionality;
  const blobValue = useMemo(
    () =>
      isBlobValue(propValue)
        ? propValue
        : ({
            uri: undefined,
            dimensionality: dimensionality ?? BlobDimensionality.SINGLE,
            format: undefined,
          } as any as BlobValue),
    [propValue, dimensionality],
  );

  const handleChange = (input: Partial<BlobValue>) => {
    const value = { ...blobValue, ...input };
    onChange(value);
  };

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
          value={blobValue.uri}
          variant="outlined"
        />
        <div className={styles.metadataContainer}>
          <TextField
            className={styles.formatInput}
            id={getLaunchInputId(`${name}-format`)}
            helperText={t('blobFormatHelperText')}
            label="format"
            onChange={e => handleChange({ format: e.target.value })}
            value={blobValue.format}
            variant="outlined"
          />
          <FormControl className={styles.dimensionalityInput}>
            <InputLabel id={`${selectId}-label`}>Dimensionality</InputLabel>
            <Select
              labelId={`${selectId}-label`}
              id={selectId}
              value={blobValue.dimensionality}
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
