import Core from '@clients/common/flyteidl/core';
import isObject from 'lodash/isObject';
import { InputTypeDefinition, InputValue, UnionValue } from '../types';
import { getHelperForInput } from './getHelperForInput';
import { ConverterInput, InputHelper, InputValidatorParams } from './types';
import t from '../../../common/strings';
import { getInputDefintionForLiteralType } from '../utils';
import { Literal } from '../../../../models/Common/types';

export function isScalarType(value: any): value is Literal {
  return isObject(value) && !(value as any).type && !!(value as any).scalar;
}

function getUnionValueFromUnknownLiteral(
  literal: Literal,
  inputTypeDefinition: InputTypeDefinition,
) {
  let currentLiteral = literal;
  if (isScalarType(currentLiteral)) {
    currentLiteral = currentLiteral?.scalar as any as Literal;
  }

  if (currentLiteral) {
    const def = getInputDefintionForLiteralType(currentLiteral as any);
    const inputDefinition =
      inputTypeDefinition?.listOfSubTypes?.find((s) => s.type === def.type) || def;
    const helper = getHelperForInput(inputDefinition.type);
    const value = helper.fromLiteral(literal, inputDefinition);
    const unionValue = {
      value,
      typeDefinition: inputDefinition,
    } as UnionValue;
    return unionValue;
  }

  const { listOfSubTypes } = inputTypeDefinition;
  const values = listOfSubTypes?.map((subtype) => {
    const helper = getHelperForInput(subtype.type);
    try {
      const value = helper.fromLiteral(literal, subtype);

      return { value, typeDefinition: subtype } as UnionValue;
    } catch {
      // no-op
    }
    return { value: undefined, typeDefinition: subtype };
  });

  return values?.filter((v) => v.value)?.[0] || values?.[0];
}

function fromLiteral(literal: Core.ILiteral, inputTypeDefinition: InputTypeDefinition): InputValue {
  const { listOfSubTypes } = inputTypeDefinition;
  if (!listOfSubTypes?.length) {
    throw new Error(t('missingUnionListOfSubType'));
  }

  const localLiteral = literal?.scalar?.union;
  if (localLiteral?.type) {
    const inputDef = getInputDefintionForLiteralType(localLiteral.type as any);

    // Unpack nested variant of union data value
    const literalValue = localLiteral?.value || literal;

    const helper = getHelperForInput(inputDef.type);
    try {
      const value = helper.fromLiteral(literalValue, inputDef);
      return { value, typeDefinition: inputDef } as UnionValue;
    } catch {
      return { value: undefined, typeDefinition: inputDef };
    }
  } else {
    return getUnionValueFromUnknownLiteral(literal as Literal, inputTypeDefinition) as any;
  }
}

function toLiteral({ value, typeDefinition: { listOfSubTypes } }: ConverterInput): Core.ILiteral {
  if (!listOfSubTypes) {
    throw new Error(t('missingUnionListOfSubType'));
  }

  if (!isObject(value)) {
    throw new Error(t('valueMustBeObject'));
  }

  const { value: unionValue, typeDefinition } = value as UnionValue;

  const literal = getHelperForInput(typeDefinition.type).toLiteral({
    value: unionValue,
    typeDefinition,
  } as ConverterInput);
  return {
    scalar: {
      union: {
        value: literal,
        type: typeDefinition.literalType,
      },
    },
  };
}

function validate({ value, ...props }: InputValidatorParams) {
  if (!value) {
    throw new Error(t('valueRequired'));
  }
  if (!isObject(value)) {
    throw new Error(t('valueMustBeObject'));
  }

  try {
    const { typeDefinition: subTypeDefinition } = value as UnionValue;
    getHelperForInput(subTypeDefinition.type).validate({
      required: props.required,
      ...(value as any),
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

export const unionHelper: InputHelper = {
  fromLiteral,
  toLiteral,
  validate,
  typeDefinitionToDefaultValue: (typeDefinition) => {
    const { listOfSubTypes } = typeDefinition;
    const selectedSubType = listOfSubTypes?.[0];
    const subtypeHelper = getHelperForInput(selectedSubType?.type!);

    return {
      value: subtypeHelper.typeDefinitionToDefaultValue(selectedSubType!),
      typeDefinition: selectedSubType,
    };
  },
};
