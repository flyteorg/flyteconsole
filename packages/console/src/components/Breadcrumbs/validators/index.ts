import { BreadcrumbValidator } from '../types';

export const breadcrumbDefaultvalidator: BreadcrumbValidator = (
  targetBreadcrumbId: string,
  currentPathSegment: string,
) => targetBreadcrumbId === currentPathSegment;
