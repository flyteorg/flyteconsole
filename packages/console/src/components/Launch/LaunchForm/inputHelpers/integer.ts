import { Core } from '@flyteorg/flyteidl-types';
import Long from 'long';
import { InputValue } from '../types';
import { primitiveLiteralPaths } from './constants';
import { ConverterInput, InputHelper, InputValidatorParams } from './types';
import { extractLiteralWithCheck } from './utils';

const integerRegexPattern = /^-?[0-9]+$/;

function fromLiteral(literal: Core.ILiteral): InputValue {
  return extractLiteralWithCheck<Long>(
    literal,
    primitiveLiteralPaths.scalarInteger,
  )?.toString();
}

function toLiteral({ value }: ConverterInput): Core.ILiteral {
  const integerValue =
    value === undefined || value instanceof Long
      ? value
      : Long.fromString(value.toString());
  return {
    scalar: { primitive: { integer: integerValue } },
  };
}

export function isValidInteger(value: InputValue): boolean {
  if (value instanceof Long) {
    return true;
  }
  if (typeof value === 'number' && Number.isInteger(value)) {
    return true;
  }
  if (typeof value === 'string' && value.match(integerRegexPattern)) {
    return true;
  }
  return false;
}

function validate({ value }: InputValidatorParams) {
  if (!isValidInteger(value)) {
    throw new Error('Value is not a valid integer');
  }
}

export const integerHelper: InputHelper = {
  fromLiteral,
  toLiteral,
  validate,
  typeDefinitionToDefaultValue: typeDefinition => {
    return undefined as any;
  },
};
