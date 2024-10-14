import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import styled from '@mui/system/styled';
import * as msgpack from '@msgpack/msgpack';
import { InputProps } from '../types';
import { protobufValueToPrimitive, PrimitiveType } from '../inputHelpers/struct';
import { StyledCard } from './StyledCard';
import { TextInput } from './TextInput';

const StyledForm = styled(Form)(() => ({
  '& .MuiTypography-h5': {
    fontSize: '16px',
    fontWeight: 400,
  },
  '& .MuiInputLabel-root': {
    fontSize: '13.5px',
  },
  '& .MuiInputBase-root': {
    fontSize: '14px',
  },
  '& .MuiFormHelperText-root': {
    fontSize: '12px',
  },
  '& .MuiFormLabel-root': {
    fontSize: '13.5px',
  },
  '& .MuiInputBase-input': {
    fontSize: '14px',
  },
}));

const formatJson = (data) => {
  const keys = Object.keys(data);

  if (keys.includes('title')) {
    const { title, type, format } = data || {};
    // eslint-disable-next-line no-param-reassign
    data.title = `${title} (${format ?? type})`;
    if (!keys.includes('additionalProperties')) return data;
  }

  keys.forEach((key) => {
    const item = data[`${key}`];
    if (typeof item === 'object') {
      // eslint-disable-next-line no-param-reassign
      data = { ...data, [key]: formatJson(item ?? {}) };
    }
  });

  return data;
};

/** Handles rendering of the input component for a Struct */
export const StructInput: FC<InputProps> = (props) => {
  const {
    error,
    label,
    name,
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
      const keys = Object.keys(literalType?.metadata?.fields?.definitions?.structValue?.fields);

      if (keys.length > 1) {
        // If there are multiple keys, we can't render a form because of not supporting nested structs so render a text field
        jsonFormRenderable = false;
      } else if (keys[0]) {
        parsedJson = protobufValueToPrimitive(
          literalType.metadata.fields.definitions.structValue.fields[`${keys[0]}`],
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
    <StyledCard error={error} label={label} name={name}>
      <StyledForm
        schema={JSON.parse(JSON.stringify(parsedJson))}
        validator={validator}
        formData={paramData}
        onChange={onFormChange as any}
      >
        <div></div>
      </StyledForm>
    </StyledCard>
  ) : (
    <TextInput
      {...props}
      textInputProps={{
        fullWidth: true,
        multiline: true,
        maxRows: 8,
        variant: 'outlined',
      }}
    />
  );
};
