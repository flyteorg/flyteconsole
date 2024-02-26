import { Project } from '../../../../../models/Project/types';
import { formatProjectEntitiesURLAware } from '../formatProjectEntities';

jest.mock('@clients/common/environment', () => ({
  ...jest.requireActual('@clients/common/environment'),
  env: {
    BASE_URL: '/console',
  },
  makeRoute: (path: string) => `/console${path}`.replace(/\/+$/, ''),
}));

describe('formatProjectEntitiesAsDomains', () => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname: '/console',
    },
    writable: true, // possibility to override
  });

  const mockData: Project[] = [
    {
      id: 'project1',
      name: 'Project 1',
      domains: [
        { id: 'domain1', name: 'Domain 1' },
        { id: 'domain2', name: 'Domain 2' },
      ],
    },
    {
      id: 'project2',
      name: 'Project 2',
      domains: [
        { id: 'domain3', name: 'Domain 3' },
        { id: 'domain4', name: 'Domain 4' },
      ],
    },
  ];

  it('should format project/domain as execution links generally', () => {
    const result = formatProjectEntitiesURLAware('/dashboard/some/random/url', 'domain4', mockData);

    expect(result).toEqual([
      {
        title: 'Project 1',
        id: 'project1',
        createdAt: '',
        url: '/console/projects/project1/domains/domain1/executions',
      },
      {
        title: 'Project 2',
        id: 'project2',
        createdAt: '',
        url: '/console/projects/project2/domains/domain4/executions',
      },
    ]);
  });

  it('should keep flyte app scrope (workflows)', () => {
    const result = formatProjectEntitiesURLAware(
      '/console/projects/project1/domains/domain2/workflows/some/sub/page',
      'domain1',
      mockData,
    );

    expect(result).toEqual([
      {
        title: 'Project 1',
        id: 'project1',
        createdAt: '',
        url: '/console/projects/project1/domains/domain1/workflows',
      },
      {
        title: 'Project 2',
        id: 'project2',
        createdAt: '',
        url: '/console/projects/project2/domains/domain3/workflows',
      },
    ]);
  });

  it('fallback if not in list, first domain is used per project', () => {
    const result = formatProjectEntitiesURLAware(
      '/console/projects/project1/domains/domain2/workflows/some/sub/page',
      'not a real domain',
      mockData,
    );

    expect(result).toEqual([
      {
        title: 'Project 1',
        id: 'project1',
        createdAt: '',
        url: '/console/projects/project1/domains/domain1/workflows',
      },
      {
        title: 'Project 2',
        id: 'project2',
        createdAt: '',
        url: '/console/projects/project2/domains/domain3/workflows',
      },
    ]);
  });
});
