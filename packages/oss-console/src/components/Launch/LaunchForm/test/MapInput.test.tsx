import * as React from 'react';
import Long from 'long';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import Core from '@clients/common/flyteidl/core';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { MapInput } from '../MapInput';
import { inputToLiteral, literalToInputValue, validateInput } from '../inputHelpers/inputHelpers';
import { InputProps, InputType } from '../types';
import { getInputDefintionForLiteralType } from '../utils';

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

const stringType = { simple: Core.SimpleType.STRING, structure: { tag: 'str' } };
const integerType = { simple: Core.SimpleType.INTEGER, structure: { tag: 'int' } };

const stringLiteral = (stringValue: string): Core.ILiteral => ({
  scalar: { primitive: { stringValue } },
});

/** Mounts MapInput with the value a relaunch derives from an execution's map literal, and
 * returns what the form later validates and submits: the last value passed to onChange.
 */
const relaunchMap = (valueType: Core.ILiteralType, childLiteral: Core.ILiteral) => {
  const typeDefinition = getInputDefintionForLiteralType({ mapValueType: valueType } as any);
  const literal = { map: { literals: { foo: childLiteral } } };
  const onChange = jest.fn();
  const { container } = render(
    <ThemeProvider theme={muiTheme}>
      <MapInput
        {...makeMapProps('')}
        typeDefinition={typeDefinition}
        value={literalToInputValue(typeDefinition, literal)}
        onChange={onChange}
      />
    </ThemeProvider>,
  );
  const valueField = container.querySelector(
    '.valueControl textarea, .valueControl input',
  ) as HTMLInputElement;
  return {
    typeDefinition,
    literal,
    shown: valueField.value,
    submitted: onChange.mock.calls[onChange.mock.calls.length - 1][0],
  };
};

const expectSubmittedAsLaunched = ({
  typeDefinition,
  literal,
  submitted,
}: ReturnType<typeof relaunchMap>) => {
  expect(() =>
    validateInput({ name: 'mapInput', required: true, typeDefinition, value: submitted }),
  ).not.toThrow();
  expect(inputToLiteral({ typeDefinition, value: submitted })).toEqual(literal);
};

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

  describe('relaunching an execution', () => {
    it.each([
      [
        'union',
        { unionType: { variants: [stringType, integerType] } },
        { scalar: { union: { value: stringLiteral('hello'), type: stringType } } },
      ],
      [
        'blob',
        { blob: { format: 'csv', dimensionality: 0 } },
        {
          scalar: {
            blob: {
              uri: 's3://bucket/key',
              metadata: { type: { format: 'csv', dimensionality: 0 } },
            },
          },
        },
      ],
      [
        'structured dataset',
        { structuredDatasetType: { format: 'parquet' } },
        {
          scalar: {
            structuredDataset: {
              uri: 's3://bucket/df',
              metadata: { structuredDatasetType: { format: 'parquet' } },
            },
          },
        },
      ],
    ])('submits an unedited %s value as it was launched', (_name, valueType, childLiteral) => {
      const relaunch = relaunchMap(valueType, childLiteral);

      expect(relaunch.shown).not.toBe('[object Object]');
      expectSubmittedAsLaunched(relaunch);
    });

    it.each([
      [
        'struct',
        { simple: Core.SimpleType.STRUCT },
        { scalar: { generic: { fields: { nested: { stringValue: 'bar' } } } } },
        '{"nested":"bar"}',
      ],
      [
        'list',
        { collectionType: { simple: Core.SimpleType.INTEGER } },
        {
          collection: {
            literals: [1, 2].map((n) => ({
              scalar: { primitive: { integer: Long.fromNumber(n) } },
            })),
          },
        },
        '[1,2]',
      ],
      [
        'nested map',
        { mapValueType: stringType },
        { map: { literals: { inner: stringLiteral('v') } } },
        '{"inner":"v"}',
      ],
      ['string "null"', stringType, stringLiteral('null'), 'null'],
    ])(
      'shows an unedited %s value as text and submits it as it was launched',
      (_name, valueType, childLiteral, text) => {
        const relaunch = relaunchMap(valueType, childLiteral);

        expect(relaunch.shown).toBe(text);
        expectSubmittedAsLaunched(relaunch);
      },
    );
  });
});
