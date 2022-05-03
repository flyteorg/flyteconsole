import {  Protobuf } from 'flyteidl';
import { TestCaseList } from '../types';
import { getIValue } from './literalHelpers';

const nullValueTestcases = {
  WITH_NULL_VAL: {
    value: {
      fields: {
        test_field_name1: {
          nullValue: Protobuf.NullValue.NULL_VALUE,
          kind: 'nullValue',
        },
      } ,
    },
    expected: {
      result_var: { test_field_name1: '(empty)' },
    },
  },
};
const numberValueTestCases = {
  WITH_NUMBER_VAL: {
    value: {
      fields: {
        test_field_name2: {
          numberValue: 1,
          kind: 'numberValue',
        },
      },
    },
    expected: {
      result_var: { test_field_name2: 1 },
    },
  },
  WITH_NUMBER_VAL_NULL: {
    value: {
      fields: {
        test_field_name3: {
          numberValue: null,
          kind: 'numberValue',
        },
      },
    },
    expected: {
      result_var: { test_field_name3: null },
    },
  },
};
const stringValueTestCases = {
  WITH_STRING_VAL: {
    value: {
      fields: {
        test_field_name4: getIValue('stringValue', 'test val'),
      },
    },
    expected: {
      result_var: { test_field_name4: 'test val' },
    },
  },
  WITH_STRING_VAL_NULL: {
    value: {
      fields: {
        test_field_name: getIValue('stringValue', null),
      },
    },
    expected: {
      result_var: { test_field_name: null },
    },
  },
};

const boolValueTestCases = {
  WITH_BOOL_VAL: {
    value: {
      fields: {
        test_field_name: getIValue('boolValue', true),
      },
    },
    expected: {
      result_var: { test_field_name: true },
    },
  },
  WITH_BOOL_VAL_FALSE: {
    value: {
      fields: {
        test_field_name: getIValue('boolValue', false),
      },
    },
    expected: {
      result_var: { test_field_name: false },
    },
  },
  WITH_BOOL_VAL_NULL: {
    value: {
      fields: {
        test_field_name: getIValue('boolValue', null),
      },
    },
    expected: {
      result_var: { test_field_name: null },
    },
  },
};

const structValueTestCases = {
  WITH_STRUCT_VALUE: {
    value: {
      fields: {
        test_struct_name: {
          structValue: {
            fields: {
              struct_string_val_copy:
                stringValueTestCases?.WITH_STRING_VAL?.value?.fields?.test_field_name4,
              struct_bool_val_copy:
                boolValueTestCases?.WITH_BOOL_VAL?.value?.fields?.test_field_name,
            },
          },
          kind: 'structValue',
        },
      },
    },
    expected: {
      result_var: {
        test_struct_name: { struct_string_val_copy: 'test val', struct_bool_val_copy: true },
      },
    },
  },
};

const listValueTestCases = {
  WITH_LIST_VALUE: {
    value: {
      fields: {
        test_list_name: {
          listValue: {
            values: [structValueTestCases.WITH_STRUCT_VALUE.value.fields.test_struct_name],
          },
          kind: 'listValue',
        },
      } ,
    },
    expected: {
      result_var: {
        test_list_name: [{ struct_bool_val_copy: true, struct_string_val_copy: 'test val' }],
      },
    },
  },
};
export default {
  ...nullValueTestcases,
  ...numberValueTestCases,
  ...stringValueTestCases,
  ...boolValueTestCases,
  ...structValueTestCases,
  ...listValueTestCases,
} as any as TestCaseList<Protobuf.Struct>;
