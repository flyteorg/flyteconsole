import { render } from '@testing-library/react';
import * as React from 'react';

import { DomainSettingsSection } from '../DomainSettingsSection';

const serviceAccount = 'default';
const rawData = 'cliOutputLocationPrefix';
const maxParallelism = 10;

const mockConfigData = {
  maxParallelism: maxParallelism,
  securityContext: { runAs: { k8sServiceAccount: serviceAccount } },
  rawOutputDataConfig: { outputLocationPrefix: rawData },
  annotations: { values: { cliAnnotationKey: 'cliAnnotationValue' } },
  labels: { values: { cliLabelKey: 'cliLabelValue' } },
};
const mockConfigDataWithoutLabels = {
  maxParallelism: maxParallelism,
  securityContext: { runAs: { k8sServiceAccount: serviceAccount } },
  rawOutputDataConfig: { outputLocationPrefix: rawData },
  annotations: { values: { cliAnnotationKey: 'cliAnnotationValue' } },
};

describe('DomainSettingsSection', () => {
  it('should not render a block if config data passed is empty', () => {
    const { container } = render(<DomainSettingsSection configData={{}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render a section with mocked data', () => {
    const { queryByText, getAllByRole } = render(
      <DomainSettingsSection configData={mockConfigData} />,
    );
    expect(queryByText('Domain Settings')).toBeInTheDocument();
    // should display serviceAccount value
    expect(queryByText(serviceAccount)).toBeInTheDocument();
    // should display rawData value
    expect(queryByText(rawData)).toBeInTheDocument();
    // should display maxParallelism value
    expect(queryByText(maxParallelism)).toBeInTheDocument();
    // should display 2 data tables
    const tables = getAllByRole('table');
    expect(tables).toHaveLength(2);
    // should display a placeholder text, as role was not passed
    const emptyRole = queryByText('Inherits from project level values');
    expect(emptyRole).toBeInTheDocument();
  });

  it('should render a section with mocked data', () => {
    const { queryByText, queryAllByText, getAllByRole } = render(
      <DomainSettingsSection configData={mockConfigDataWithoutLabels} />,
    );
    expect(queryByText('Domain Settings')).toBeInTheDocument();
    // should display serviceAccount value
    expect(queryByText(serviceAccount)).toBeInTheDocument();
    // should display rawData value
    expect(queryByText(rawData)).toBeInTheDocument();
    // should display maxParallelism value
    expect(queryByText(maxParallelism)).toBeInTheDocument();
    // should display 1 data table
    const tables = getAllByRole('table');
    expect(tables).toHaveLength(1);
    // should display two placeholder text, as role and labels were not passed
    const inheritedPlaceholders = queryAllByText('Inherits from project level values');
    expect(inheritedPlaceholders).toHaveLength(2);
  });
});
