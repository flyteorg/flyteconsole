import Admin from '@clients/common/flyteidl/admin';
import Core from '@clients/common/flyteidl/core';
import Protobuf from '@clients/common/flyteidl/protobuf';

/* --- BEGIN flyteidl type aliases --- */
/** These are types shared across multiple sections of the data model. Most of
 * map to types found in `flyteidl.core`.
 */

/* It's an ENUM exports, and as such need to be exported as both type and const value */
/* eslint-disable @typescript-eslint/no-redeclare */
export type SimpleType = Core.SimpleType;
export const { SimpleType } = Core;
export type NoneType = Core.Void;
export const NoneType = Core.Void;
export type EnumType = Core.EnumType;
export const { EnumType } = Core;
export type FixedRateUnit = Admin.FixedRateUnit;
export const { FixedRateUnit } = Admin;
export type ResourceType = Core.ResourceType;
export const { ResourceType } = Core;
export type BlobDimensionality = Core.BlobType.BlobDimensionality;
export const { BlobDimensionality } = Core.BlobType;
export type SchemaColumnType = Core.SchemaType.SchemaColumn.SchemaColumnType;
export const { SchemaColumnType } = Core.SchemaType.SchemaColumn;
export type MessageFormat = Core.TaskLog.MessageFormat;
export const { MessageFormat } = Core.TaskLog;
export type StructuredDatasetType = Core.StructuredDatasetType;
export const { StructuredDatasetType } = Core;
export type UnionType = Core.UnionType;
export const { UnionType } = Core;
export type AnnotationType = Core.TypeAnnotation;
export const AnnotationType = Core.TypeAnnotation;
export type StructureType = Core.TypeStructure;
export const StructureType = Core.TypeStructure;
export type DatasetColumn = Core.StructuredDatasetType.DatasetColumn;
export const { DatasetColumn } = Core.StructuredDatasetType;
/* eslint-enable @typescript-eslint/no-redeclare */

export type Alias = Core.IAlias;
export type Binding = Core.IBinding;
export type Container = Core.IContainer;

export interface Identifier extends Core.IIdentifier {
  resourceType?: ResourceType;
  project: string;
  domain: string;
  name: string;
  version: string;
  org?: string;
}

export type NamedEntityIdentifier = Omit<
  RequiredNonNullable<Admin.INamedEntityIdentifier>,
  'org'
> & {
  org?: string;
};

export interface ResourceIdentifier extends NamedEntityIdentifier {
  resourceType: Core.ResourceType;
}

export type NamedEntityMetadata = RequiredNonNullable<Admin.INamedEntityMetadata>;

export interface NamedEntity extends Admin.INamedEntity {
  resourceType: Core.ResourceType;
  id: NamedEntityIdentifier;
  metadata: NamedEntityMetadata;
}
export type Notification = Admin.INotification;
export type RetryStrategy = Core.IRetryStrategy;
export type RuntimeMetadata = Core.IRuntimeMetadata;
export type Schedule = Admin.ISchedule;

export interface TaskLog extends Core.ITaskLog {
  name: string;
  uri: string;
}

/** Literals */
export type Binary = RequiredNonNullable<Core.IBinary>;

export interface Blob extends Core.IBlob {
  metadata: BlobMetadata;
  uri: string;
}

export interface BlobMetadata extends Core.IBlobMetadata {
  type: BlobType;
}

export interface BlobType extends Core.IBlobType {
  dimensionality: BlobDimensionality;
}
export type UrlBlob = Admin.IUrlBlob;

export type Error = RequiredNonNullable<Core.IError>;

export interface Literal extends Core.Literal {
  value: 'scalar' | 'collection' | 'map';
  collection?: Core.ILiteralCollection;
  map?: Core.ILiteralMap;
  scalar?: Scalar;
  hash: string;
}

export type LiteralCollection = RequiredNonNullable<Core.ILiteralCollection>;

/* eslint-disable @typescript-eslint/no-redeclare */
export type LiteralMap = RequiredNonNullable<Core.ILiteralMap>;
export const { LiteralMap } = Core;
/* eslint-enable @typescript-eslint/no-redeclare */

export interface LiteralMapBlob extends Admin.ILiteralMapBlob {
  values: LiteralMap;
}

export interface Scalar extends Core.IScalar {
  primitive?: Primitive;
  value: keyof Core.IScalar;
}
export interface BlobScalar extends Core.IScalar {
  blob: Blob;
}

export interface Schema extends Core.ISchema {
  uri: string;
  type: SchemaType;
}

export interface SchemaColumn extends Core.SchemaType.ISchemaColumn {
  name: string;
  type: SchemaColumnType;
}

export interface SchemaType extends Core.ISchemaType {
  columns: SchemaColumn[];
}

export interface Primitive extends Core.Primitive {
  value: keyof Core.IPrimitive;
}

export interface ProtobufListValue extends Protobuf.IListValue {
  values: ProtobufValue[];
}

export interface ProtobufStruct extends Protobuf.IStruct {
  fields: Dictionary<ProtobufValue>;
}

export interface ProtobufValue extends Protobuf.IValue {
  kind: keyof Protobuf.IValue;
}

export interface TypedInterface extends Core.ITypedInterface {
  inputs?: VariableMap;
  outputs?: VariableMap;
}

export interface LiteralType extends Core.ILiteralType {
  simple?: SimpleType;
  schema?: SchemaType;
  collectionType?: LiteralType;
  mapValueType?: LiteralType;
  blob?: BlobType;
  enumType?: EnumType;
  structuredDatasetType?: StructuredDatasetType;
  unionType?: UnionType;
  metadata?: ProtobufStruct;
  annotationType?: AnnotationType;
  structure?: StructureType;
  noneType?: NoneType;
}

export interface Variable extends Core.IVariable {
  type: LiteralType;
  description?: string;
}
export interface VariableMap extends Core.IVariableMap {
  variables: Record<string, Variable>;
}

export interface Parameter extends Core.IParameter {
  var: Variable;
  default?: Literal | null;
  required?: boolean;
}

export interface ParameterMap extends Core.IParameterMap {
  parameters: Record<string, Parameter>;
}

/* --- END flyteidl type aliases --- */

export interface ProjectIdentifierScope {
  project: string;
}

export interface DomainIdentifierScope extends ProjectIdentifierScope {
  domain: string;
}

export interface NameIdentifierScope extends DomainIdentifierScope {
  name: string;
}

export type IdentifierScope =
  | ProjectIdentifierScope
  | DomainIdentifierScope
  | NameIdentifierScope
  | Identifier;

export interface UserProfile {
  subject: string;
  name: string;
  preferredUsername: string;
  givenName: string;
  familyName: string;
  email: string;
  picture: string;
}

export type StatusString = 'normal' | 'degraded' | 'down';

export interface SystemStatus {
  message?: string;
  status: StatusString;
}

export interface GetVersionResponse extends Admin.GetVersionResponse {
  controlPlaneVersion: Admin.IVersion | null;
}
