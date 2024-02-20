import Admin from '@clients/common/flyteidl/admin';
import { fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { QueryClientProvider } from 'react-query';
import { LocalCacheProvider } from '../../../basics/LocalCache/ContextProvider';
import { DomainSettingsSection } from '../DomainSettingsSection';
import { createTestQueryClient } from '../../../test/utils';
import t from '../strings';
import { getProjectAttributes, getProjectDomainAttributes } from '../../../models/Project/api';

jest.mock('../../../models/Project/api', () => ({
  getProjectAttributes: jest.fn(),
  getProjectDomainAttributes: jest.fn(),
}));

const serviceAccount = 'default';
const rawData = 'cliOutputLocationPrefix';
const maxParallelism = 10;

const mockConfigData = {
  attributes: {
    matchingAttributes: {
      workflowExecutionConfig: {
        maxParallelism,
        securityContext: { runAs: { k8sServiceAccount: serviceAccount } },
        rawOutputDataConfig: { outputLocationPrefix: rawData },
        annotations: { values: { cliAnnotationKey: 'cliAnnotationValue' } },
        labels: { values: { cliLabelKey: 'cliLabelValue' } },
      },
    },
  },
};

const mockConfigDataWithoutLabels = {
  attributes: {
    matchingAttributes: {
      workflowExecutionConfig: {
        maxParallelism,
        securityContext: { runAs: { k8sServiceAccount: serviceAccount } },
        rawOutputDataConfig: { outputLocationPrefix: rawData },
        annotations: { values: { cliAnnotationKey: 'cliAnnotationValue' } },
      },
    },
  },
};

const mockConfigDataWithoutLabelsAndAnnotations = {
  attributes: {
    matchingAttributes: {
      workflowExecutionConfig: {
        maxParallelism,
        securityContext: { runAs: { k8sServiceAccount: serviceAccount } },
        rawOutputDataConfig: { outputLocationPrefix: rawData },
      },
    },
  },
};

describe('DomainSettingsSection', () => {
  const mockgetProjectAttributes = getProjectAttributes as jest.Mock<
    Promise<Admin.ProjectAttributesGetResponse | null>
  >;
  const mockgetProjectDomainAttributes = getProjectDomainAttributes as jest.Mock<
    Promise<Admin.ProjectDomainAttributesGetResponse | null>
  >;

  afterEach(() => {
    mockgetProjectAttributes.mockClear();
    mockgetProjectDomainAttributes.mockClear();
  });

  const renderView = (attributesResponse: Admin.ProjectDomainAttributesGetResponse) => {
    const queryClient = createTestQueryClient();
    mockgetProjectAttributes.mockImplementation(() => Promise.resolve(attributesResponse));
    mockgetProjectDomainAttributes.mockImplementation(() => Promise.resolve(attributesResponse));
    return render(
      <ThemeProvider theme={muiTheme}>
        <QueryClientProvider client={queryClient}>
          <LocalCacheProvider>
            <DomainSettingsSection project="testproject" domain="testdomain" />
          </LocalCacheProvider>
        </QueryClientProvider>
      </ThemeProvider>,
    );
  };

  it('should not just render the header', async () => {
    const { getByText, queryByTestId } = renderView({});
    // is should render the header
    await waitFor(() => expect(getByText(t('domainSettingsTitle'))).toBeInTheDocument());
    // it should not render the loader
    await waitFor(() => {
      const loader = queryByTestId('loading-spinner');
      expect(loader).toBeFalsy();
    });
  });

  it('should render the loader when clicking expand', async () => {
    const { getByTestId, getByText, queryByTestId } = renderView({});
    // is should render the header
    await waitFor(() => expect(getByText(t('domainSettingsTitle'))).toBeInTheDocument());
    const expandButton = await waitFor(() => queryByTestId('ExpandMoreIcon'));
    expect(expandButton).toBeInTheDocument();

    fireEvent.click(expandButton!);
    expect(getByTestId('loading-spinner'));
  });

  it('should render a section without IAMRole data', async () => {
    const { queryByText, queryAllByRole, getByText, queryByTestId } = renderView(mockConfigData);

    const expandButton = await waitFor(() => queryByTestId('ExpandMoreIcon'));
    expect(expandButton).toBeInTheDocument();

    fireEvent.click(expandButton!);
    await waitFor(() => {});
    // should display serviceAccount value
    await waitFor(() => expect(getByText(serviceAccount)).toBeInTheDocument());
    // should display rawData value
    expect(queryByText(rawData)).toBeInTheDocument();
    // should display maxParallelism value
    expect(queryByText(maxParallelism)).toBeInTheDocument();

    // should display 2 data tables
    await waitFor(() => {
      const tables = queryAllByRole('table');
      expect(tables).toHaveLength(2);
    });

    // should display a placeholder text, as role was not passed
    const emptyRole = queryByText('-');

    expect(emptyRole).toBeInTheDocument();
  });

  it('should render a section without IAMRole and Labels data', async () => {
    const { queryByText, queryAllByText, queryAllByRole, queryByTestId } = renderView(
      mockConfigDataWithoutLabels,
    );
    expect(queryByText('Domain Settings')).toBeInTheDocument();

    const expandButton = await waitFor(() => queryByTestId('ExpandMoreIcon'));
    expect(expandButton).toBeInTheDocument();

    fireEvent.click(expandButton!);
    await waitFor(() => {});

    // should display serviceAccount value
    await waitFor(() => expect(queryByText(serviceAccount)).toBeInTheDocument());
    // should display rawData value
    expect(queryByText(rawData)).toBeInTheDocument();
    // should display maxParallelism value
    expect(queryByText(maxParallelism)).toBeInTheDocument();
    // should display 1 data table
    await waitFor(() => {
      const tables = queryAllByRole('table');
      expect(tables).toHaveLength(1);
    });
    // should display two placeholder text, as role and labels were not passed
    const inheritedPlaceholders = queryAllByText('-');
    expect(inheritedPlaceholders).toHaveLength(2);
  });

  it('should render a section without IAMRole, Labels, Annotations data', async () => {
    const { queryByText, queryAllByText, queryByRole, queryByTestId } = renderView(
      mockConfigDataWithoutLabelsAndAnnotations,
    );
    expect(queryByText('Domain Settings')).toBeInTheDocument();

    const expandButton = await waitFor(() => queryByTestId('ExpandMoreIcon'));
    expect(expandButton).toBeInTheDocument();

    fireEvent.click(expandButton!);
    await waitFor(() => {});

    // should display serviceAccount value
    await waitFor(() => expect(queryByText(serviceAccount)).toBeInTheDocument());
    // should display rawData value
    expect(queryByText(rawData)).toBeInTheDocument();
    // should display maxParallelism value
    expect(queryByText(maxParallelism)).toBeInTheDocument();
    // should not display any data tables
    await waitFor(() => {
      const tables = queryByRole('table');
      expect(tables).not.toBeInTheDocument();
    });
    // should display three placeholder text, as role, labels, annotations were not passed
    const inheritedPlaceholders = queryAllByText('-');
    expect(inheritedPlaceholders).toHaveLength(3);
  });
});
