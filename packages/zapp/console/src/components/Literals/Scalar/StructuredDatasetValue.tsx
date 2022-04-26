import {
  SimpleType,
  StructuredDataset,
  StructuredDatasetColumn,
  StructuredDatasetColumnType,
} from 'models/Common/types';
import * as React from 'react';
import { PrintList } from '../PrintList';
import { PrintValue } from '../PrintValue';
import { useLiteralStyles } from '../styles';
import { ValueLabel } from '../ValueLabel';

function getSimpleTypeDisplayValue(type: SimpleType) {
  switch (type) {
    case SimpleType.NONE:
      return 'none';
    case SimpleType.INTEGER:
      return 'integer';
    case SimpleType.FLOAT:
      return 'float';
    case SimpleType.STRING:
      return 'string';
    case SimpleType.DATETIME:
      return 'datetime';
    case SimpleType.DURATION:
      return 'duration';
    case SimpleType.BINARY:
      return 'binary';
    case SimpleType.ERROR:
      return 'error';
    case SimpleType.STRUCT:
      return 'struct';
    default:
      return 'unknown';
  }
}

function getLiteralTypeDisplayValue(literalType: any) {
  switch (literalType?.type) {
    case 'schema':
      return 'schema';
    case 'mapValueType':
      return 'mapValue';
    case 'enumType':
      return 'enum';
    case 'structuredDatasetType':
      return 'structuredDataset';
    case 'unionType':
      return 'union';
    case 'blob':
    case 'metadata':
    case 'annotation':
    case 'structure':
      return literalType?.type;
    default: {
      return 'unknown';
    }
  }
}

function columnTypeToString(literalType?: any, level = 0) {
  if (level === 2) {
    return getLiteralTypeDisplayValue(literalType);
  }

  switch (literalType?.type) {
    case 'collectionType': {
      return `collection of ${columnTypeToString(literalType.collectionType, ++level)}`;
    }
    case 'simple': {
      return getSimpleTypeDisplayValue(literalType.simple);
    }
    default: {
      return getLiteralTypeDisplayValue(literalType);
    }
  }
}

function getColumnKey(value: StructuredDatasetColumn) {
  return value.name;
}

function renderSchemaColumn(value: StructuredDatasetColumn, index: number) {
  const { name, literalType } = value;
  return (
    <PrintValue
      label={index}
      value={`${name} (${columnTypeToString(literalType as StructuredDatasetColumnType)})`}
    />
  );
}

/** Renders a `StructuredDataset` definition as an object with a uri and optional list
 * of columns
 */
export const StructuredDatasetValue: React.FC<{ structuredDataset: StructuredDataset }> = ({
  structuredDataset,
}) => {
  const literalStyles = useLiteralStyles();
  const structuredDatasetType = structuredDataset?.metadata?.structuredDatasetType;

  let columns;
  if (structuredDatasetType?.columns && structuredDatasetType.columns?.length > 0) {
    columns = (
      <>
        <ValueLabel label="columns" />
        <PrintList
          values={structuredDatasetType?.columns || []}
          getKeyForItem={getColumnKey}
          renderValue={renderSchemaColumn}
        />
      </>
    );
  }

  return (
    <div className={literalStyles.nestedContainer}>
      <PrintValue label="uri" value={structuredDataset.uri} />
      {columns}
    </div>
  );
};
