import { render } from '@testing-library/react';
import { StructuredDataset, StructuredDatasetType } from 'models/Common/types';
import * as React from 'react';
import { StructuredDatasetValue } from '../StructuredDatasetValue';

describe('StructuredDatasetValue', () => {
  it('renders sorted keys', () => {
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
    expect(getByText('age (simple)')).toBeInTheDocument();
  });
});
