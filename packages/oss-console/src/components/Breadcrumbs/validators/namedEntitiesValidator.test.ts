import { BreadcrumbValidatorInterface } from '../types';
import { executionsValidatorEmpty, namedEntitiesValidatorExecutionsEmpty } from './fn';

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

describe('namedEntitiesValidator, Execution Variant', () => {
  it('Matches on execution page', () => {
    const validator: BreadcrumbValidatorInterface = {
      targetBreadcrumbId: 'named-entity:execution',
      currentPathSegment: 'executions',
      currentPathValue: 'version123',
      prevPathSegment: '',
      nextPathSegment: '',
      url: '',
    };

    const result = executionsValidatorEmpty(validator);
    expect(result).toBe(true);
  });

  it('Matches on execution list page', () => {
    const validator: BreadcrumbValidatorInterface = {
      targetBreadcrumbId: 'named-entity:execution',
      currentPathSegment: 'executions',
      currentPathValue: 'Executions',
      prevPathSegment: '',
      nextPathSegment: '',
      url: '',
    };

    const result = executionsValidatorEmpty(validator);
    expect(result).toBe(true);
  });

  it('Does not match on a different entity list page', () => {
    const validator: BreadcrumbValidatorInterface = {
      targetBreadcrumbId: 'named-entity:execution',
      currentPathSegment: 'launchPlans',
      currentPathValue: 'Launch Plans',
      prevPathSegment: '',
      nextPathSegment: '',
      url: '',
    };

    const result = executionsValidatorEmpty(validator);
    expect(result).toBe(false);
  });

  it('Does not match if later in URL structure', () => {
    const validator: BreadcrumbValidatorInterface = {
      targetBreadcrumbId: 'named-entity:generic',
      currentPathSegment: 'executions',
      currentPathValue: '',
      prevPathSegment: 'task',
      nextPathSegment: 'versions',
      url: '',
    };

    const result = executionsValidatorEmpty(validator);
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

    const result = executionsValidatorEmpty(validator);
    expect(result).toBe(false);
  });
});
