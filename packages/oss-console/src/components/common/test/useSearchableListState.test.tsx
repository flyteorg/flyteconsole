import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import fuzzysort from 'fuzzysort';
import { useSearchableListState } from '../useSearchableListState';

interface Item {
  name: string;
}

const Harness: React.FC<{ items: Item[] }> = ({ items }) => {
  const { results, searchString, setSearchString, loading } = useSearchableListState<Item>({
    items,
    propertyGetter: 'name',
  });

  return (
    <div>
      <input
        aria-label="search"
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
      />
      <span data-testid="loading">{String(loading)}</span>
      <ul data-testid="list">
        {results.map((r) => (
          <li key={r.key} data-testid="item">
            {r.value.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

describe('useSearchableListState', () => {
  const items: Item[] = [{ name: 'alpha' }, { name: 'beta' }, { name: 'gamma' }];

  it('returns all items when the search string is empty', () => {
    render(<Harness items={items} />);
    expect(screen.getAllByTestId('item')).toHaveLength(3);
  });

  it('filters items by the search string', async () => {
    render(<Harness items={items} />);
    fireEvent.change(screen.getByLabelText('search'), { target: { value: 'alp' } });

    await waitFor(() => {
      const rendered = screen.getAllByTestId('item');
      expect(rendered).toHaveLength(1);
      expect(rendered[0]).toHaveTextContent('alpha');
    });
  });

  it('prepares each item only once, not on every keystroke', async () => {
    const prepareSpy = jest.spyOn(fuzzysort, 'prepare');
    prepareSpy.mockClear();

    render(<Harness items={items} />);
    expect(prepareSpy).toHaveBeenCalledTimes(items.length);

    const input = screen.getByLabelText('search');
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'al' } });
    fireEvent.change(input, { target: { value: 'alp' } });

    await waitFor(() => {
      expect(screen.getAllByTestId('item')).toHaveLength(1);
    });

    expect(prepareSpy).toHaveBeenCalledTimes(items.length);
    prepareSpy.mockRestore();
  });
});
