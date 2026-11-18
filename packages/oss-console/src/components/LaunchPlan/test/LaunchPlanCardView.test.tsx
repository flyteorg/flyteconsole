import * as React from 'react';
import { render, screen } from '@testing-library/react';
import LaunchPlanCardView from '../LaunchPlanCardList/LaunchPlanCardView';
import { SearchResult } from '../../common/SearchableList';
import { NamedEntity } from '../../../models/Common/types';

jest.mock('../LaunchPlanCardList/LaunchPlanListCard', () => ({
  __esModule: true,
  default: () => <div data-testid="lp-card" />,
}));

const makeResults = (count: number): SearchResult<NamedEntity>[] =>
  Array.from({ length: count }, (_, index) => ({
    key: `lp-${index}`,
    value: { id: { name: `lp-${index}` } },
  })) as unknown as SearchResult<NamedEntity>[];

describe('LaunchPlanCardView', () => {
  it('renders every launch plan', () => {
    render(<LaunchPlanCardView results={makeResults(64)} loading={false} />);

    expect(screen.getAllByTestId('lp-card')).toHaveLength(64);
  });
});
