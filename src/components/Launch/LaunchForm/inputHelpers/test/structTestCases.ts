import { Core, Protobuf } from 'flyteidl';
import { literalNone } from '../constants';

export function structLiteral(generic: Protobuf.IStruct): Core.ILiteral {
    return { scalar: { generic } };
}

const values = {
    stringField: 'aString',
    integerField: 123,
    floatField: 123.456,
    nullField: null,
    undefinedField: undefined,
    booleanTrueField: true,
    booleanFalseField: false
};

const structValues: { [k in keyof typeof values]: Protobuf.IValue } = {
    stringField: { stringValue: 'aString' },
    integerField: { numberValue: 123 },
    floatField: { numberValue: 123.456 },
    nullField: { nullValue: Protobuf.NullValue.NULL_VALUE },
    undefinedField: { nullValue: Protobuf.NullValue.NULL_VALUE },
    booleanTrueField: { boolValue: true },
    booleanFalseField: { boolValue: false }
};

type StructTestCase = [string, Core.ILiteral];
export const structTestCases: StructTestCase[] = [
    ['{}', structLiteral({})],
    // simple case with no lists or nested structs
    [
        JSON.stringify({ ...values }),
        structLiteral({ fields: { ...structValues } })
    ],
    // Nested struct value
    [
        JSON.stringify({ nestedStruct: { ...values } }),
        structLiteral({
            fields: {
                nestedStruct: { structValue: { fields: { ...structValues } } }
            }
        })
    ],
    // List
    [
        JSON.stringify({ listField: Object.values(values) }),
        structLiteral({
            fields: {
                listField: {
                    listValue: { values: Object.values(structValues) }
                }
            }
        })
    ],
    // Nested struct with list
    [
        JSON.stringify({ nestedStruct: { listField: Object.values(values) } }),
        structLiteral({
            fields: {
                nestedStruct: {
                    structValue: {
                        fields: {
                            listField: {
                                listValue: {
                                    values: Object.values(structValues)
                                }
                            }
                        }
                    }
                }
            }
        })
    ],
    // List with nested struct
    [
        JSON.stringify({ listField: [{ ...values }] }),
        structLiteral({
            fields: {
                listField: {
                    listValue: {
                        values: [
                            { structValue: { fields: { ...structValues } } }
                        ]
                    }
                }
            }
        })
    ],
    // List with nested list
    [
        JSON.stringify({ listField: [[Object.values(values)]] }),
        structLiteral({
            fields: {
                listField: {
                    listValue: {
                        values: [
                            {
                                listValue: {
                                    values: Object.values(structValues)
                                }
                            }
                        ]
                    }
                }
            }
        })
    ]
];
