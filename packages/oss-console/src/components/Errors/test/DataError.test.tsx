import * as React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import NotFoundError from '@clients/common/Errors/NotFoundError';
import NotAuthorizedError from '@clients/common/Errors/NotAuthorizedError';
import { DataError, DataErrorProps } from '../DataError';

describe('DataError', () => {
  const defaultProps: DataErrorProps = {
    errorTitle: 'Test Error',
  };

  it('renders message for NotAuthorized errors', () => {
    const { getByText } = render(
      <MemoryRouter>
        <DataError {...defaultProps} error={new NotAuthorizedError()} />
      </MemoryRouter>,
    );
    expect(getByText('Access Denied')).not.toBeEmptyDOMElement();
  });

  it('renders not found for NotFound errors', () => {
    const { getByText } = render(
      <MemoryRouter>
        <DataError {...defaultProps} error={new NotFoundError('')} />
      </MemoryRouter>,
    );
    expect(getByText('404 Not Found')).not.toBeEmptyDOMElement();
  });
});
