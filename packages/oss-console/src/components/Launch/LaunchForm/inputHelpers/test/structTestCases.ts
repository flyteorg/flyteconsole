import Core from '@clients/common/flyteidl/core';
import Protobuf from '@clients/common/flyteidl/protobuf';

export function structLiteral(generic: Protobuf.IStruct): Core.ILiteral {
  return { scalar: { generic } };
}

const values = {
  stringField: 'aString',
  integerField: 123,
  floatField: 123.456,
  nullField: null,
  booleanTrueField: true,
  booleanFalseField: false,
};

const structValues: { [k in keyof typeof values]: Protobuf.IValue } = {
  stringField: { stringValue: 'aString' },
  integerField: { numberValue: 123 },
  floatField: { numberValue: 123.456 },
  nullField: { nullValue: Protobuf.NullValue.NULL_VALUE },
  booleanTrueField: { boolValue: true },
  booleanFalseField: { boolValue: false },
};

type StructTestCase = [any, Core.ILiteral];
export const structTestCases: StructTestCase[] = [
  [{}, structLiteral({ fields: {} })],
  // simple case with no lists or nested structs
  [{ ...values }, structLiteral({ fields: { ...structValues } })],
  // Nested struct value
  [
    { nestedStruct: { ...values } },
    structLiteral({
      fields: {
        nestedStruct: { structValue: { fields: { ...structValues } } },
      },
    }),
  ],
  // List
  [
    { listField: Object.values(values) },
    structLiteral({
      fields: {
        listField: {
          listValue: { values: Object.values(structValues) },
        },
      },
    }),
  ],
  // Nested struct with list
  [
    { nestedStruct: { listField: Object.values(values) } },
    structLiteral({
      fields: {
        nestedStruct: {
          structValue: {
            fields: {
              listField: {
                listValue: {
                  values: Object.values(structValues),
                },
              },
            },
          },
        },
      },
    }),
  ],
  // List with nested struct
  [
    { listField: [{ ...values }] },
    structLiteral({
      fields: {
        listField: {
          listValue: {
            values: [{ structValue: { fields: { ...structValues } } }],
          },
        },
      },
    }),
  ],
  // List with nested list
  [
    { listField: [Object.values(values)] },
    structLiteral({
      fields: {
        listField: {
          listValue: {
            values: [
              {
                listValue: {
                  values: Object.values(structValues),
                },
              },
            ],
          },
        },
      },
    }),
  ],
];
