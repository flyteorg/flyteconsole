import { BreadcrumbValidatorInterface } from '../types';
import { breadcrumbDefaultvalidator } from './default';

describe('breadcrumbDefaultvalidator', () => {
  it('Matches url segment with value', () => {
    const validator: BreadcrumbValidatorInterface = {
      targetBreadcrumbId: 'test',
      currentPathSegment: 'test',
      currentPathValue: 'value',
      prevPathSegment: '',
      nextPathSegment: '',
      url: '',
    };

    const result = breadcrumbDefaultvalidator(validator);
    expect(result).toBe(true);
  });

  it('Empty url value', () => {
    const validator: BreadcrumbValidatorInterface = {
      targetBreadcrumbId: 'test',
      currentPathSegment: 'test',
      currentPathValue: '',
      prevPathSegment: '',
      nextPathSegment: '',
      url: '',
    };

    const result = breadcrumbDefaultvalidator(validator);
    expect(result).toBe(false);
  });

  it('IDs do not match', () => {
    const validator: BreadcrumbValidatorInterface = {
      targetBreadcrumbId: 'test',
      currentPathSegment: 'different',
      currentPathValue: '',
      prevPathSegment: '',
      nextPathSegment: '',
      url: '',
    };

    const result = breadcrumbDefaultvalidator(validator);
    expect(result).toBe(false);
  });

  it('Returns false when the value matches the path id', () => {
    const validator: BreadcrumbValidatorInterface = {
      targetBreadcrumbId: 'test',
      currentPathSegment: 'test',
      currentPathValue: 'test',
      prevPathSegment: '',
      nextPathSegment: '',
      url: '',
    };

    const result = breadcrumbDefaultvalidator(validator);
    expect(result).toBe(false);
  });

  it('Returns false when the value matches the path id case normalized', () => {
    const validator: BreadcrumbValidatorInterface = {
      targetBreadcrumbId: 'testValue',
      currentPathSegment: 'test',
      currentPathValue: 'test_value',
      prevPathSegment: '',
      nextPathSegment: '',
      url: '',
    };

    const result = breadcrumbDefaultvalidator(validator);
    expect(result).toBe(false);
  });

  it('Returns true when matching namespaced variants', () => {
    const validator: BreadcrumbValidatorInterface = {
      targetBreadcrumbId: 'test:namespace',
      currentPathSegment: 'test',
      currentPathValue: 'value',
      prevPathSegment: '',
      nextPathSegment: '',
      url: '',
    };

    const result = breadcrumbDefaultvalidator(validator);
    expect(result).toBe(true);
  });
});
