import { Core } from '@flyteorg/flyteidl-types';
import { InputValue } from '../types';
import { primitiveLiteralPaths } from './constants';
import { ConverterInput, InputHelper, InputValidatorParams } from './types';
import { extractLiteralWithCheck } from './utils';

function fromLiteral(literal: Core.ILiteral): InputValue {
  return extractLiteralWithCheck<string>(
    literal,
    primitiveLiteralPaths.scalarString,
  );
}

function toLiteral({ value }: ConverterInput): Core.ILiteral {
  const stringValue = typeof value === 'string' ? value : value?.toString?.();
  return { scalar: { primitive: { stringValue } } };
}

function validate({ value, required }: InputValidatorParams) {
  if (typeof value !== 'string') {
    throw new Error('Value is not a string');
  }
  if (required && !value) {
    throw new Error('Value should not be empty');
  }
  if (value?.length !== value?.trim?.()?.length) {
    throw new Error('Value should not have leading or trailing spaces');
  }
}

export const stringHelper: InputHelper = {
  fromLiteral,
  toLiteral,
  validate,
};
