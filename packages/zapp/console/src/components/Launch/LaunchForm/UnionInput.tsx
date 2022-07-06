import { Button, IconButton, TextField, Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import * as React from 'react';
import RemoveIcon from '@material-ui/icons/Remove';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { LiteralType } from 'models/Common/types';
import { Core } from 'flyteidl';
import { requiredInputSuffix } from './constants';
import { InputProps, InputType, InputTypeDefinition, InputValue } from './types';
import { formatType, toMappedTypeValue, getInputDefintionForLiteralType } from './utils';
import { getComponentForInput } from './LaunchFormInputs';
import { getHelperForInput } from './inputHelpers/getHelperForInput';
import { ConverterInput } from './inputHelpers/types';

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  controls: {
    margin: theme.spacing(1),
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
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

const getInitialValue = (variants: Core.ILiteralType[] | undefined, initialValue) => {
  if (!variants) {
    return <></>;
  }

  return variants.reduce(function (map, variant) {
    map[JSON.stringify(variant)] = null;
    return map;
  }, {});
};

export const UnionInput = (props: InputProps) => {
  const { initialValue, value, label, onChange, typeDefinition } = props;
  const variants = typeDefinition.literalType.unionType?.variants;

  const [typesToValue, setTypeMapValue] = React.useState<Record<any, any>>(
    getInitialValue(variants, initialValue),
  );

  const classes = useStyles();
  const [type, setType] = React.useState<LiteralType>();

  const inputType = type && getInputDefintionForLiteralType(type);

  console.log('typesToValuetypesToValue', typesToValue);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="body1" component="label">
          {label}
        </Typography>

        <FormControl className={classes.formControl}>
          <InputLabel shrink id="demo-simple-select-placeholder-label-label">
            Type
          </InputLabel>
          <Select
            labelId="demo-simple-select-placeholder-label-label"
            id="demo-simple-select-placeholder-label"
            value={type}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              setType(event.target.value as LiteralType);
            }}
            displayEmpty
            className={classes.selectEmpty}
          >
            {variants?.map((variant) => (
              <MenuItem value={variant}>
                <em>{variant.structure?.tag}</em>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div>
          {inputType &&
            getComponentForInput(
              {
                description: 'test',
                name: 'name',
                label: 'label',

                required: true,
                typeDefinition: inputType,
                onChange: (input: any) => {
                  onChange(
                    getHelperForInput(inputType.type).toLiteral({
                      value: input,
                      typeDefinition: inputType,
                    } as ConverterInput),
                  );
                  setTypeMapValue({
                    ...typesToValue,
                    [JSON.stringify(type)]: getHelperForInput(inputType.type).toLiteral({
                      value: input,
                      typeDefinition: inputType,
                    } as ConverterInput),
                  });
                },
                value:
                  typesToValue[JSON.stringify(type)] &&
                  getHelperForInput(inputType.type).fromLiteral(
                    typesToValue[JSON.stringify(type)],
                    inputType,
                  ),
              } as InputProps,
              false,
            )}
        </div>

        {/* {data
          .filter((item) => item.id !== null)
          .map((item) => {
            return (
              <MapSingleInputItem
                key={item.id}
                data={item}
                subtype={subtype}
                setKey={(key) => onSetKey(item.id, key)}
                setValue={(value) => onSetValue(item.id, value)}
                isValid={(value) => isValid(item.id, value)}
                onDeleteItem={() => onDeleteItem(item.id)}
              />
            );
          })}
        <div className={classes.addButton}>
          <Button onClick={onAddItem}>+ ADD ITEM</Button>
        </div> */}
      </CardContent>
    </Card>
  );
};
