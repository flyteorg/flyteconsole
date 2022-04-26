import {
  StructuredDataset,
  StructuredDatasetColumn,
  StructuredDatasetColumnType,
} from 'models/Common/types';
import * as React from 'react';
import { PrintList } from '../PrintList';
import { PrintValue } from '../PrintValue';
import { useLiteralStyles } from '../styles';
import { ValueLabel } from '../ValueLabel';

function columnTypeToString(literalType?: StructuredDatasetColumnType) {
  return literalType?.type;
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
