import { Core } from '@flyteorg/flyteidl-types';
import { isObject } from 'lodash';
import { BlobDimensionality } from 'models/Common/types';
import { BlobValue } from '../types';
import { ConverterInput, InputHelper, InputValidatorParams } from './types';
import { isKeyOfBlobDimensionality } from './utils';
import { literalNone } from './constants';

function fromLiteral(literal: Core.ILiteral): BlobValue {
  if (!literal.scalar || !literal.scalar.blob) {
    throw new Error('Literal blob missing scalar.blob property');
  }
  const { blob } = literal.scalar;
  const uri = blob.uri ?? '';
  // throw away empty format values
  const format = blob.metadata?.type?.format || undefined;
  const dimensionality =
    blob.metadata?.type?.dimensionality ?? BlobDimensionality.SINGLE;

  return {
    dimensionality,
    format,
    uri,
  };
}

// Allows for string values ('single'/'multipart') when specifying blobs manually in collections
function getDimensionality(value: string | number) {
  if (typeof value === 'number') {
    return value;
  }
  const normalizedValue = value.toUpperCase();
  if (isKeyOfBlobDimensionality(normalizedValue)) {
    return BlobDimensionality[normalizedValue];
  }
  return -1;
}

function toLiteral({ value }: ConverterInput): Core.ILiteral {
  if (!value) {
    return literalNone();
  }

  const {
    dimensionality: rawDimensionality,
    format: rawFormat,
    uri,
  } = value as BlobValue;

  const dimensionality = getDimensionality(rawDimensionality);

  // Send undefined for empty string values of format
  const format = rawFormat ? rawFormat : undefined;
  return {
    scalar: {
      blob: { uri, metadata: { type: { dimensionality, format } } },
    },
  };
}

function validate({ value, required }: InputValidatorParams) {
  if (!isObject(value)) {
    throw new Error('Invalid blob value');
  }

  const blobValue = value as BlobValue;
  if (required && (!blobValue?.uri || typeof blobValue?.uri !== 'string')) {
    throw new Error('Blob uri is required');
  }

  if (blobValue.dimensionality == null) {
    throw new Error('Blob dimensionality is required');
  }
  if (!(getDimensionality(blobValue.dimensionality) in BlobDimensionality)) {
    throw new Error(
      `Unknown blob dimensionality value: ${blobValue.dimensionality}`,
    );
  }
  if (blobValue.format != null && typeof blobValue.format !== 'string') {
    throw new Error('Blob format must be a string');
  }
}

export const blobHelper: InputHelper = {
  fromLiteral,
  toLiteral,
  validate,
  typeDefinitionToDefaultValue: (typeDefinition): BlobValue => {
    return {
      uri: undefined,
      dimensionality:
        typeDefinition?.literalType?.blob?.dimensionality ??
        BlobDimensionality.SINGLE,
      format: (typeDefinition?.literalType?.blob as any)?.format,
    } as any as BlobValue;
  },
};
