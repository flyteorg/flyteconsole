import { domainIdfromUrl } from '../domainIdFromURL';

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
    const location = new URL(`https://example.com/console/someotherlink/value/`);

    const result = domainIdfromUrl(location as unknown as Location);

    expect(result).toBe('');
  });
});
