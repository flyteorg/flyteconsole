import Core from '@clients/common/flyteidl/core';
import cloneDeep from 'lodash/cloneDeep';
import mapValues from 'lodash/mapValues';
import Long from 'long';
import { dateToTimestamp, millisecondsToDuration } from '../../../../common/utils';
import {
  BlobDimensionality,
  SimpleType,
  TypedInterface,
  Variable,
} from '../../../../models/Common/types';
import { literalNone } from '../inputHelpers/constants';
import { primitiveLiteral } from './utils';

export function simpleType(primitiveType: SimpleType, description?: string): Variable {
  return {
    description,
    type: {
      simple: primitiveType,
    },
  };
}

export function blobType(dimensionality: BlobDimensionality, description?: string): Variable {
  return {
    description,
    type: {
      blob: {
        dimensionality,
      },
    },
  };
}

export function enumType(values: string[], description?: string): Variable {
  return {
    description,
    type: {
      enumType: {
        values,
      },
    },
  };
}

export function noneType(description?: string): Variable {
  return {
    description,
    type: {
      simple: SimpleType.NONE,
      structure: {
        tag: 'none',
      },
    },
  };
}

export function unionType(types: Variable[], description?: string): Variable {
  return {
    description,
    type: {
      unionType: {
        variants: types.map((t) => t.type),
      },
    },
  };
}

export function collectionType(type: Variable, description?: string): Variable {
  return {
    description,
    type: {
      collectionType: {
        ...type.type,
      },
    },
  };
}

const validDateString = '2019-01-10T00:00:00.000Z'; // Dec 1, 2019

export type SimpleVariableKey =
  | 'simpleString'
  | 'stringNoLabel'
  | 'simpleInteger'
  | 'simpleFloat'
  | 'simpleBoolean'
  | 'simpleBlob'
  | 'simpleDuration'
  | 'simpleDatetime'
  | 'simpleBinary'
  | 'simpleError'
  | 'simpleStruct';

export const mockSimpleVariables: Record<SimpleVariableKey, Variable> = {
  simpleString: simpleType(SimpleType.STRING, 'a simple string value'),
  stringNoLabel: simpleType(SimpleType.STRING),
  simpleInteger: simpleType(SimpleType.INTEGER, 'a simple integer value'),
  simpleFloat: simpleType(SimpleType.FLOAT, 'a simple floating point value'),
  simpleBoolean: simpleType(SimpleType.BOOLEAN, 'a simple boolean value'),
  simpleDuration: simpleType(SimpleType.DURATION, 'a simple duration value'),
  simpleDatetime: simpleType(SimpleType.DATETIME, 'a simple datetime value'),
  simpleBinary: simpleType(SimpleType.BINARY, 'a simple binary value'),
  simpleError: simpleType(SimpleType.ERROR, 'a simple error value'),
  simpleStruct: simpleType(SimpleType.STRUCT, 'a simple struct value'),
  simpleBlob: blobType(BlobDimensionality.SINGLE, 'a simple single-dimensional blob'),
  // schema: {},
  // collection: {},
  // mapValue: {}
};

export const simpleVariableDefaults: Record<SimpleVariableKey, Core.ILiteral> = {
  simpleString: primitiveLiteral({ stringValue: 'abcdefg' }),
  stringNoLabel: primitiveLiteral({ stringValue: 'abcdefg' }),
  simpleBinary: literalNone(),
  simpleBoolean: primitiveLiteral({ boolean: false }),
  simpleDatetime: primitiveLiteral({
    datetime: dateToTimestamp(new Date(validDateString)),
  }),
  simpleDuration: primitiveLiteral({
    duration: millisecondsToDuration(10000),
  }),
  simpleError: literalNone(),
  simpleFloat: primitiveLiteral({ floatValue: 1.5 }),
  simpleInteger: primitiveLiteral({ integer: Long.fromNumber(12345) }),
  simpleStruct: literalNone(),
  simpleBlob: {
    scalar: {
      blob: {
        uri: 's3://someBlobUri/goesHere',
        metadata: {
          type: {
            format: 'csv',
            dimensionality: BlobDimensionality.SINGLE,
          },
        },
      },
    },
  },
};

export const mockCollectionVariables: Record<string, Variable> = mapValues(
  mockSimpleVariables,
  (v) => ({
    description: `A collection of: ${v.description}`,
    type: { collectionType: v.type },
  }),
);

export const mockNestedCollectionVariables: Record<string, Variable> = mapValues(
  mockCollectionVariables,
  (v) => ({
    description: `${v.description} (nested)`,
    type: { collectionType: v.type },
  }),
);

export function createMockInputsInterface(variables: Record<string, Variable>): TypedInterface {
  return {
    inputs: {
      variables: cloneDeep(variables),
    },
  };
}
