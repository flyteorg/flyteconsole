import { merge } from 'lodash';

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

export const mergeNodeExecutions = (val, srcVal, _key) => {
  const retVal = merge(val, srcVal);
  return retVal;
};
