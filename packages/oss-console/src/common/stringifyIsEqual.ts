export const mapStringifyReplacer = (key: string, value: any) => {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  }
  return value;
};

export const stringifyIsEqual = (a: any, b: any) => {
  const aValue = JSON.stringify(a, mapStringifyReplacer);
  const bValue = JSON.stringify(b, mapStringifyReplacer);
  return aValue === bValue;
};
