import { simpleType } from '../__mocks__/mockInputs';
import { primitiveLiteral } from '../__mocks__/utils';
import { SimpleType } from '../../../../models/Common/types';
import { literalsToLiteralValueMap } from '../utils';

describe('literalsToLiteralValueMap', () => {
  it('maps literals whose names exist on the resolved interface', () => {
    const known = primitiveLiteral({ stringValue: 'keep' });
    const result = literalsToLiteralValueMap(
      { known },
      { known: simpleType(SimpleType.STRING) },
    );

    expect(result.size).toBe(1);
    expect(result.get('known_STRING')).toBe(known);
  });

  it('skips input literals that are not declared on the resolved interface', () => {
    const known = primitiveLiteral({ stringValue: 'keep' });
    const extra = primitiveLiteral({ stringValue: 'from a dynamic child' });

    const result = literalsToLiteralValueMap(
      { extra, known },
      { known: simpleType(SimpleType.STRING) },
    );

    expect(result.size).toBe(1);
    expect(result.get('known_STRING')).toBe(known);
    expect(Array.from(result.values())).not.toContain(extra);
  });
});
