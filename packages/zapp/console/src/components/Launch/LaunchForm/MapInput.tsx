import { Button, FormControl, FormHelperText, IconButton, TextField } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import * as React from 'react';
import RemoveIcon from '@material-ui/icons/Remove';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { requiredInputSuffix } from './constants';
import { InputProps, InputType, InputValue } from './types';
import { formatType, getLaunchInputId, parseMappedTypeValue, toMappedTypeValue } from './utils';

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    width: '100%',
    marginTop: theme.spacing(1),
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
  addButton: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(1),
  },
  error: {
    border: '1px solid #f44336',
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
  const classes = useStyles();
  const [keyRefs, setKeyRefs] = React.useState<any>([]);

  const [pairs, setPairs] = React.useState<
    {
      key: string;
      value: string;
    }[]
  >([]);
  const parsed = parseMappedTypeValue(value);
  React.useEffect(() => {
    setPairs(parsed);
  }, [value]);

  const valueError = error?.startsWith("Value's value");

  const onAddItem = React.useCallback(() => {
    setKeyRefs((refs) => [...refs, null]);
    setPairs((pairs) => [...pairs, { key: '', value: '' }]);
  }, []);

  const onDeleteItem = React.useCallback((index) => {
    setKeyRefs((refs) => [...refs.slice(0, index), ...refs.slice(index + 1)]);
    setPairs((pairs) => [...pairs.slice(0, index), ...pairs.slice(index + 1)]);
  }, []);

  const onUpdate = (newPairs) => {
    const newValue = toMappedTypeValue(newPairs);
    setPairs(parseMappedTypeValue(newValue as InputValue));
    onChange(newValue);
  };

  return (
    <Card variant="outlined" className={hasError ? classes.error : ''}>
      <CardContent>
        <FormHelperText id={`${getLaunchInputId(name)}-helper`}>{props.helperText}</FormHelperText>
        {pairs.map(({ key: itemKey, value: itemValue }, index) => {
          const keyControl = (
            <TextField
              id={`${getLaunchInputId(name)}-key-${index}`}
              label={`string${requiredInputSuffix}`}
              inputRef={(ref) => (keyRefs[index] = ref)}
              onBlur={() => {
                onUpdate([
                  ...pairs.slice(0, index),
                  { key: keyRefs[index].value, value: itemValue },
                  ...pairs.slice(index + 1),
                ]);
              }}
              defaultValue={itemKey}
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
                  id={`${getLaunchInputId(name)}-value-${index}`}
                  label={`${formatType(subtype)}${requiredInputSuffix}`}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    onUpdate([
                      ...pairs.slice(0, index),
                      { key: itemKey, value: e.target.value ?? '' },
                      ...pairs.slice(index + 1),
                    ]);
                  }}
                  value={itemValue}
                  variant="outlined"
                  className={classes.valueControl}
                  type={subtype.type === InputType.Integer ? 'number' : 'text'}
                />
              );
              break;
            default:
              valueControl = (
                <TextField
                  id={`${getLaunchInputId(name)}-value-${index}`}
                  label={subtype ? formatType(subtype) + requiredInputSuffix : ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    onUpdate([
                      ...pairs.slice(0, index),
                      { key: itemKey, value: e.target.value ?? '' },
                      ...pairs.slice(index + 1),
                    ]);
                  }}
                  value={itemValue}
                  variant="outlined"
                  multiline
                  className={classes.valueControl}
                />
              );
          }

          return (
            <FormControl className={classes.formControl} key={`${itemKey}-${index}`}>
              <div className={classes.controls}>
                {keyControl}
                {valueControl}
                <IconButton onClick={() => onDeleteItem(index)}>
                  <RemoveIcon />
                </IconButton>
              </div>
            </FormControl>
          );
        })}
        <div className={classes.addButton}>
          <Button onClick={onAddItem}>+ ADD ITEM</Button>
        </div>
        {hasError && (
          <FormHelperText id={`${getLaunchInputId(name)}-error`}>{error}</FormHelperText>
        )}
      </CardContent>
    </Card>
  );
};
