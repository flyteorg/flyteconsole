import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExecutionLabels } from '../ExecutionLabels';

jest.mock('@mui/material/Chip', () => (props: any) => (
  <div data-testid="chip" {...props}>
    {props.label}
  </div>
));

describe('ExecutionLabels', () => {
  it('renders chips with key-value pairs correctly', () => {
    const values = {
      'random/uuid': 'f8b9ff18-4811-4bcc-aefd-4f4ec4de469d',
      bar: 'baz',
      foo: '',
    };

    render(<ExecutionLabels values={values} />);

    expect(
      screen.getByText('random/uuid: f8b9ff18-4811-4bcc-aefd-4f4ec4de469d'),
    ).toBeInTheDocument();
    expect(screen.getByText('bar: baz')).toBeInTheDocument();
    expect(screen.getByText('foo')).toBeInTheDocument();
  });

  it('applies correct styles to chip container', () => {
    const values = {
      key: 'value',
    };

    const { container } = render(<ExecutionLabels values={values} />);
    const chipContainer = container.firstChild;

    expect(chipContainer).toHaveStyle('display: flex');
    expect(chipContainer).toHaveStyle('flex-wrap: wrap');
    expect(chipContainer).toHaveStyle('width: 100%');
    expect(chipContainer).toHaveStyle('max-width: 420px');
  });

  it('renders correct number of chips', () => {
    const values = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    };

    render(<ExecutionLabels values={values} />);

    const chips = screen.getAllByTestId('chip');
    expect(chips.length).toBe(3);
  });
});
