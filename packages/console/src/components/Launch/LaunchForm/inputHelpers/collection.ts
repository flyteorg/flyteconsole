import { Core } from '@flyteorg/flyteidl-types';
import { InputTypeDefinition } from '../types';
import { literalNone } from './constants';
import { getHelperForInput } from './getHelperForInput';
import { parseJSON } from './parseJson';
import { ConverterInput, InputHelper, InputValidatorParams } from './types';
import { formatType } from '../utils';

const missingSubTypeError = 'Unexpected missing subtype for collection';

export function parseCollection(list: string) {
  const parsed = parseJSON(list);
  if (!Array.isArray(parsed)) {
    throw new Error('Value did not parse to an array');
  }
  return parsed;
}

function fromLiteral(
  literal: Core.ILiteral,
  { subtype }: InputTypeDefinition,
): string {
  if (!subtype) {
    throw new Error(missingSubTypeError);
  }
  if (!literal.collection) {
    throw new Error('Collection literal missing `collection` property');
  }
  if (!literal.collection.literals) {
    throw new Error(
      'Collection literal missing `collection.literals` property',
    );
  }

  const subTypeHelper = getHelperForInput(subtype.type);
  const values = literal.collection.literals.map(literal => {
    let temp = subTypeHelper.fromLiteral(literal, subtype);
    try {
      temp = JSON.parse(temp as string);
    } catch (e) {
      // no-op
    }
    return temp;
  });

  return JSON.stringify(values).split(',').join(', ');
}

function toLiteral({
  value,
  typeDefinition: { subtype },
}: ConverterInput): Core.ILiteral {
  if (!subtype) {
    throw new Error(missingSubTypeError);
  }
  let parsed: any[];
  // If we're processing a nested collection, it may already have been parsed
  if (Array.isArray(value)) {
    parsed = value;
  } else {
    const stringValue = typeof value === 'string' ? value : value.toString();
    if (!stringValue.length) {
      return literalNone();
    }
    parsed = parseCollection(stringValue);
  }

  const helper = getHelperForInput(subtype.type);
  const literals = parsed.map(value =>
    helper.toLiteral({ value, typeDefinition: subtype }),
  );

  return {
    collection: {
      literals,
    },
  };
}

function validate({
  value,
  typeDefinition,
  required,
  ...props
}: InputValidatorParams) {
  if (typeof value !== 'string') {
    throw new Error('Value must be a string');
  }

  try {
    const parsed = parseCollection(value);
    if (!Array.isArray(parsed)) {
      throw new Error(`Value parsed to type: ${typeof parsed}`);
    }
    // validate sub values
    const collectionLiteral = toLiteral({ value, typeDefinition });
    const subtype = typeDefinition!.subtype;
    const subTypeHelper = getHelperForInput(subtype?.type!);
    collectionLiteral.collection!.literals!.map(subLiteral => {
      const value = subTypeHelper.fromLiteral(subLiteral, subtype!);
      subTypeHelper.validate({
        value,
        typeDefinition: subtype,
        required,
        ...props,
      } as any);
    });
  } catch (e) {
    const typeString = formatType(typeDefinition);
    throw new Error(
      `Failed to parse to expected format: ${typeString}. ${e.message}`,
    );
  }
}

export const collectionHelper: InputHelper = {
  fromLiteral,
  toLiteral,
  validate,
  typeDefinitionToDefaultValue: typeDefinition => {
    const { subtype } = typeDefinition;
    const subtypeHelper = getHelperForInput(subtype?.type!);
    const subDefaultValue = subtypeHelper.typeDefinitionToDefaultValue(
      subtype!,
    );
    // debugger;
    const subLiteral = subtypeHelper.toLiteral({
      value: subDefaultValue,
      typeDefinition: subtype!,
    });
    return fromLiteral(
      {
        collection: {
          literals: [subLiteral],
        },
      },
      { subtype: subtype! } as any,
    );
  },
};
