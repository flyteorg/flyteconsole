import { Core } from 'flyteidl';
import { TestCaseList } from '../types';

export default {
  ERROR_FULL: {
    value: {
      failedNodeId: '1',
      message: 'message 1',
    },
    expected: {
      result_var: { error: 'message 1', nodeId: '1' },
    },
  },
  ERROR_NO_NODE: {
    value: {
      message: 'message 2',
    },
    expected: {
      result_var: { error: 'message 2', nodeId: undefined },
    },
  },
  ERROR_NO_MESSAGE: {
    value: {
      failedNodeId: '3',
    },
    expected: {
      result_var: { error: undefined, nodeId: '3' },
    },
  },
  ERROR_EMPTY: {
    value: {},
    expected: {
      result_var: { error: undefined, nodeId: undefined },
    },
  },
} as TestCaseList<Core.IError>;
