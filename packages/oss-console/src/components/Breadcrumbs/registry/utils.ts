import { defaultValue } from '../defaultValue';
import { Breadcrumb } from '../types';
import { breadcrumbDefaultvalidator } from '../validators';

const defaultBreadcrumb: Breadcrumb = {
  id: 'default',
  label: '',
  defaultValue,
  selfLink: '',
  asyncData: undefined,
  validator: breadcrumbDefaultvalidator,
  viewAllLink: '',
  required: false,
  asyncValue: undefined,
  asyncViewAllLink: undefined,
  asyncSelfLink: undefined,
};

export const makeBreadcrumb = (config: Partial<Breadcrumb>) => {
  return { ...defaultBreadcrumb, ...config };
};
