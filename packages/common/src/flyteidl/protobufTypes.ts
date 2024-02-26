import Protobuf from './protobuf';

/** Represents a plain object where string keys map to values of the same type */
type Dictionary<T> = { [k: string]: T };

interface ProtobufValue extends Protobuf.IValue {
  kind: keyof Protobuf.IValue;
}

export interface ProtobufStruct extends Protobuf.IStruct {
  fields: Dictionary<ProtobufValue>;
}
