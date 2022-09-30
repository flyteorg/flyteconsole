import { assertNever, stringifyValue } from 'common/utils';
import { Core } from 'flyteidl';
import { get, has } from 'lodash';
import { BlobDimensionality } from 'models/Common/types';
import { InputType, InputTypeDefinition } from '../types';

/** Performs a deep get of `path` on the given `Core.ILiteral`. Will throw
 * if the given property doesn't exist.
 */
export function extractLiteralWithCheck<T>(literal: Core.ILiteral, path: string): T {
  if (!has(literal, path)) {
    throw new Error(`Failed to extract literal value with path ${path}`);
  }
  return get(literal, path) as T;
}

/** Converts a value within a collection to the appropriate string
 * representation. Some values require additional quotes.
 */
export function collectionChildToString(type: InputType, value: any) {
  if (value === undefined) {
    return '';
  }
  return type === (InputType.Integer || InputType.Struct) ? `${value}` : stringifyValue(value);
}

/** Determines if a given input type, including all levels of nested types, is
 * supported for use in the Launch form.
 */
export function typeIsSupported(typeDefinition: InputTypeDefinition): boolean {
  const { type, subtype, listOfSubTypes } = typeDefinition;
  switch (type) {
    case InputType.Binary:
    case InputType.Error:
    case InputType.Unknown:
      return false;
    case InputType.None:
    case InputType.Boolean:
    case InputType.Blob:
    case InputType.Datetime:
    case InputType.Duration:
    case InputType.Enum:
    case InputType.Float:
    case InputType.Integer:
    case InputType.Schema:
    case InputType.String:
    case InputType.Struct:
      return true;
    case InputType.Union:
      if (listOfSubTypes?.length) {
        var isSupported = true;
        listOfSubTypes.forEach((subtype) => {
          if (!typeIsSupported(subtype)) {
            isSupported = false;
          }
        });
        return isSupported;
      }
      return false;
    case InputType.Map:
      if (!subtype) {
        return false;
      }
      return typeIsSupported(subtype);
    case InputType.Collection: {
      if (!subtype) {
        console.error('Unexpected missing subtype for collection input', typeDefinition);
        return false;
      }
      return typeIsSupported(subtype);
    }
    default:
      // This will cause a compiler error if new types are added and there is
      // no case for them listed above.
      assertNever(type, { noThrow: true });
      return false;
  }
}

export function isKeyOfBlobDimensionality(value: string): value is keyof typeof BlobDimensionality {
  return Object.keys(BlobDimensionality).indexOf(value) >= 0;
}
