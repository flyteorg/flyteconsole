import Core from '@clients/common/flyteidl/core';
import get from 'lodash/get';
import has from 'lodash/has';
import { assertNever } from '../../../../common/utils';
import { BlobDimensionality } from '../../../../models/Common/types';
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

export function formatParameterValues(type: InputType, value: any) {
  if (value === undefined) {
    return '';
  }

  if (type === InputType.Struct) {
    return JSON.stringify(value, null, 2);
  }
  return JSON.stringify(value, null, 0).split(',').join(', ');
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
    case InputType.StructuredDataset:
      return true;
    case InputType.Union:
      if (listOfSubTypes?.length) {
        let isSupported = true;
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
      // @ts-ignore
      return false;
  }
}

export function isKeyOfBlobDimensionality(
  value: string | number | symbol,
): value is keyof typeof BlobDimensionality {
  return Object.keys(BlobDimensionality).indexOf(value as any) >= 0;
}
