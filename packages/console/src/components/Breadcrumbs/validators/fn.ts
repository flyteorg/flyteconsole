import camelCase from 'lodash/camelCase';
import { BreadcrumbValidator, BreadcrumbValidatorInterface } from '../types';

/**
 * Single and plural variants of named entities
 */
export const namedEntitiesUrlSegments = [
  'workflow',
  'task',
  'launch_plan',
  'execution',
]
  .map(s => [s, `${camelCase(s)}s`])
  .flat();

/**
 * Validator for named entities dropdown selection.
 * It checks for the following conditions:
 * - The current path segment is a named entity (single or plural variant)
 * - The previous path segment is a project or domain
 *
 * @param validator
 * @returns
 */
export const namedEntitiesValidator: BreadcrumbValidator = (
  validator: BreadcrumbValidatorInterface,
) => {
  const segmentSingle = ['workflow', 'task', 'launch_plan'];
  const segmentsPlural = segmentSingle.map(s => `${camelCase(s)}s`);
  const segments = [...segmentSingle, ...segmentsPlural];
  const prevSegment = ['projects', 'domains'];
  return (
    segments.includes(validator.currentPathSegment) &&
    prevSegment.includes(validator.prevPathSegment)
  );
};

export const namedEntitiesValidatorExecutionsEmpty: BreadcrumbValidator = (
  validator: BreadcrumbValidatorInterface,
) => {
  return (
    namedEntitiesValidator(validator) && !executionsValidatorEmpty(validator)
  );
};

export const executionsValidator: BreadcrumbValidator = (
  validator: BreadcrumbValidatorInterface,
) => {
  const isMatchingPathSegment = validator.currentPathSegment === 'executions';
  return isMatchingPathSegment;
};

export const executionsValidatorEmpty: BreadcrumbValidator = (
  validator: BreadcrumbValidatorInterface,
) => {
  const isMatchingPathSegment = validator.currentPathSegment === 'executions';
  const isValueEmpty = !!validator.currentPathValue;
  return isMatchingPathSegment && isValueEmpty;
};
