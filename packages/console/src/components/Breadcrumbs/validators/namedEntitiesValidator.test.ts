import { BreadcrumbValidatorInterface } from '../types';
import { namedEntitiesValidatorExecutionsEmpty } from './fn';

describe('namedEntitiesValidator', () => {
  it('Matches on version page', () => {
    const validator: BreadcrumbValidatorInterface = {
      targetBreadcrumbId: 'named-entity:generic',
      currentPathSegment: 'launch_plan',
      currentPathValue: 'version123',
      prevPathSegment: 'projects',
      nextPathSegment: '',
      url: '',
    };

    const result = namedEntitiesValidatorExecutionsEmpty(validator);
    expect(result).toBe(true);
  });

  it('Matches on list page', () => {
    const validator: BreadcrumbValidatorInterface = {
      targetBreadcrumbId: 'named-entity:generic',
      currentPathSegment: 'launchPlans',
      currentPathValue: '',
      prevPathSegment: 'domains',
      nextPathSegment: '',
      url: '',
    };

    const result = namedEntitiesValidatorExecutionsEmpty(validator);
    expect(result).toBe(true);
  });

  it('Does not match if later in URL structure', () => {
    const validator: BreadcrumbValidatorInterface = {
      targetBreadcrumbId: 'named-entity:generic',
      currentPathSegment: 'launchPlans',
      currentPathValue: '',
      prevPathSegment: 'task',
      nextPathSegment: '',
      url: '',
    };

    const result = namedEntitiesValidatorExecutionsEmpty(validator);
    expect(result).toBe(false);
  });

  it('Does not match execution page', () => {
    const validator: BreadcrumbValidatorInterface = {
      targetBreadcrumbId: 'named-entity:generic',
      currentPathSegment: 'executions',
      currentPathValue: '',
      prevPathSegment: 'task',
      nextPathSegment: '',
      url: '',
    };

    const result = namedEntitiesValidatorExecutionsEmpty(validator);
    expect(result).toBe(false);
  });
});
