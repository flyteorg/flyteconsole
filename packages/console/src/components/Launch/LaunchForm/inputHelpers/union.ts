import { Core } from '@flyteorg/flyteidl-types';
import { isObject } from 'lodash';
import { InputTypeDefinition, InputValue, UnionValue } from '../types';
import { getHelperForInput } from './getHelperForInput';
import { ConverterInput, InputHelper, InputValidatorParams } from './types';
import t from '../../../common/strings';
import { getInputDefintionForLiteralType } from '../utils';

function fromLiteral(
  literal: Core.ILiteral,
  inputTypeDefinition: InputTypeDefinition,
): InputValue {
  const { listOfSubTypes } = inputTypeDefinition;
  if (!listOfSubTypes?.length) {
    throw new Error(t('missingUnionListOfSubType'));
  }

  const localLiteral = literal?.scalar?.union || (literal as any);
  const inputDef =
    (localLiteral?.type &&
      getInputDefintionForLiteralType(localLiteral.type as any)) ||
    localLiteral?.typeDefinition;

  // Unpack nested variant of union data value
  const literalValue = localLiteral?.value || literal;

  if (inputDef) {
    const helper = getHelperForInput(inputDef.type);
    try {
      const value = helper.fromLiteral(literalValue, inputDef);
      return { value, typeDefinition: inputDef } as UnionValue;
    } catch {
      // no-op, continue executing
    }
  }

  // else try to guess the type
  const values = listOfSubTypes.map(subtype => {
    const helper = getHelperForInput(subtype.type);
    try {
      const value = helper.fromLiteral(literalValue, subtype);

      return { value, typeDefinition: subtype } as UnionValue;
    } catch {
      // no-op
    }
    return { value: undefined, typeDefinition: subtype };
  });

  return values?.filter(v => v.value)?.[0] || values?.[0];
}

function toLiteral({
  value,
  typeDefinition: { listOfSubTypes },
}: ConverterInput): Core.ILiteral {
  if (!listOfSubTypes) {
    throw new Error(t('missingUnionListOfSubType'));
  }

  if (!isObject(value)) {
    throw new Error(t('valueMustBeObject'));
  }

  const { value: unionValue, typeDefinition } = value as UnionValue;

  const literal = getHelperForInput(typeDefinition.type).toLiteral({
    value: unionValue,
    typeDefinition: typeDefinition,
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
  typeDefinitionToDefaultValue: typeDefinition => {
    const { listOfSubTypes } = typeDefinition;
    const selectedSubType = listOfSubTypes?.[0];
    const subtypeHelper = getHelperForInput(selectedSubType?.type!);

    return {
      value: subtypeHelper.typeDefinitionToDefaultValue(selectedSubType!),
      typeDefinition: selectedSubType,
    };
  },
};
