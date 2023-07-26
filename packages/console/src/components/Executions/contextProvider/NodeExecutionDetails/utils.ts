import { cloneDeep, merge, mergeWith } from 'lodash';

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

export const mergeNodeExecutions = (val, srcVal, _topkey) => {
  const retVal = mergeWith(val, srcVal, (target, src, _key) => {
    if (!target) {
      return src;
    }
    if (src instanceof Map) {
      return src;
    }
    const finaVal = typeof src === 'object' ? merge(target, src) : src;
    return finaVal;
  });
  return retVal;
};
