import camelCase from 'lodash/camelCase';
import { BreadcrumbValidator, BreadcrumbValidatorInterface } from '../types';

export const namedEntitiesUrlSegments = ['workflow', 'task', 'launch_plan']
  .map(s => [s, `${camelCase(s)}s`])
  .flat();

export const namedEntitiesValidator: BreadcrumbValidator = (
  valididator: BreadcrumbValidatorInterface,
) => {
  const segmentSingle = ['workflow', 'task', 'launch_plan'];
  const segmentsPlural = segmentSingle.map(s => `${camelCase(s)}s`);
  const segments = [...segmentSingle, ...segmentsPlural];
  const prevSegment = ['projects', 'domains'];
  return (
    segments.includes(valididator.currentPathSegment) &&
    prevSegment.includes(valididator.prevPathSegment)
  );
};
