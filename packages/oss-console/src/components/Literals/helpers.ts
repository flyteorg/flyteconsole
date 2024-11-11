'use client';

/* eslint-disable no-use-before-define */
import Protobuf from '@clients/common/flyteidl/protobuf';
import Core from '@clients/common/flyteidl/core';
import Long from 'long';
import cloneDeep from 'lodash/cloneDeep';
import has from 'lodash/has';
import isNil from 'lodash/isNil';
import { formatDateUTC, protobufDurationToHMS } from '../../common/formatters';
import { timestampToDate } from '../../common/utils';
import { BlobDimensionality, SchemaColumnType } from '../../models/Common/types';
import { asValueWithKind } from '../Launch/LaunchForm/inputHelpers/struct';

const DEFAULT_UNSUPPORTED = 'This type is not yet supported';

// PRIMITIVE
function processPrimitive(primitive?: (Core.IPrimitive & Pick<Core.Primitive, 'value'>) | null) {
  if (!primitive) {
    return 'invalid primitive';
  }

  if (has(primitive, 'datetime')) {
    return formatDateUTC(timestampToDate(primitive.datetime as Protobuf.Timestamp));
  }

  if (has(primitive, 'duration')) {
    return protobufDurationToHMS(primitive.duration as Protobuf.Duration);
  }
  if (has(primitive, 'integer')) {
    return Long.fromValue(primitive.integer as Long).toNumber();
  }
  if (has(primitive, 'boolean')) {
    return primitive.boolean;
  }
  if (has(primitive, 'floatValue')) {
    return primitive.floatValue;
  }
  if (has(primitive, 'stringValue')) {
    return `${primitive.stringValue}`;
  }
  return 'unknown';
}

// BLOB
const dimensionalityStrings: Record<BlobDimensionality, string> = {
  [BlobDimensionality.SINGLE]: 'single',
  [BlobDimensionality.MULTIPART]: 'multi-part',
};

function processBlobType(blobType?: Core.IBlobType | null) {
  if (!blobType) {
    return 'invalid blob type';
  }

  const formatString = blobType.format ? ` (${blobType.format})` : '';
  const { dimensionality } = blobType;
  const dimensionalityString =
    dimensionality !== null && dimensionality !== undefined
      ? dimensionalityStrings[dimensionality]
      : '';
  const typeString = `${dimensionalityString}${formatString}`;

  return `${typeString} blob`;
}

function processBlob(blob?: Core.IBlob | null) {
  if (!blob) {
    return 'invalid blob';
  }

  const type = blob.metadata?.type;

  return {
    type: processBlobType(type),
    uri: blob.uri,
  };
}

// BINARY
function processBinary(binary?: Core.IBinary | null) {
  const tag = binary?.tag;

  if (!tag) {
    return 'invalid binary';
  }

  return {
    tag: `${tag} (binary data not shown)`,
  };
}

// SCHEMA
export function columnTypeToString(type?: SchemaColumnType | null) {
  switch (type) {
    case SchemaColumnType.BOOLEAN:
      return 'boolean';
    case SchemaColumnType.DATETIME:
      return 'datetime';
    case SchemaColumnType.DURATION:
      return 'duration';
    case SchemaColumnType.FLOAT:
      return 'float';
    case SchemaColumnType.INTEGER:
      return 'integer';
    case SchemaColumnType.STRING:
      return 'string';
    default:
      return 'unknown';
  }
}

function processSchemaType(schemaType?: Core.ISchemaType | null, shortString = false) {
  const columns =
    schemaType?.columns?.length &&
    schemaType.columns.map((column) => {
      return shortString
        ? `${columnTypeToString(column.type)}`
        : `${column.name} (${columnTypeToString(column.type)})`;
    });

  return columns;
}

function processSchema(schema?: Core.ISchema | null) {
  if (!schema) {
    return 'invalid schema';
  }

  const { uri } = schema;
  const columns = processSchemaType(schema.type);

  return {
    ...(uri && { uri }),
    ...(columns && { columns }),
  };
}

// NONE
/* eslint-disable @typescript-eslint/no-unused-vars */
function processNone(none?: Core.IVoid | null) {
  return '(empty)';
}

// TODO: FC#450 poor support for union types
function processUnionType(union?: Core.IUnionType | null, shortString = false) {
  return DEFAULT_UNSUPPORTED;
}

function processUnion(union: Core.IUnion) {
  return { union: processLiteral(union.value!) };
}
/* eslint-enable @typescript-eslint/no-unused-vars */

// ERROR
function processError(error?: Core.IError | null) {
  return {
    error: error?.message,
    nodeId: error?.failedNodeId,
  };
}

function processProtobufStructValue(struct?: Protobuf.IStruct | null) {
  if (!struct) {
    return 'invalid generic struct value';
  }

  const fields = struct?.fields;
  const res =
    fields &&
    Object.keys(fields)
      .map((v) => {
        return { [v]: processGenericValue(fields[v]) };
      })
      .reduce((acc, v) => ({ ...acc, ...v }), {});

  return res;
}

function processGenericValue(value: Protobuf.IValue & Pick<Protobuf.Value, 'kind'>) {
  const finalValue = asValueWithKind(value);
  const { kind } = finalValue;

  switch (kind) {
    case 'nullValue':
      return '(empty)';
    case 'listValue': {
      const list = finalValue.listValue;
      return list?.values?.map((x) => processGenericValue(x));
    }
    case 'structValue':
      return processProtobufStructValue(finalValue?.structValue);
    case 'numberValue':
    case 'stringValue':
    case 'boolValue':
      return finalValue[kind];
    default:
      return 'unknown';
  }
}

function processGeneric(struct?: Protobuf.IStruct | null) {
  if (!struct || !struct?.fields) {
    return null;
  }

  const { fields } = struct;
  const mapContent = Object.keys(fields)
    .map((key) => {
      const value = fields[key];
      return { [key]: processGenericValue(value) };
    })
    .reduce((acc, v) => {
      return { ...acc, ...v };
    }, {});

  return mapContent;
}

// SIMPLE
export function processSimpleType(simpleType?: Core.SimpleType | null) {
  switch (simpleType) {
    case Core.SimpleType.NONE:
      return 'none';
    case Core.SimpleType.INTEGER:
      return 'integer';
    case Core.SimpleType.FLOAT:
      return 'float';
    case Core.SimpleType.STRING:
      return 'string';
    case Core.SimpleType.BOOLEAN:
      return 'booleam';
    case Core.SimpleType.DATETIME:
      return 'datetime';
    case Core.SimpleType.DURATION:
      return 'duration';
    case Core.SimpleType.BINARY:
      return 'binary';
    case Core.SimpleType.ERROR:
      return 'error';
    case Core.SimpleType.STRUCT:
      return 'struct';
    default:
      return 'unknown';
  }
}

function processEnumType(enumType?: Core.IEnumType | null) {
  return enumType?.values || [];
}

function processLiteralType(
  literalType?: (Core.ILiteralType & Pick<Core.LiteralType, 'type'>) | null,
) {
  const type = literalType?.type;

  if (has(literalType, 'simple')) {
    return processSimpleType(literalType?.simple);
  }
  if (has(literalType, 'schema')) {
    return `schema (${processSchemaType(literalType?.schema, true)})`;
  }
  if (has(literalType, 'collectionType')) {
    return `collection of ${processLiteralType(literalType?.collectionType)}`;
  }
  if (has(literalType, 'mapValueType')) {
    return `map value of ${processLiteralType(literalType?.mapValueType)}`;
  }
  if (has(literalType, 'blob')) {
    return processBlobType(literalType?.blob);
  }
  if (has(literalType, 'enumType')) {
    return `enum (${processEnumType(literalType?.enumType)})`;
  }
  if (has(literalType, 'structuredDatasetType')) {
    return processStructuredDatasetType(literalType?.structuredDatasetType);
  }
  if (has(literalType, 'unionType')) {
    return processUnionType(literalType?.unionType, true);
  }
  return DEFAULT_UNSUPPORTED;
}

function processStructuredDatasetType(structuredDatasetType?: Core.IStructuredDatasetType | null) {
  if (!structuredDatasetType) {
    return {};
  }

  const { columns, format } = structuredDatasetType;
  const processedColumns =
    columns?.length &&
    columns
      .map(({ name, literalType }) => [name, processLiteralType(literalType)])
      .reduce((acc, v) => {
        // eslint-disable-next-line prefer-destructuring
        acc[v[0]] = v[1];
        return acc;
      }, []);

  return {
    ...(format && { format }),
    ...(processedColumns && { columns: processedColumns }),
  };
}

function processStructuredDataset(structuredDataSet?: Core.IStructuredDataset | null) {
  if (!structuredDataSet) {
    return DEFAULT_UNSUPPORTED;
  }

  const retJson = {} as any;
  const { uri, metadata } = structuredDataSet;

  if (uri) {
    retJson.uri = uri;
  }

  const structuredDatasetType = processStructuredDatasetType(metadata?.structuredDatasetType);

  return {
    ...(uri && { uri }),
    ...structuredDatasetType,
  };
}

function processScalar(scalar?: (Core.IScalar & Pick<Core.Scalar, 'value'>) | null) {
  if (has(scalar, 'primitive')) {
    return processPrimitive(scalar?.primitive);
  }

  if (has(scalar, 'blob')) {
    return processBlob(scalar?.blob);
  }
  if (has(scalar, 'binary')) {
    return processBinary(scalar?.binary);
  }
  if (has(scalar, 'schema')) {
    return processSchema(scalar?.schema);
  }
  if (has(scalar, 'noneType')) {
    return processNone(scalar?.noneType);
  }
  if (has(scalar, 'error')) {
    return processError(scalar?.error);
  }
  if (has(scalar, 'generic')) {
    return processGeneric(scalar?.generic);
  }
  if (has(scalar, 'structuredDataset')) {
    return processStructuredDataset(scalar?.structuredDataset);
  }
  if (has(scalar, 'union')) {
    return processUnion(scalar?.union as Core.IUnion);
  }

  return DEFAULT_UNSUPPORTED;
}

function processCollection(collection?: Core.ILiteralCollection | null, mapTaskIndex?: number) {
  let literals = collection?.literals;

  if (!literals) {
    return 'invalid collection';
  }

  if (mapTaskIndex !== undefined && !Number.isNaN(mapTaskIndex)) {
    literals = (literals || []).splice(mapTaskIndex!, 1);
  }

  return literals?.map((literal) => processLiteral(literal, mapTaskIndex));
}

function processMap(map?: Core.ILiteralMap | null, mapTaskIndex?: number) {
  const literals = map?.literals;

  if (!literals) {
    return 'invalid map';
  }

  return transformLiterals(literals, mapTaskIndex);
}

function processOffloadedLiteral(
  offloadedLiteral?: Core.ILiteralOffloadedMetadata | null,
  mapTaskIndex?: number,
) {
  const uri = offloadedLiteral?.uri;

  if (isNil(uri) || uri === '') {
    return 'invalid offloaded literal';
  }

  return {
    offloaded_uri: uri,
  };
}

function processLiteral(literal?: Core.ILiteral, mapTaskIndex?: number): any {
  if (!literal) {
    return 'invalid literal';
  }

  if (has(literal, 'scalar')) {
    return processScalar(literal.scalar);
  }

  if (has(literal, 'collection')) {
    return processCollection(literal.collection, mapTaskIndex);
  }

  if (has(literal, 'map')) {
    return processMap(literal.map, mapTaskIndex);
  }

  if (has(literal, 'offloadedMetadata')) {
    return processOffloadedLiteral(literal.offloadedMetadata, mapTaskIndex);
  }
  return DEFAULT_UNSUPPORTED;
}

export function transformLiterals(json: { [k: string]: Core.ILiteral }, mapTaskIndex?: number) {
  const literals = cloneDeep(json);
  const obj = Object.entries(literals)
    .map(([key, literal]) => ({
      [key]: processLiteral(literal, mapTaskIndex),
    }))
    .reduce(
      (acc, cur) => ({
        ...acc,
        ...cur,
      }),
      {},
    );

  return obj;
}
