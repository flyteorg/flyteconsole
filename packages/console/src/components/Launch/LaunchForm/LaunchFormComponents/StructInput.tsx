import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import Form from '@rjsf/material-ui';
import {
  MuiThemeProvider,
  StylesProvider,
  createGenerateClassName,
  createTheme,
} from '@material-ui/core/styles';
import validator from '@rjsf/validator-ajv8';
import * as msgpack from '@msgpack/msgpack';
import { InputProps } from '../types';
import {
  protobufValueToPrimitive,
  PrimitiveType,
} from '../inputHelpers/struct';
import { StyledCard } from './StyledCard';
import { TextInput } from './TextInput';

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
    MuiInputLabel: {
      root: {
        fontSize: '13.5px',
      },
    },
    MuiInputBase: {
      root: {
        fontSize: '14px',
      },
    },
  },
  typography: {
    h5: {
      fontSize: '16px',
      fontWeight: 400,
    },
  },
});

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
export const StructInput: FC<InputProps> = props => {
  const {
    error,
    label,
    onChange,
    typeDefinition: { literalType },
    value = '',
    hasCollectionParent,
    initialValue,
  } = props;

  const { jsonFormRenderable, parsedJson } = useMemo(() => {
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

    return {
      jsonFormRenderable: jsonFormRenderable && !hasCollectionParent,
      parsedJson,
    };
  }, [literalType, hasCollectionParent]);

  const [paramData, setParamData] = useState(
    jsonFormRenderable && value ? JSON.parse(value as string) : {},
  );

  const onFormChange = useCallback(({ formData }) => {
    onChange(JSON.stringify(formData));
    setParamData(formData);
  }, []);

  useEffect(() => {
    if (!jsonFormRenderable && initialValue) {
      const value = initialValue.scalar?.binary?.value;
      if (value) {
        const parsedValue = msgpack.decode(value);
        onChange(JSON.stringify(parsedValue));
      }
    }
  }, [jsonFormRenderable, initialValue]);

  return jsonFormRenderable ? (
    <StylesProvider
      generateClassName={createGenerateClassName({
        seed: 'StructInput-',
      })}
    >
      <MuiThemeProvider theme={muiTheme}>
        <StyledCard error={error} label={label}>
          <Form
            schema={JSON.parse(JSON.stringify(parsedJson))}
            validator={validator}
            formData={paramData}
            onChange={onFormChange}
          >
            <div></div>
          </Form>
        </StyledCard>
      </MuiThemeProvider>
    </StylesProvider>
  ) : (
    <TextInput
      {...props}
      // TODO: why does struct not have a default value? ref: console/projects/flytesnacks/domains/development/executions/aqhjbwsbmzdwf7pnnsl6
      // value={
      //   value ||
      //   JSON.stringify(
      //     Object.keys((parsedJson as any)?.properties || {}).reduce(
      //       (prev, key) => {
      //         prev[key] = (parsedJson as any).properties[key].default;
      //         return prev;
      //       },
      //       {},
      //     ),
      //   )
      // }
      textInputProps={{
        fullWidth: true,
        multiline: true,
        maxRows: 8,
        variant: 'outlined',
      }}
    />
  );
};
