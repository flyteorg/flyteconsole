import { Core } from 'flyteidl';
import { TestCaseList } from '../types';

export default {
  VOID_TYPE: {
    value: {},
    expected: {
      result_var: '(empty)',
    },
  },
} as TestCaseList<Core.IVoid>;
