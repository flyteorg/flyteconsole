import Core from '@clients/common/flyteidl/core';
import { TestCaseList } from '../types';

const scalarNoneTestCase: TestCaseList<Core.IVoid> = {
  VOID_TYPE: {
    value: {},
    expected: {
      result_var: '(empty)',
    },
  },
};

export default scalarNoneTestCase;
