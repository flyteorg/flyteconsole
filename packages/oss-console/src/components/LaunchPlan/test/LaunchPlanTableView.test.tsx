import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { LaunchPlanTableView } from '../LaunchPlanTable/LaunchPlanTableView';
import { SearchResult } from '../../common/useSearchableListState';
import { NamedEntity } from '../../../models/Common/types';

// The real row pulls in routing + queries; mock it so the test isolates the view's row rendering.
jest.mock('../LaunchPlanTable/LaunchPlanTableRow', () => ({
  LaunchPlanTableRow: () => (
    <tr data-testid="lp-row">
      <td>row</td>
    </tr>
  ),
}));

const makeResults = (n: number): SearchResult<NamedEntity>[] =>
  Array.from({ length: n }, (_, i) => ({
    key: `lp-${i}`,
    value: { id: { name: `lp-${i}` } },
  })) as unknown as SearchResult<NamedEntity>[];

const renderTable = (results: SearchResult<NamedEntity>[], loading = false) =>
  render(
    <ThemeProvider theme={muiTheme}>
      <LaunchPlanTableView results={results} loading={loading} />
    </ThemeProvider>,
  );

describe('LaunchPlanTableView', () => {
  it('renders one row per result without clipping the list', () => {
    renderTable(makeResults(3));
    expect(screen.getAllByTestId('lp-row')).toHaveLength(3);
  });

  it('renders the empty state when there are no results', () => {
    renderTable(makeResults(0));
    expect(screen.queryAllByTestId('lp-row')).toHaveLength(0);
  });
});
