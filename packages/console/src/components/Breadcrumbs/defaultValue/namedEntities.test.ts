import { Breadcrumb } from '../types';
import { namedEntitiesDefaultValue } from './namedEntities';

describe('namedEntitiesDefaultValue', () => {
  it('returns the correct default value launch plan', () => {
    const location = {
      pathname:
        'project/projectId/domain/domainId/launch_plan/entityId/versions/versionId',
    } as Location;

    const breadcrumb = {} as Breadcrumb;

    const result = namedEntitiesDefaultValue(location, breadcrumb);

    expect(result).toBe('Launch Plans');
  });

  it('returns the correct default value tasks', () => {
    const location = {
      pathname: 'project/projectId/domain/domainId/tasks/entityId',
    } as Location;

    const breadcrumb = {} as Breadcrumb;

    const result = namedEntitiesDefaultValue(location, breadcrumb);

    expect(result).toBe('Tasks');
  });

  it('returns the correct default value tasks from a url fragment', () => {
    const location = {
      pathname: 'launch_plan',
    } as Location;

    const breadcrumb = {} as Breadcrumb;

    const result = namedEntitiesDefaultValue(location, breadcrumb);

    expect(result).toBe('Launch Plans');
  });

  // Add more test cases as needed
});
