import core from '@clients/common/flyteidl/core';
import {
  inputToLiteral,
  literalToInputValue,
} from '../../components/Launch/LaunchForm/inputHelpers/inputHelpers';
import { InputType, InputTypeDefinition } from '../../components/Launch/LaunchForm/types';
import '../decodeMsgPackLiterals';

// Binary literal bytes that flytekit's TypeEngine.to_literal writes for the dataclass
// Params(name: str, volume_size: int). Integers up to 4294967295 are written as uint32, larger
// ones as uint64, and those below -2147483648 as int64.
const NAME_PREFIX = '82a46e616d65a178ab766f6c756d655f73697a65';

const testCases: [number, string][] = [
  [5, `${NAME_PREFIX}05`],
  [4294967295, `${NAME_PREFIX}ceffffffff`],
  [4294967296, `${NAME_PREFIX}cf0000000100000000`],
  [10737418240, `${NAME_PREFIX}cf0000000280000000`],
  [-2147483649, `${NAME_PREFIX}d3ffffffff7fffffff`],
];

function decodeMsgpackBinaryLiteral(hex: string): core.Literal {
  const encoded = core.Literal.encode({
    scalar: { binary: { value: Buffer.from(hex, 'hex'), tag: 'msgpack' } },
  }).finish();
  return core.Literal.decode(encoded);
}

describe('decodeMsgPackLiterals', () => {
  it.each(testCases)('keeps the integer %s as a struct number value', (expected, hex) => {
    const fields = decodeMsgpackBinaryLiteral(hex).scalar?.generic?.fields;

    expect(fields?.name.stringValue).toBe('x');
    expect(fields?.volume_size.numberValue).toBe(expected);
  });

  it('keeps the whole dataclass when a relaunch form is submitted unchanged', () => {
    const initialValue = decodeMsgpackBinaryLiteral(`${NAME_PREFIX}cf0000000280000000`);
    const typeDefinition: InputTypeDefinition = {
      type: InputType.Struct,
      literalType: { simple: core.SimpleType.STRUCT },
    };

    const value = literalToInputValue(typeDefinition, initialValue);
    const submitted = inputToLiteral({ initialValue, typeDefinition, value });

    expect(submitted.scalar?.generic?.fields?.volume_size.numberValue).toBe(10737418240);
    expect(JSON.parse(value as string)).toEqual({ name: 'x', volume_size: 10737418240 });
  });
});
