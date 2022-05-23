import { stringifyValue } from 'common/utils';
import { Core } from 'flyteidl';
import { InputTypeDefinition, InputValue } from '../types';
import { getHelperForInput } from './getHelperForInput';
import { ConverterInput, InputHelper, InputValidatorParams } from './types';

const missingSubTypeError = 'Unexpected missing subtype for map';

function fromLiteral(literal: Core.ILiteral, { subtype }: InputTypeDefinition): InputValue {
  if (!subtype) {
    throw new Error(missingSubTypeError);
  }
  if (!literal.map) {
    throw new Error('Map literal missing `map` property');
  }
  if (!literal.map.literals) {
    throw new Error('Map literal missing `map.literals` property');
  }
  if (typeof literal.map.literals !== 'object') {
    throw new Error('Map literal is not an object');
  }
  if (!Object.keys(literal.map.literals).length) {
    throw new Error('Map literal object is empty');
  }

  const key = Object.keys(literal.map.literals)[0];
  const childLiteral = literal.map.literals[key];
  const helper = getHelperForInput(subtype.type);

  return stringifyValue({ [key]: helper.fromLiteral(childLiteral, subtype) });
}

function toLiteral({ value, typeDefinition: { subtype } }: ConverterInput): Core.ILiteral {
  if (!subtype) {
    throw new Error(missingSubTypeError);
  }
  const obj = JSON.parse(value.toString());
  const key = Object.keys(obj)?.[0];

  const helper = getHelperForInput(subtype.type);

  return {
    map: { literals: { [key]: helper.toLiteral({ value: obj[key], typeDefinition: subtype }) } },
  };
}

function validate({ value, typeDefinition: { subtype } }: InputValidatorParams) {
  if (!subtype) {
    throw new Error(missingSubTypeError);
  }
  if (typeof value !== 'string') {
    throw new Error('Value is not a string');
  }
  if (!value.toString().length) {
    throw new Error('Value is required');
  }
  try {
    JSON.parse(value.toString());
  } catch (e) {
    throw new Error(`Value did not parse to an object`);
  }
  const obj = JSON.parse(value.toString());
  if (!Object.keys(obj).length || !Object.keys(obj)[0].trim().length) {
    throw new Error("Value's key is required");
  }
  const key = Object.keys(obj)[0];
  const helper = getHelperForInput(subtype.type);
  const subValue = obj[key];

  try {
    helper.validate({ value: subValue, typeDefinition: subtype, name: '', required: false });
  } catch (e) {
    throw new Error("Value's value is invalid");
  }
}

export const mapHelper: InputHelper = {
  fromLiteral,
  toLiteral,
  validate,
};
