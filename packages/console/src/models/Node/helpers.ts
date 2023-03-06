import { CompiledNode } from './types';

export const isCompiledNode = (node: any): node is CompiledNode => {
  return !!node && typeof node === 'object' && node !== null && 'id' in node;
};
