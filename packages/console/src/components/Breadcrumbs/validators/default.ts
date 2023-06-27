import camelCase from 'lodash/camelCase';
import { BreadcrumbValidator, BreadcrumbValidatorInterface } from '../types';

export const breadcrumbDefaultvalidator: BreadcrumbValidator = (
  valididator: BreadcrumbValidatorInterface,
) => {
  const isMatchingPathSegment =
    valididator.targetBreadcrumbId === valididator.currentPathSegment;
  const isValueEmpty = !!valididator.currentPathValue;
  const isNotDefaultValue =
    camelCase(valididator.currentPathValue) !== valididator.targetBreadcrumbId;

  const condition = isMatchingPathSegment && isValueEmpty && isNotDefaultValue;

  if (condition)
    console.log(valididator.targetBreadcrumbId, condition, valididator);

  return condition;
};
