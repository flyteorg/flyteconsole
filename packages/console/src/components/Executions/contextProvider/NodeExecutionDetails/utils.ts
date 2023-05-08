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

export const mergeNodeExecutions = (val, srcVal, _key) => {
  const retVal = mergeWith(val, srcVal, (target, src, _key) => {
    if (!target) {
      return src;
    }
    const clonedTarget = cloneDeep(target);
    const clonedSrc = cloneDeep(src);
    if (clonedSrc instanceof Map) {
      return clonedSrc;
    }
    const finaVal =
      typeof clonedSrc === 'object'
        ? merge(clonedTarget, clonedSrc)
        : clonedSrc;
    return finaVal;
  });
  return retVal;
};
