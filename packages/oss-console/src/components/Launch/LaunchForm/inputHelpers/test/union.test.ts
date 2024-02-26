import Core from '@clients/common/flyteidl/core';
import { unionHelper } from '../union';
import { InputTypeDefinition } from '../../types';

it('Parse truthy nested union value', () => {
  const testSubjectLiteral = {
    scalar: {
      union: {
        value: { scalar: { primitive: { stringValue: 'hello' } } },
        type: { structure: { tag: 'str' }, simple: 3 },
      },
    },
  } as Core.ILiteral;

  const testSubjectTypeDefinition = {
    literalType: {
      unionType: {
        variants: [
          { structure: { tag: 'str' }, simple: 3 },
          { structure: { tag: 'none' }, simple: 0 },
        ],
      },
    },
    type: 'Union',
    listOfSubTypes: [
      {
        literalType: { structure: { tag: 'str' }, simple: 3 },
        type: 'STRING',
      },
      {
        literalType: { structure: { tag: 'none' }, simple: 0 },
        type: 'NONE',
      },
    ],
  } as InputTypeDefinition;

  const expected = {
    typeDefinition: {
      literalType: { simple: 3, structure: { tag: 'str' } },
      type: 'STRING',
    },
    value: 'hello',
  };

  const result = unionHelper.fromLiteral(testSubjectLiteral, testSubjectTypeDefinition);

  expect(expected).toStrictEqual(result);
});

it('Parse truthy union value', () => {
  const testSubjectLiteral = {
    scalar: { primitive: { stringValue: 'hello' } },
  } as Core.ILiteral;

  const testSubjectTypeDefinition = {
    literalType: {
      unionType: {
        variants: [
          { structure: { tag: 'str' }, simple: 3 },
          { structure: { tag: 'none' }, simple: 0 },
        ],
      },
    },
    type: 'Union',
    listOfSubTypes: [
      { literalType: { structure: { tag: 'str' }, simple: 3 }, type: 'STRING' },
      { literalType: { structure: { tag: 'none' }, simple: 0 }, type: 'NONE' },
    ],
  } as InputTypeDefinition;

  const expected = {
    typeDefinition: {
      literalType: { simple: 3, structure: { tag: 'str' } },
      type: 'STRING',
    },
    value: 'hello',
  };

  const result = unionHelper.fromLiteral(testSubjectLiteral, testSubjectTypeDefinition);

  expect(expected).toStrictEqual(result);
});
