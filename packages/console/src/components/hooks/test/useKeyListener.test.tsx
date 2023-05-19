import React from 'react';
import { fireEvent, getByText, render } from '@testing-library/react';
import { useEscapeKey } from '../useKeyListener';

it('calls the callback on pressing the ESC key', () => {
  const callbackSpy = jest.fn();
  const callback = (_?: KeyboardEvent) => {
    callbackSpy();
  };

  const TestComponent = () => {
    useEscapeKey(callback);
    return <div>test</div>;
  };

  render(<TestComponent />);

  fireEvent.keyDown(getByText(global.document.body, 'test'), {
    key: 'Escape',
  });

  expect(callbackSpy).toHaveBeenCalled();
});
