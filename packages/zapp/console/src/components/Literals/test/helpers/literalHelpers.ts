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
): Core.Primitive | Core.IPrimitive {
  return {
    kind,
    [kind]: value,
  } as any as Protobuf.Value;
}

export function getPrimitive(
  key: 'integer' | 'floatValue' | 'stringValue' | 'boolean' | 'datetime' | 'duration',
  value?: Long | number | string | boolean | Protobuf.ITimestamp | Protobuf.IDuration | null,
): Core.Primitive | Core.IPrimitive {
  return {
    [key]: value,
    value: key,
  } as any as Core.Primitive;
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

// TOP LEVEL SCHEMA GENERATORS:
export const getScalar = (
  value: Core.IPrimitive | Core.IBlob | Core.IBinary,
  scalarType: string,
) => {
  return {
    scalar: {
      [scalarType]: value,
      value: scalarType,
    },
    value: 'scalar',
  } as Core.IScalar;
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
