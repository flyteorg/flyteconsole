import { BreadcrumbValidator, BreadcrumbValidatorInterface } from '../types';

export const namedEntitiesValidator: BreadcrumbValidator = (
  valididator: BreadcrumbValidatorInterface,
) => {
  const segments = ['workflows', 'tasks', 'launchPlans'];
  const prevSegment = ['projects', 'domains'];
  return (
    segments.includes(valididator.currentPathSegment) &&
    prevSegment.includes(valididator.prevPathSegment)
  );
};
