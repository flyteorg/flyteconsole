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
  UNSUPPORTED_TAG: {
    value: { tag: 'tag2', value: new Uint8Array([1, 2, 3, 4]) },
    expected: { result_var: {
      tag: "tag2",
      value: "(unsupported tag type)",
    }},
  },
  EMPTY_VALUE: {
    value: { tag: 'msgpack' },
    expected: { result_var: { tag: 'msgpack', value: "(empty)" } },
  }
};

export default scalarBinaryTestCases;
