import { render } from '@testing-library/react';
import {
  StructuredDataset,
  StructuredDatasetType,
  LiteralType,
  SimpleType,
} from 'models/Common/types';
import * as React from 'react';
import { StructuredDatasetValue } from '../StructuredDatasetValue';

describe('StructuredDatasetValue', () => {
  it('renders simple types', () => {
    const structuredDataset: StructuredDataset = {
      uri: 's3://test-s3-path',
      metadata: {
        structuredDatasetType: {
          columns: [
            {
              name: 'age',
              literalType: {
                simple: 1,
                type: 'simple',
              },
            },
          ],
          format: 'parquet',
        } as any as StructuredDatasetType,
      },
    };
    const { getByText } = render(<StructuredDatasetValue structuredDataset={structuredDataset} />);
    expect(getByText('uri:')).toBeInTheDocument();
    expect(getByText('columns:')).toBeInTheDocument();
    expect(getByText('s3://test-s3-path')).toBeInTheDocument();
    expect(getByText('age (integer)')).toBeInTheDocument();
  });

  it('renders comple types', () => {
    const structuredDataset: StructuredDataset = {
      uri: 's3://test-s3-path',
      metadata: {
        structuredDatasetType: {
          columns: [
            {
              name: 'ages',
              literalType: {
                type: 'collectionType',
                collectionType: {
                  simple: 2,
                  type: 'simple',
                } as any,
              } as any,
            },
          ],
          format: 'parquet',
        },
      },
    };
    const { getByText } = render(<StructuredDatasetValue structuredDataset={structuredDataset} />);
    expect(getByText('uri:')).toBeInTheDocument();
    expect(getByText('columns:')).toBeInTheDocument();
    expect(getByText('s3://test-s3-path')).toBeInTheDocument();
    expect(getByText('ages (collection of float)')).toBeInTheDocument();
  });
});
