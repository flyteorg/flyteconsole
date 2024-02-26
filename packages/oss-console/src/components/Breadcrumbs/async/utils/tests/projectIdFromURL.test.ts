import { projectIdfromUrl } from '../projectIdFromURL';

describe('projectIdfromUrl', () => {
  it('returns the correct project ID from the URL', () => {
    const value = 'projectId';
    const location = new URL(`https://example.com/console/projects/${value}/details/abc`);

    Object.defineProperty(window, 'location', {
      value: location as unknown as Location,
      writable: true,
    });

    jest.spyOn(window.location, 'pathname', 'get').mockReturnValue(location.pathname);

    const result = projectIdfromUrl();

    expect(result).toBe(value);
  });

  it('returns an empty string if no id is in the URL', () => {
    const location = new URL(`https://example.com/console/someotherlink/value/`);

    Object.defineProperty(window, 'location', {
      value: location as unknown as Location,
      writable: true,
    });

    jest.spyOn(window.location, 'pathname', 'get').mockReturnValue(location.pathname);

    const result = projectIdfromUrl();

    expect(result).toBe('');
  });
});
