import { Core } from 'flyteidl';
import { TestCaseList } from '../types';
import { generateBlobType, getPrimitive } from './literalHelpers';

const collection = {
  COL_WITH_SCALARTYPE_PRIMITIVE: {
    value: {
      scalar: {
        primitive: getPrimitive('floatValue', 2.1),
        value: 'primitive',
      },
      value: 'scalar',
    },
    expected: { result_var: { value: 2.1 } },
  },
  COL_WITH_SCALARTYPE_BLOB: {
    value: {
      scalar: {
        blob: generateBlobType('csv', Core.BlobType.BlobDimensionality.SINGLE, '1'),
        value: 'blob',
      },
      value: 'scalar',
    },
    expected: { result_var: { value: { type: 'single (csv) blob', uri: '1' } } },
  },
};

export default {
  ...collection,
} as any as TestCaseList<Core.ILiteral>;
