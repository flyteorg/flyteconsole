/* eslint-disable prefer-destructuring */
/* eslint-disable no-redeclare */
import Core from './core';
import { ProtobufStruct } from './protobufTypes';

/* --- BEGIN flyteidl type aliases --- */
/** These are types shared across multiple sections of the data model. Most of
 * map to types found in `flyteidl.core`.
 */

/* It's an ENUM exports, and as such need to be exported as both type and const value */
type SimpleType = Core.SimpleType;
const SimpleType = Core.SimpleType;
type EnumType = Core.EnumType;
const EnumType = Core.EnumType;
type BlobDimensionality = Core.BlobType.BlobDimensionality;
const BlobDimensionality = Core.BlobType.BlobDimensionality;
type SchemaColumnType = Core.SchemaType.SchemaColumn.SchemaColumnType;
const SchemaColumnType = Core.SchemaType.SchemaColumn.SchemaColumnType;

/** Literals */
interface BlobType extends Core.IBlobType {
  dimensionality: BlobDimensionality;
}

/** A Core.ILiteral guaranteed to have all subproperties necessary to specify
 * a Blob.
 */
interface SchemaColumn extends Core.SchemaType.ISchemaColumn {
  name: string;
  type: SchemaColumnType;
}

interface SchemaType extends Core.ISchemaType {
  columns: SchemaColumn[];
}

export interface LiteralType extends Core.ILiteralType {
  blob?: BlobType;
  collectionType?: LiteralType;
  mapValueType?: LiteralType;
  metadata?: ProtobufStruct;
  schema?: SchemaType;
  simple?: SimpleType;
  enumType?: EnumType;
}

/* --- END flyteidl type aliases --- */

export enum InputType {
  Binary = 'BINARY',
  Blob = 'BLOB',
  Boolean = 'BOOLEAN',
  Collection = 'COLLECTION',
  Datetime = 'DATETIME',
  Duration = 'DURATION',
  Error = 'ERROR',
  Enum = 'ENUM',
  Float = 'FLOAT',
  Integer = 'INTEGER',
  Map = 'MAP',
  None = 'NONE',
  Schema = 'SCHEMA',
  String = 'STRING',
  Struct = 'STRUCT',
  Union = 'Union',
  Unknown = 'UNKNOWN',
}

/** Maps nested `SimpleType`s to our flattened `InputType` enum. */
export const simpleTypeToInputType: { [k in SimpleType]: InputType } = {
  [SimpleType.BINARY]: InputType.Binary,
  [SimpleType.BOOLEAN]: InputType.Boolean,
  [SimpleType.DATETIME]: InputType.Datetime,
  [SimpleType.DURATION]: InputType.Duration,
  [SimpleType.ERROR]: InputType.Error,
  [SimpleType.FLOAT]: InputType.Float,
  [SimpleType.INTEGER]: InputType.Integer,
  [SimpleType.NONE]: InputType.None,
  [SimpleType.STRING]: InputType.String,
  [SimpleType.STRUCT]: InputType.Struct,
};

export interface InputTypeDefinition {
  type: InputType;
  subtype?: InputTypeDefinition;
  listOfSubTypes?: InputTypeDefinition[];
}
