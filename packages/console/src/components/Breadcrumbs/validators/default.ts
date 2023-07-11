import camelCase from 'lodash/camelCase';
import { BreadcrumbValidator, BreadcrumbValidatorInterface } from '../types';

/**
 * Default validator for breadcrumbs. It checks for the following conditions:
 * - The current path segment matches the target breadcrumb id
 * - The current path value is not empty
 * - The current path value is not a path id
 *
 * @param valididator
 * @returns
 */
export const breadcrumbDefaultvalidator: BreadcrumbValidator = (
  valididator: BreadcrumbValidatorInterface,
) => {
  // ":" as duplicate id spliter, remove all to the end
  const cleanTargetId = valididator.targetBreadcrumbId.replace(/:.*/gim, '');

  const isMatchingPathSegment =
    cleanTargetId === valididator.currentPathSegment;
  const isValueEmpty = !!valididator.currentPathValue;
  const isNotPathId = camelCase(valididator.currentPathValue) !== cleanTargetId;

  const condition = isMatchingPathSegment && isValueEmpty && isNotPathId;

  return condition;
};
