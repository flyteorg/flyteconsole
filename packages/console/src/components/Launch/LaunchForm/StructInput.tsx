import * as React from 'react';
import { TextField, Card, CardContent, CardHeader } from '@material-ui/core';
import { useState } from 'react';
import Form from '@rjsf/material-ui';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';
import validator from '@rjsf/validator-ajv8';
import { makeStringChangeHandler } from './handlers';
import { InputProps } from './types';
import { getLaunchInputId } from './utils';
import { protobufValueToPrimitive, PrimitiveType } from './inputHelpers/struct';

const muiTheme = createTheme({
  props: {
    MuiTextField: {
      variant: 'outlined',
    },
  },
  overrides: {
    MuiButton: {
      label: {
        color: 'gray',
      },
    },
  },
});

muiTheme.typography.h5 = {
  fontSize: '16px',
  fontWeight: 400,
};

const formatJson = data => {
  const keys = Object.keys(data);

  if (keys.includes('title')) {
    const { title, type, format } = data;
    data['title'] = `${title} (${format ?? type})`;
    if (!keys.includes('additionalProperties')) return data;
  }

  keys.forEach(key => {
    const item = data[`${key}`];
    if (typeof item === 'object') {
      data = { ...data, [key]: formatJson(item ?? {}) };
    }
  });

  return data;
};

/** Handles rendering of the input component for a Struct */
export const StructInput: React.FC<InputProps> = props => {
  const {
    error,
    label,
    name,
    onChange,
    typeDefinition: { literalType },
    value = '',
  } = props;
  const hasError = !!error;
  const helperText = hasError ? error : props.helperText;

  let jsonFormRenderable = false;
  let parsedJson: PrimitiveType = {};

  if (literalType?.metadata?.fields?.definitions?.structValue?.fields) {
    const keys = Object.keys(
      literalType?.metadata?.fields?.definitions?.structValue?.fields,
    );

    if (keys.length > 1) {
      // If there are multiple keys, we can't render a form because of not supporting nested structs so render a text field
      jsonFormRenderable = false;
    } else if (keys[0]) {
      parsedJson = protobufValueToPrimitive(
        literalType.metadata.fields.definitions.structValue.fields[
          `${keys[0]}`
        ],
      );

      if (parsedJson) {
        parsedJson = formatJson(parsedJson);
        jsonFormRenderable = true;
      }
    }
  }

  const [paramData, setParamData] = useState(
    jsonFormRenderable && value ? JSON.parse(value as string) : {},
  );

  const onFormChange = React.useCallback(({ formData }) => {
    onChange(JSON.stringify(formData));
    setParamData(formData);
  }, []);

  return jsonFormRenderable ? (
    <MuiThemeProvider theme={muiTheme}>
      <Card>
        <CardHeader title={label} style={{ borderBottom: 'solid 1px gray' }} />
        <CardContent>
          <Form
            schema={JSON.parse(JSON.stringify(parsedJson))}
            validator={validator}
            formData={paramData}
            onChange={onFormChange}
          >
            <div></div>
          </Form>
        </CardContent>
      </Card>
    </MuiThemeProvider>
  ) : (
    <TextField
      id={getLaunchInputId(name)}
      error={hasError}
      helperText={helperText}
      fullWidth={true}
      label={label}
      multiline={true}
      onChange={makeStringChangeHandler(onChange)}
      maxRows={8}
      value={value}
      variant="outlined"
    />
  );
};
