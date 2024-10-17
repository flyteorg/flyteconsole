import Core from '@clients/common/flyteidl/core';
import { encode } from '@msgpack/msgpack';
import { TestCaseList } from '../types';

const testJson = {
  test1: 1,
  test2: '2',
  test3: true,
};

const scalarBinaryTestCases: TestCaseList<Core.IBinary> = {
  NORMAL_MSGPACK: {
    value: { value: encode(testJson), tag: 'msgpack' },
    expected: { result_var: { tag: 'msgpack', value: testJson } },
  },
  WITH_VAL: {
    value: { value: new Uint8Array(), tag: 'tag1' },
    expected: { result_var: { tag: 'tag1', value: '(binary data not shown)' } },
  },
  EMPTY_VALUE: {
    value: { tag: 'msgpack' },
    expected: { result_var: { tag: 'msgpack', value: '(empty)' } },
  },
};

export default scalarBinaryTestCases;
