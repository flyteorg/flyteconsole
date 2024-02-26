import Core from '@clients/common/flyteidl/core';

export function extractSimpleTypes() {
  const simpleTypes = Object.keys(Core.SimpleType)
    .map((key) => ({
      [key]: {
        type: 'simple',
        simple: Core.SimpleType[key],
      },
    }))
    .reduce((acc, v) => ({ ...acc, ...v }), {});
  return simpleTypes;
}

const simple: Core.SimpleType[] = extractSimpleTypes() as any;

export { simple };
