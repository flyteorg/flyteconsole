import { Core } from 'flyteidl';
import { transformLiteralMap } from '../helpers';

import {
  primitive,
  blob,
  binary,
  schema,
  noneType,
  errorType,
  generic,
  structuredDataset,
  collection,
  map,
} from './helpers/index';
import { getCollection, getMap, getScalar } from './helpers/literalHelpers';

const literalTestCases = {
  scalar: {
    primitive,
    blob,
    binary,
    schema,
    noneType,
    error: errorType,
    generic,
    structuredDataset,
    union: {} as Core.IPrimitive, // TODO: FC#450 ass support for union types
  },
  collection,
  map,
};

describe('scalar literal', () => {
  const scalarTestTypes = Object.keys(literalTestCases?.scalar!);
  scalarTestTypes.map((scalarTestType) => {
    describe(scalarTestType, () => {
      const cases = literalTestCases?.scalar?.[scalarTestType];
      Object.keys(cases || {}).map((testKey) => {
        const { value, expected } = cases?.[testKey]!;

        it(`${testKey}: should return ${expected} for ${value}`, () => {
          const scalar = { result_var: { ...getScalar(value, scalarTestType) } };
          const result = transformLiteralMap(scalar as any);
          expect(result).toEqual(expected);
        });
      });
    });
  });
});

describe('collection literal', () => {
  const cases = literalTestCases?.collection;
  Object.keys(cases || {}).map((testKey) => {
    const { value, expected } = cases?.[testKey]!;

    it(`${testKey}: should return ${expected} for ${value}`, () => {
      const collection = getCollection([value]);

      const result = transformLiteralMap(collection as any);
      expect(result).toEqual(expected);
    });
  });
});

describe('map literal', () => {
  const cases = literalTestCases?.map;
  Object.keys(cases || {}).map((testKey) => {
    const { value, expected } = cases?.[testKey]!;

    it(`${testKey}: should return ${expected} for ${value}`, () => {
      const collection = getMap({ value });

      const result = transformLiteralMap(collection as any);
      expect(result).toEqual(expected);
    });
  });
});
