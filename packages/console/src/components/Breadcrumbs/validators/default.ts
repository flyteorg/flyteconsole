import camelCase from 'lodash/camelCase';
import { BreadcrumbValidator, BreadcrumbValidatorInterface } from '../types';

/**
 * Default validator for breadcrumbs. It checks for the following conditions:
 * - The current path segment matches the target breadcrumb id
 * - The current path value is not empty
 * - The current path value is not a path id
 *
 * @param validator
 * @returns
 */
export const breadcrumbDefaultvalidator: BreadcrumbValidator = (
  validator: BreadcrumbValidatorInterface,
) => {
  // ":" as duplicate id spliter, remove all to the end
  const cleanTargetId = validator.targetBreadcrumbId.replace(/:.*/gim, '');

  const isMatchingPathSegment = cleanTargetId === validator.currentPathSegment;
  const isValueEmpty = !!validator.currentPathValue;
  const isNotPathId = camelCase(validator.currentPathValue) !== cleanTargetId;

  const condition = isMatchingPathSegment && isValueEmpty && isNotPathId;

  return condition;
};
