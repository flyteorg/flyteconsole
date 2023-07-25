import { Core } from '@flyteorg/flyteidl-types';
import { isObject } from 'lodash';
import { DatasetValue, InputTypeDefinition } from '../types';
import { ConverterInput, InputHelper, InputValidatorParams } from './types';

function fromLiteral(
  literal: Core.ILiteral,
  typeDefinition: InputTypeDefinition,
): DatasetValue {
  const { structuredDataset } = literal?.scalar || {};

  const { metadata, uri } = structuredDataset || {};
  const { format } = metadata?.structuredDatasetType || {};
  return {
    uri: uri!,
    format: format!,
  };
}

function toLiteral({ value, typeDefinition }: ConverterInput): Core.ILiteral {
  const dsValue = value as DatasetValue;
  return {
    scalar: {
      structuredDataset: {
        metadata: {
          structuredDatasetType: {
            format: dsValue.format,
          },
        },
        uri: dsValue.uri,
      },
    },
  };
}

function validate({ value, required }: InputValidatorParams) {
  if (!isObject(value)) {
    throw new Error('Invalid structured datased value');
  }
  const dsValue = value as DatasetValue;
  if (required && (!dsValue?.uri || typeof dsValue?.uri !== 'string')) {
    throw new Error('Dataset uri is required');
  }

  if (!!dsValue.format && typeof dsValue.format !== 'string') {
    throw new Error('Dataset format must be a string');
  }
}

export const structuredDataSetHelper: InputHelper = {
  fromLiteral,
  toLiteral,
  validate,
  typeDefinitionToDefaultValue: typeDefinition => {
    return {
      format: undefined,
      uri: undefined,
    } as DatasetValue;
  },
};
