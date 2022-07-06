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

const getInitialValue = (
  variants: Core.ILiteralType[] | undefined | null,
  initialValue: Core.ILiteral | undefined,
  initialType: LiteralType,
) => {
  if (!variants) {
    return <></>;
  }

  return variants.reduce(function (map, variant: LiteralType) {
    if (initialValue && JSON.stringify(variant) === JSON.stringify(initialType)) {
      map[JSON.stringify(variant)] = initialValue;
    } else {
      map[JSON.stringify(variant)] = null;
    }
    return map;
  }, {});
};

const getInitialType = (
  variants: Core.ILiteralType[] | undefined | null,
  initialValue: Core.ILiteral | undefined,
): LiteralType | null => {
  if (!variants?.length) {
    return null;
  }

  if (initialValue) {
    for (let i = 0; i < variants.length; i++) {
      const type = variants[i] as LiteralType;
      const inputType = type && getInputDefintionForLiteralType(type);
      try {
        if (getHelperForInput(inputType.type).fromLiteral(initialValue, inputType)) {
          return type;
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  return variants[0] as LiteralType;
};

export const UnionInput = (props: InputProps) => {
  const { initialValue, value, label, onChange, typeDefinition } = props;
  const variants = typeDefinition.literalType.unionType?.variants;
  const initialType = getInitialType(variants, initialValue);

  if (!initialType) {
    return;
  }

  const [typesToValue, setTypeMapValue] = React.useState<Record<any, any>>(
    getInitialValue(variants, initialValue, initialType),
  );

  const classes = useStyles();
  const [type, setType] = React.useState<LiteralType>(initialType);

  const inputType = type && getInputDefintionForLiteralType(type);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="body1" component="label">
          {label}
        </Typography>

        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel id="demo-simple-select-placeholder-label-label">Type</InputLabel>
          <Select
            variant="outlined"
            labelId="demo-simple-select-placeholder-label-label"
            id="demo-simple-select-placeholder-label"
            value={type}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              setType(event.target.value as LiteralType);
            }}
            className={classes.selectEmpty}
          >
            {variants?.map((variant) => (
              <MenuItem value={variant} key={variant.structure?.tag}>
                <em>{variant.structure?.tag}</em>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div>
          {inputType &&
            getComponentForInput(
              {
                description: '',
                name: '',
                label: '',
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
      </CardContent>
    </Card>
  );
};
