import { CompiledWorkflow } from './types';

export const isCompiledWorkflow = (
  closure: any,
): closure is CompiledWorkflow => {
  return (
    !!closure &&
    typeof closure === 'object' &&
    closure !== null &&
    'template' in closure
  );
};
