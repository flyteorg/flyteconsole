import { FormControl, FormHelperText, TextField } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import * as React from 'react';
import { requiredInputSuffix } from './constants';
import { InputProps, InputType } from './types';
import { formatType, getLaunchInputId, parseMappedTypeValue } from './utils';

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    width: '100%',
  },
  controls: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
  },
  keyControl: {
    marginRight: theme.spacing(1),
  },
  valueControl: {
    flexGrow: 1,
  },
}));

/** Handles rendering of the input component for any primitive-type input */
export const MapInput: React.FC<InputProps> = (props) => {
  const {
    error,
    name,
    onChange,
    value = '',
    typeDefinition: { subtype },
  } = props;
  const hasError = !!error;
  const helperText = hasError ? error : props.helperText;
  const classes = useStyles();

  const { key: mapKey, value: mapValue } = parseMappedTypeValue(value);

  const valueError = error?.startsWith("Value's value");

  const handleKeyChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(JSON.stringify({ [e.target.value || '']: mapValue }));
    },
    [mapValue],
  );

  const handleValueChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(JSON.stringify({ [mapKey]: e.target.value || '' }));
    },
    [mapKey],
  );

  const keyControl = (
    <TextField
      error={hasError && !valueError}
      id={`${getLaunchInputId(name)}-key`}
      label={`string${requiredInputSuffix}`}
      onChange={handleKeyChange}
      value={mapKey}
      variant="outlined"
      className={classes.keyControl}
    />
  );
  let valueControl: JSX.Element;

  switch (subtype?.type) {
    case InputType.String:
    case InputType.Integer:
      valueControl = (
        <TextField
          error={valueError}
          id={`${getLaunchInputId(name)}-value`}
          label={`${formatType(subtype)}${requiredInputSuffix}`}
          onChange={handleValueChange}
          value={mapValue}
          variant="outlined"
          className={classes.valueControl}
          type={subtype.type === InputType.Integer ? 'number' : 'text'}
        />
      );
      break;
    default:
      valueControl = (
        <TextField
          error={valueError}
          id={`${getLaunchInputId(name)}-value`}
          label={subtype ? formatType(subtype) + requiredInputSuffix : ''}
          onChange={handleValueChange}
          value={mapValue}
          variant="outlined"
          multiline
          className={classes.valueControl}
        />
      );
  }

  return (
    <FormControl className={classes.formControl}>
      <div className={classes.controls}>
        {keyControl}
        {valueControl}
      </div>
      <FormHelperText id={`${getLaunchInputId(name)}-helper`}>{helperText}</FormHelperText>
    </FormControl>
  );
};
