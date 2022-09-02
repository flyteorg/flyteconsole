import { Core } from 'flyteidl';
import * as Long from 'long';
import { literalNone } from './constants';
import { InputValue } from '../types';
import { primitiveLiteralPaths } from './constants';
import { ConverterInput, InputHelper, InputValidatorParams } from './types';
import { extractLiteralWithCheck } from './utils';

function fromLiteral(literal: Core.ILiteral): InputValue {
  return {};
}

function toLiteral({ value }: ConverterInput): Core.ILiteral {
  return {
    scalar: { noneType: {} },
  };
}

function validate({ value }: InputValidatorParams) {}

export const noneHelper: InputHelper = {
  fromLiteral,
  toLiteral,
  validate,
};
