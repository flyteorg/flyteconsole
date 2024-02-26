import { render, screen } from '@testing-library/react';
import * as React from 'react';

import { LoadingSpinner } from '.';

describe('LoadingSpinner', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders', async () => {
    render(<LoadingSpinner useDelay={false} />);
    expect(screen.findByTestId('loading-spinner')).not.toBeNull();
  });
});
