import { formatDateUTC, protobufDurationToHMS } from 'common/formatters';
import { sortedObjectEntries, timestampToDate } from 'common/utils';
import { Core } from 'flyteidl';
import {
  BlobDimensionality,
  ProtobufListValue,
  ProtobufStruct,
  ProtobufValue,
  SchemaColumnType,
} from 'models/Common/types';

// PRIMITIVE
function processPrimitive(primitive: Core.IPrimitive) {
  const type = (primitive as Core.Primitive).value!;
  switch (type) {
    case 'datetime':
      return formatDateUTC(timestampToDate(primitive.datetime!));
    case 'duration':
      return protobufDurationToHMS(primitive.duration!);
    case 'boolean':
    case 'floatValue':
      return primitive[type];
    case 'integer':
      return +`${primitive[type]}`;
    case 'stringValue':
    default:
      return `${primitive[type]}`;
  }
}

// BLOB
const dimensionalityStrings: Record<BlobDimensionality, string> = {
  [BlobDimensionality.SINGLE]: 'single',
  [BlobDimensionality.MULTIPART]: 'multi-part',
};

function processBlobType(blobType: Core.IBlobType, typePrefix: string = '') {
  const formatString = blobType && blobType.format ? ` (${blobType.format})` : '';
  const typeString = `${dimensionalityStrings[blobType!.dimensionality!]}${formatString}`;

  return `${typePrefix}${typeString} blob`;
}

function processBlob(blob: Core.IBlob | Core.Blob) {
  const type = blob?.metadata?.type;

  return {
    type: processBlobType(type!),
    uri: blob.uri,
  };
}

// BINARY
function processBinary(binary: Core.IBinary) {
  return {
    tag: `${binary?.tag!} (binary data not shown)`,
  };
}

// SCHEMA
function columnTypeToString(type: SchemaColumnType) {
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

function processSchemaType(schemaType: Core.ISchemaType) {
  let columns;
  if (schemaType?.columns?.length) {
    columns = schemaType?.columns.map(
      (column) => `${column.name!} (${columnTypeToString(column.type!)})`,
    );
  }

  return columns;
}

function processSchema(schema: Core.ISchema) {
  const columns = processSchemaType(schema?.type!);

  return {
    uri: schema.uri,
    ...(columns && { columns }),
  };
}

// NONE
/* eslint-disable @typescript-eslint/no-unused-vars */
function processNone(none?: Core.IVoid) {
  return '(empty)';
}

function processUnionType(union: Core.IUnionType) {
  return 'This type is not yet supported';
}

function processUnion(union: Core.IUnion) {
  return 'This type is not yet supported';
}
/* eslint-enable @typescript-eslint/no-unused-vars */

// ERROR
function processError(error: Core.IError) {
  return {
    error: error.message,
    nodeId: error.failedNodeId,
  };
}

// GENERIC -- not done
function processProtobufStructValue(struct: ProtobufStruct) {
  const { fields } = struct;
  const res = Object.keys(fields)
    .map((v) => {
      return { [v]: processProtobufValue(fields[v]) };
    })
    .reduce((acc, v) => ({ ...acc, ...v }), {});

  return res;
}
function processProtobufValue(value: ProtobufValue) {
  switch (value.kind) {
    case 'nullValue':
      return '(empty)';
    case 'listValue': {
      const list = value.listValue as ProtobufListValue;
      return list?.values?.map((x) => processProtobufValue(x));
    }
    case 'structValue':
      return processProtobufStructValue(value?.structValue as ProtobufStruct);
    case 'stringValue':
      return `${value[value.kind]}`;
    default:
      return value[value.kind];
  }
}
function processGeneric(struct: ProtobufStruct) {
  const { fields } = struct;
  const mapContent = Object.keys(fields)
    .map((key) => {
      const value = fields[key];
      return { [key]: processProtobufValue(value) };
    })
    .reduce((acc, v) => {
      return { ...acc, ...v };
    }, {} as any);

  return mapContent;
}

// SIMPLE
function processSimpleType(simpleType: Core.SimpleType, typePrefix: string = '') {
  let returnString = '';
  switch (simpleType) {
    case Core.SimpleType.NONE:
      returnString = 'none';
      break;
    case Core.SimpleType.INTEGER:
      returnString = 'integer';
      break;
    case Core.SimpleType.FLOAT:
      returnString = 'float';
      break;
    case Core.SimpleType.STRING:
      returnString = 'string';
      break;
    case Core.SimpleType.BOOLEAN:
      returnString = 'booleam';
      break;
    case Core.SimpleType.DATETIME:
      returnString = 'datetime';
      break;
    case Core.SimpleType.DURATION:
      returnString = 'duration';
      break;
    case Core.SimpleType.BINARY:
      returnString = 'binary';
      break;
    case Core.SimpleType.ERROR:
      returnString = 'error';
      break;
    case Core.SimpleType.STRUCT:
      returnString = 'struct';
      break;
  }
  return `${typePrefix}${returnString}`;
}

function processEnumType(enumType: Core.IEnumType) {
  return enumType?.values || [];
}

function processLiteralType(literalType: Core.ILiteralType, typePrefix: string = '') {
  const type = (literalType as Core.LiteralType)?.type;

  switch (type) {
    case 'simple':
      return processSimpleType(literalType?.simple!, typePrefix);
    case 'schema':
      return processSchemaType(literalType?.schema!);
    case 'collectionType':
      return processLiteralType(literalType?.collectionType!, (typePrefix = 'collection of '));
    case 'mapValueType':
      return processLiteralType(literalType?.mapValueType!, typePrefix);
    case 'blob':
      return processBlobType(literalType?.blob!, typePrefix);
    case 'enumType':
      return processEnumType(literalType?.enumType!);
    case 'structuredDatasetType':
      return processStructuredDatasetType(literalType?.structuredDatasetType!);
    case 'unionType':
      return processUnionType(literalType?.unionType!);
    default:
      return 'This type is not yet supported';
  }
}

function processStructuredDatasetType(structuredDatasetType: Core.IStructuredDatasetType) {
  const retJson = {} as any;

  const { columns, format } = structuredDatasetType;

  if (format) {
    retJson.format = format;
  }

  if (columns && (columns as Core.StructuredDatasetType.IDatasetColumn[])?.length) {
    retJson.columns = columns
      .map(({ name, literalType }) => [name, processLiteralType(literalType!)])
      .reduce((acc, v) => {
        acc[v[0]] = v[1];
        return acc;
      }, []);
  }

  return retJson;
}

function processStructuredDataset(structuredDataSet: Core.IStructuredDataset) {
  const retJson = {} as any;
  const { uri, metadata } = structuredDataSet;

  if (uri) {
    retJson.uri = uri;
  }

  const structuredDatasetType = metadata?.structuredDatasetType!;

  return {
    ...retJson,
    ...processStructuredDatasetType(structuredDatasetType),
  };
}


function processScalar(scalar: Core.Scalar | Core.IScalar) {
  const type = (scalar as Core.Scalar).value;
  const value = scalar[type!];

  switch (type) {
    case 'primitive':
      return processPrimitive(value as Core.IPrimitive);
    case 'blob':
      return processBlob(value as Core.IBlob);
    case 'binary':
      return processBinary(value as Core.IBinary);
    case 'schema':
      return processSchema(value as Core.ISchema);
    case 'noneType':
      return processNone(value as Core.IVoid);
    case 'error':
      return processError(value as Core.IError);
    case 'generic':
      return processGeneric(value as ProtobufStruct);
    case 'structuredDataset':
      return processStructuredDataset(value as Core.IStructuredDataset);
    case 'union':
      return processUnion(value as Core.IUnion);
    default:
      return 'This type is not yet supported';
  }
}

function processCollection(collection: Core.ILiteralCollection) {
  return collection?.literals?.map((literal) => processLiteralValue(literal));
}

function processMap(map: Core.ILiteralMap) {
  return transformLiteralMap(map.literals as Core.ILiteralMap);
}

export function processLiteralValue(literal: Core.ILiteral) {
  const type = (literal as Core.Literal).value;
  switch (type) {
    case 'scalar':
      return processScalar(literal.scalar!);
    case 'collection':
      return processCollection(literal.collection!);
    case 'map':
      return processMap(literal.map!);
    default:
      return 'unknown type';
  }
}

export function transformLiteralMap(json: Core.ILiteralMap) {
  const obj = sortedObjectEntries(json as any)
    .map(([key, literal]) => ({
      [key]: processLiteralValue(literal as any as Core.Literal),
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
