import { stringifyValue } from 'common/utils';
import { Core } from 'flyteidl';
import { InputTypeDefinition, InputValue } from '../types';
import { getHelperForInput } from './getHelperForInput';
import { ConverterInput, InputHelper, InputValidatorParams } from './types';
import t from '../../../common/strings';

function fromLiteral(literal: Core.ILiteral, { subtype }: InputTypeDefinition): InputValue {
  if (!subtype) {
    throw new Error(t('missingMapSubType'));
  }
  if (!literal.map) {
    throw new Error(t('mapMissingMapProperty'));
  }
  if (!literal.map.literals) {
    throw new Error(t('mapMissingMapLiteralsProperty'));
  }
  if (typeof literal.map.literals !== 'object') {
    throw new Error(t('mapLiternalNotObject'));
  }
  if (!Object.keys(literal.map.literals).length) {
    throw new Error(t('mapLiternalObjectEmpty'));
  }

  const key = Object.keys(literal.map.literals)[0];
  const childLiteral = literal.map.literals[key];
  const helper = getHelperForInput(subtype.type);

  return stringifyValue({ [key]: helper.fromLiteral(childLiteral, subtype) });
}

function toLiteral({ value, typeDefinition: { subtype } }: ConverterInput): Core.ILiteral {
  if (!subtype) {
    throw new Error(t('missingMapSubType'));
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
    throw new Error(t('missingMapSubType'));
  }
  if (typeof value !== 'string') {
    throw new Error(t('valueNotString'));
  }
  if (!value.toString().length) {
    throw new Error(t('valueRequired'));
  }
  try {
    JSON.parse(value.toString());
  } catch (e) {
    throw new Error(t('valueNotParse'));
  }
  const obj = JSON.parse(value.toString());
  if (!Object.keys(obj).length || !Object.keys(obj)[0].trim().length) {
    throw new Error(t('valueKeyRequired'));
  }
  const key = Object.keys(obj)[0];
  const helper = getHelperForInput(subtype.type);
  const subValue = obj[key];

  try {
    helper.validate({ value: subValue, typeDefinition: subtype, name: '', required: false });
  } catch (e) {
    throw new Error(t('valueValueInvalid'));
  }
}

export const mapHelper: InputHelper = {
  fromLiteral,
  toLiteral,
  validate,
};
