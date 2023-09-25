import { domainIdfromUrl, projectIdfromUrl } from './utils';

describe('projectIdfromUrl', () => {
  it('returns the correct project ID from the URL', () => {
    const value = 'projectId';
    const location = new URL(
      `https://example.com/console/projects/${value}/details/abc`,
    );

    Object.defineProperty(window, 'location', {
      value: location as unknown as Location,
      writable: true,
    });

    jest
      .spyOn(window.location, 'pathname', 'get')
      .mockReturnValue(location.pathname);

    const result = projectIdfromUrl();

    expect(result).toBe(value);
  });

  it('returns an empty string if no id is in the URL', () => {
    const location = new URL(
      `https://example.com/console/someotherlink/value/`,
    );

    Object.defineProperty(window, 'location', {
      value: location as unknown as Location,
      writable: true,
    });

    jest
      .spyOn(window.location, 'pathname', 'get')
      .mockReturnValue(location.pathname);

    const result = projectIdfromUrl();

    expect(result).toBe('');
  });
});

describe('domainIdfromUrl', () => {
  it('returns the correct domain ID from the URL', () => {
    const value = 'domainId';
    const location = new URL(
      `https://example.com/console/project/projectId/domains/${value}/details/abc`,
    );

    const result = domainIdfromUrl(location as unknown as Location);

    expect(result).toBe(value);
  });

  it('returns the correct domain ID from the search params', () => {
    const value = 'domainId';
    const location = new URL(
      `https://example.com/console/project/projectId/details/abc?domain=${value}`,
    );

    const result = domainIdfromUrl(location as unknown as Location);

    expect(result).toBe(value);
  });

  it('prefer id in pathname over search params', () => {
    const value = 'domainId';
    const location = new URL(
      `https://example.com/console/project/projectId/domains/${value}/details/abc?domain=skipMe`,
    );

    const result = domainIdfromUrl(location as unknown as Location);

    expect(result).toBe(value);
  });

  it('returns an empty string if no id is in the URL', () => {
    const location = new URL(
      `https://example.com/console/someotherlink/value/`,
    );

    const result = domainIdfromUrl(location as unknown as Location);

    expect(result).toBe('');
  });
});
