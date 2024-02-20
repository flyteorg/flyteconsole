import { Project } from '../../../../../models/Project/types';
import { formatProjectEntitiesAsDomains } from '../formatProjectEntitiesAsDomains';

jest.mock('@clients/common/environment', () => ({
  ...jest.requireActual('@clients/common/environment'),
  env: {
    BASE_URL: '/console',
  },
  makeRoute: (path: string) => `${path}`.replace(/\/+$/, ''),
}));

Object.defineProperty(window, 'location', {
  value: {
    pathname: '/console',
  },
  writable: true, // possibility to override
});

describe('formatProjectEntitiesAsDomains', () => {
  const mockData: Project[] = [
    {
      id: 'project1',
      name: 'project1',
      domains: [
        { id: 'domain1', name: 'Domain 1' },
        { id: 'domain2', name: 'Domain 2' },
      ],
    },
    {
      id: 'project2',
      name: 'project2',
      domains: [
        { id: 'domain3', name: 'Domain 3' },
        { id: 'domain4', name: 'Domain 4' },
      ],
    },
  ];

  it('should format project/domain as execution links generally', () => {
    const result = formatProjectEntitiesAsDomains(
      '/dashboard/some/random/url',
      'project1',
      mockData,
    );

    expect(result).toEqual([
      {
        title: 'Domain 1',
        id: 'domain1',
        createdAt: '',
        url: '/console/projects/project1/domains/domain1/executions',
      },
      {
        title: 'Domain 2',
        id: 'domain2',
        createdAt: '',
        url: '/console/projects/project1/domains/domain2/executions',
      },
    ]);
  });

  it('should keep flyte app scrope (workflows)', () => {
    const result = formatProjectEntitiesAsDomains(
      'console/projects/project1/domains/domain2/workflows/some/sub/page',
      'project1',
      mockData,
    );

    expect(result).toEqual([
      {
        title: 'Domain 1',
        id: 'domain1',
        createdAt: '',
        url: '/console/projects/project1/domains/domain1/workflows',
      },
      {
        title: 'Domain 2',
        id: 'domain2',
        createdAt: '',
        url: '/console/projects/project1/domains/domain2/workflows',
      },
    ]);
  });
});
