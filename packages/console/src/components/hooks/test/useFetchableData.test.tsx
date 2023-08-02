import {
  fireEvent,
  getByLabelText,
  render,
  waitFor,
} from '@testing-library/react';
import * as React from 'react';
// import { fetchStates } from '../types';
import { FetchableDataConfig, useFetchableData } from '../useFetchableData';

const stateLabel = 'fetch-state';
const errorLabel = 'fetch-error';
const valueLabel = 'fetch-value';
const fetchLabel = 'fetch-doFetch';

interface FetchableTesterProps {
  config: FetchableDataConfig<string, string>;
  data: string;
}

const FetchableTester = ({ config, data }: FetchableTesterProps) => {
  const fetchable = useFetchableData(config, data);
  const onClickFetch = () => fetchable.fetch();

  return (
    <div>
      <div aria-label={stateLabel}>{fetchable.state.value}</div>
      <div aria-label={errorLabel}>{fetchable.lastError}</div>
      <div aria-label={valueLabel}>{fetchable.value}</div>
      <button aria-label={fetchLabel} onClick={onClickFetch}>
        Fetch Data
      </button>
    </div>
  );
};

describe('useFetchableData', () => {
  const defaultValue = 'defaultValue';
  const fetchData = 'dataString';
  let config: FetchableDataConfig<string, string>;
  let doFetch: jest.Mock<Promise<string>>;
  let resolveValue: (value: string) => void;
  let rejectValue: (value: any) => void;

  beforeEach(() => {
    doFetch = jest.fn().mockImplementation(() => {
      return new Promise((resolve, reject) => {
        resolveValue = resolve;
        rejectValue = reject;
      });
    });
    config = {
      defaultValue,
      doFetch,
      autoFetch: true,
      useCache: false,
    };
  });

  const renderTester = () =>
    render(<FetchableTester config={config} data={fetchData} />);
  const getElements = async (container: HTMLElement) => {
    return waitFor(() => {
      return {
        errorEl: getByLabelText(container, errorLabel),
        fetchButton: getByLabelText(container, fetchLabel),
        stateEl: getByLabelText(container, stateLabel),
        valueEl: getByLabelText(container, valueLabel),
      };
    });
  };

  it('should return value once fetch has resolved', async () => {
    const { container } = renderTester();
    const { valueEl } = await getElements(container);

    const newValue = 'newValue';
    resolveValue(newValue);

    await waitFor(() => expect(valueEl.textContent).toBe(newValue));
  });

  it('should return refreshed value after a second fetch', async () => {
    const { container } = renderTester();
    const { fetchButton, valueEl } = await getElements(container);

    // Create successful first fetch
    const firstValue = 'new value';
    resolveValue(firstValue);
    await waitFor(() => expect(valueEl.textContent).toBe(firstValue));

    await fireEvent.click(fetchButton);

    const secondValue = 'second new value';
    resolveValue(secondValue);
    await waitFor(() => expect(valueEl.textContent).toBe(secondValue));
  });

  it('should return default value until fetch completes', async () => {
    const { container } = renderTester();
    const { valueEl } = await getElements(container);
    expect(valueEl.textContent).toBe(defaultValue);

    const newValue = 'new value';
    resolveValue(newValue);
    await waitFor(() => expect(valueEl.textContent).toBe(newValue));
  });

  it('should not issue an initial fetch if autoFetch is false', async () => {
    config.autoFetch = false;
    const { container } = renderTester();
    const { fetchButton } = await getElements(container);
    expect(doFetch).not.toHaveBeenCalled();

    await fireEvent.click(fetchButton);
    expect(doFetch).toHaveBeenCalled();
  });
});
