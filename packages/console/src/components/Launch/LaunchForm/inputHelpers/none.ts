import { Core } from '@flyteorg/flyteidl-types';
import { InputValue } from '../types';
import { ConverterInput, InputHelper, InputValidatorParams } from './types';

function fromLiteral(literal: Core.ILiteral): InputValue {
  return {};
}

function toLiteral({ value }: ConverterInput): Core.ILiteral {
  return {
    scalar: { noneType: {} },
  };
}

function validate({ value }: InputValidatorParams) {
  if (typeof value !== 'object' && Object.keys(value).length) {
    throw new Error('Value must be an empty object');
  }
}

export const noneHelper: InputHelper = {
  fromLiteral,
  toLiteral,
  validate,
  typeDefinitionToDefaultValue: typeDefinition => {
    return fromLiteral({} as any);
  },
};
