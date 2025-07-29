import core from '@clients/common/flyteidl/core';
import google from '@clients/common/flyteidl/google';
import entries from 'lodash/entries';
import isNil from 'lodash/isNil';
import { unpack } from 'msgpackr';
import $protobuf from 'protobufjs';

// Convert a JavaScript object to Protobuf Struct
function convertToStruct(obj: any) {
  const struct = new google.protobuf.Struct({
    fields: {},
  });

  entries(obj).forEach(([key, value]) => {
    struct.fields[key] = convertToValue(value);
  });

  return struct;
}

// Convert values to Protobuf Value type
function convertToValue(value: any) {
  const protoValue = new google.protobuf.Value();

  if (Array.isArray(value)) {
    const listValues = value.map(convertToValue);
    protoValue.listValue = new google.protobuf.ListValue({ values: listValues });
  } else if (typeof value === 'object' && value !== null) {
    protoValue.structValue = convertToStruct(value);
  } else if (typeof value === 'string') {
    protoValue.stringValue = value;
  } else if (typeof value === 'number') {
    protoValue.numberValue = value;
  } else if (typeof value === 'boolean') {
    protoValue.boolValue = value;
  } else if (value === null) {
    protoValue.nullValue = google.protobuf.NullValue.NULL_VALUE;
  }

  return protoValue;
}

const originalLiteralDecode = core.Literal.decode;
// Overriding the decode method of Literal to convert msgpack binary literals to protobuf structs
core.Literal.decode = (reader: $protobuf.Reader | Uint8Array, length?: number) => {
  const result = originalLiteralDecode(reader, length);

  if (result?.scalar?.binary?.tag === 'msgpack') {
    // We know that a binary literal with tag 'msgpack' is a STRUCT
    const value = result?.scalar?.binary?.value;
    const msgpackResult = isNil(value) ? value : unpack(value);
    // Convert the msgpack result to a protobuf struct
    const protobufStruct = convertToStruct(msgpackResult);

    return {
      metadata: result.metadata,
      hash: result.hash,
      scalar: {
        generic: protobufStruct,
      },
    } as core.Literal;
  }
  return result;
};

// const _originalBindingDataCollectionDecode = flyteidl.core.BindingData.decode;
core.BindingData.decode = (_reader: $protobuf.Reader | Uint8Array, _length?: number) => {
  // bindings not used anywhere in the code (for now)
  return {};
};
