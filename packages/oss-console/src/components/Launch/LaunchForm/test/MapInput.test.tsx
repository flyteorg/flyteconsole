import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { MapInput } from '../MapInput';
import { InputProps, InputType } from '../types';

const makeMapProps = (value: string): InputProps => ({
  description: '',
  name: 'mapInput',
  label: 'Map Input',
  required: false,
  typeDefinition: {
    literalType: {},
    type: InputType.Map,
    subtype: { literalType: {}, type: InputType.Struct },
  },
  value,
  onChange: jest.fn(),
});

const renderMap = (value: string) =>
  render(
    <ThemeProvider theme={muiTheme}>
      <MapInput {...makeMapProps(value)} />
    </ThemeProvider>,
  );

describe('MapInput', () => {
  it('renders an object map value as JSON (not "[object Object]") when relaunching', () => {
    const { container } = renderMap('{"foo":{"nested":"bar"}}');

    const keyField = container.querySelector('.keyControl input') as HTMLInputElement;
    const valueField = container.querySelector('.valueControl textarea') as HTMLTextAreaElement;

    expect(keyField?.value).toBe('foo');
    expect(valueField).not.toBeNull();
    expect(valueField.value).toBe('{"nested":"bar"}');
    expect(valueField.value).not.toBe('[object Object]');
  });

  it('leaves plain string map values unchanged', () => {
    const { container } = renderMap('{"foo":"bar"}');
    const valueField = container.querySelector('.valueControl textarea') as HTMLTextAreaElement;
    expect(valueField?.value).toBe('bar');
  });
});
