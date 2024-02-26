import { renderHook } from '@testing-library/react-hooks';
import { History } from 'history';
import { useDomainPathUpgrade } from '../useDomainPathUpgrade';
import { Routes } from '../routes';

jest.mock('@clients/common/environment', () => {
  const original = jest.requireActual('@clients/common/environment');
  return {
    ...original,
    env: {
      BASE_URL: '/console',
    },
    makeRoute: (path: string) => `/console${path}`.replace(/\/+$/, ''),
  };
});

const history = {
  push: jest.fn(),
} as unknown as History<any>;

const localProjectDomain = {
  project: 'flyteexamples',
  domain: 'development',
};

describe('useDomainPathUpgrade', () => {
  afterEach(() => {
    localProjectDomain.project = 'flyteexamples';
    localProjectDomain.domain = 'development';
    jest.clearAllMocks(); // Clear the history push mock after each test
  });

  it('should upgrade the URL structure with localstorage memory if no query param', () => {
    renderHook(() =>
      useDomainPathUpgrade(
        localProjectDomain,
        '/console/projects/flyteexamples/executions',
        '?something=else',
        history,
      ),
    );

    // The hook should update the URL structure
    expect(history.push).toHaveBeenCalledWith(
      '/console/projects/flyteexamples/domains/development/executions?something=else',
    );
  });

  it('should prefer domain param when set in the old format explicitly', () => {
    renderHook(() =>
      useDomainPathUpgrade(
        localProjectDomain,
        '/console/projects/flyteexamples/executions',
        '?something=else&domain=staging',
        history,
      ),
    );

    expect(history.push).toHaveBeenCalledWith(
      '/console/projects/flyteexamples/domains/staging/executions?something=else',
    );
  });

  it('should redirect to domain select if no domain is found', () => {
    renderHook(() =>
      useDomainPathUpgrade(
        { project: 'flyteexamples', domain: '' },
        '/console/projects/flyteexamples/executions',
        '',
        history,
      ),
    );

    expect(history.push).toHaveBeenCalledWith(Routes.SelectProject.path);
  });

  it('should not upgrade the URL structure when already upgraded', () => {
    renderHook(() =>
      useDomainPathUpgrade(
        localProjectDomain,
        '/console/projects/flyteexamples/domains/development/executions',
        '',
        history,
      ),
    );

    expect(history.push).not.toHaveBeenCalled();
  });

  it('should ignore Routes.SelectProject.path', () => {
    renderHook(() =>
      useDomainPathUpgrade(localProjectDomain, Routes.SelectProject.path, '', history),
    );

    expect(history.push).not.toHaveBeenCalled();
  });
  it('should ignore any dashboard route', () => {
    renderHook(() => useDomainPathUpgrade(localProjectDomain, '/dashboard/something', '', history));

    expect(history.push).not.toHaveBeenCalled();
  });

  it('should ignore while flyte console is mounting (no projects segment)', () => {
    renderHook(() => useDomainPathUpgrade(localProjectDomain, '/console', '', history));

    expect(history.push).not.toHaveBeenCalled();
  });
});
