import { Core, Protobuf } from 'flyteidl';

export function getIValue(
  kind: 'nullValue' | 'numberValue' | 'stringValue' | 'boolValue' | 'structValue' | 'listValue',
  value?:
    | Protobuf.NullValue
    | number
    | string
    | boolean
    | Protobuf.IStruct
    | Protobuf.IListValue
    | null,
): Protobuf.IValue & Pick<Protobuf.Value, 'kind'> {
  return {
    kind,
    [kind]: value,
  };
}

export function getPrimitive(
  key: 'integer' | 'floatValue' | 'stringValue' | 'boolean' | 'datetime' | 'duration',
  value?: Long | number | string | boolean | Protobuf.ITimestamp | Protobuf.IDuration | null,
): Core.IPrimitive & Pick<Core.Primitive, 'value'> {
  return {
    [key]: value,
    value: key,
  };
}

export function generateBlobType(
  format?: string,
  dimensionality?: Core.BlobType.BlobDimensionality,
  uri?: string,
): Core.IBlob {
  return {
    metadata: {
      type: {
        format,
        dimensionality,
      },
    },
    uri,
  };
}

const getScalar = (
  value:
    | Core.IPrimitive
    | Core.IBlob
    | Core.IBinary
    | Core.ISchema
    | Core.IVoid
    | Core.IError
    | Protobuf.IStruct
    | Core.IStructuredDataset
    | Core.IUnion,
  scalarType: any,
): Core.IScalar & Pick<Core.Scalar, 'value'> => {
  return {
    [scalarType]: value,
    value: scalarType,
  };
};

// TOP LEVEL SCHEMA GENERATORS:
export const getScalarLiteral = (
  value:
    | Core.IPrimitive
    | Core.IBlob
    | Core.IBinary
    | Core.ISchema
    | Core.IVoid
    | Core.IError
    | Protobuf.IStruct
    | Core.IStructuredDataset
    | Core.IUnion,
  scalarType: any,
): Core.ILiteral & Pick<Core.Literal, 'value' | 'scalar'> => {
  return {
    scalar: getScalar(value, scalarType),
    value: 'scalar',
  };
};

export const getCollection = (literals: Core.ILiteral[]) => {
  return {
    result_var: {
      collection: {
        literals,
      },
      value: 'collection',
    } as Core.ILiteralCollection,
  };
};

export const getMap = (literals: { [k: string]: Core.ILiteral } | null) => {
  return {
    result_var: {
      map: {
        literals,
      },
      value: 'map',
    } as Core.ILiteralMap,
  };
};
