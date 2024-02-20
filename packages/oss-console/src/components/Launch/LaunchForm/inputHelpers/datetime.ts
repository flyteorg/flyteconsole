import Protobuf from '@clients/common/flyteidl/protobuf';
import Core from '@clients/common/flyteidl/core';
import { utc as moment } from 'moment';
import { dateToTimestamp, timestampToDate } from '../../../../common/utils';
import { InputValue } from '../types';
import { allowedDateFormats, primitiveLiteralPaths } from './constants';
import { ConverterInput, InputHelper, InputValidatorParams } from './types';
import { extractLiteralWithCheck } from './utils';

function parseDate(value: InputValue) {
  return value instanceof Date ? value : moment(value?.toString()!, allowedDateFormats).toDate();
}

function fromLiteral(literal: Core.ILiteral): InputValue {
  const value = extractLiteralWithCheck<Protobuf.ITimestamp>(
    literal,
    primitiveLiteralPaths.scalarDatetime,
  );
  return timestampToDate(value).toISOString();
}

function toLiteral({ value }: ConverterInput): Core.ILiteral {
  const datetime = dateToTimestamp(parseDate(value));
  return {
    scalar: { primitive: { datetime } },
  };
}

function validate({ value }: InputValidatorParams) {
  const parsed = parseDate(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Value is not a valid Date');
  }
}

export const datetimeHelper: InputHelper = {
  fromLiteral,
  toLiteral,
  validate,
  typeDefinitionToDefaultValue: (typeDefinition) => {
    return '';
  },
};
