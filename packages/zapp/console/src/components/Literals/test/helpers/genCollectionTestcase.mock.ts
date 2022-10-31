import { Core } from '@flyteconsole/components';
import { TestCaseList } from '../types';
import { generateBlobType, getPrimitive, getScalarLiteral } from './literalHelpers';

const collection: TestCaseList<Core.ILiteral> = {
  COL_WITH_SCALARTYPE_PRIMITIVE: {
    value: {
      ...getScalarLiteral(getPrimitive('floatValue', 2.1), 'primitive'),
    },
    expected: { result_var: [2.1] },
  },
  COL_WITH_SCALARTYPE_BLOB: {
    value: {
      ...getScalarLiteral(
        generateBlobType('csv', Core.BlobType.BlobDimensionality.SINGLE, '1'),
        'blob',
      ),
    },
    expected: { result_var: [{ type: 'single (csv) blob', uri: '1' }] },
  },
};

export default collection;
