import { merge, mergeWith } from 'lodash';

export const mapStringifyReplacer = (key: string, value: any) => {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
};

export const stringifyIsEqual = (a: any, b: any) => {
  return (
    JSON.stringify(a, mapStringifyReplacer) ===
    JSON.stringify(b, mapStringifyReplacer)
  );
};

export const mergeNodeExecutions = (val, srcVal, _key) => {
  const retVal = mergeWith(val, srcVal, (val, srcVal, _key) => {
    if (srcVal instanceof Map) {
      return srcVal;
    }
    const finaVal =
      typeof srcVal === 'object' ? merge({ ...val }, { ...srcVal }) : srcVal;
    return finaVal;
  });
  return retVal;
};
