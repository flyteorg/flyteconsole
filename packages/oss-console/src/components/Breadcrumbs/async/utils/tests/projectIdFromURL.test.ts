import { projectIdfromUrl } from '../projectIdFromURL';

describe('projectIdfromUrl', () => {
  it('returns the correct project ID from the URL', () => {
    const value = 'projectId';
    const pathname = `/console/projects/${value}/details/abc`;
    window.history.pushState({}, '', pathname);

    const result = projectIdfromUrl();

    expect(result).toBe(value);
  });

  it('returns an empty string if no id is in the URL', () => {
    window.history.pushState({}, '', '/console/someotherlink/value/');

    const result = projectIdfromUrl();

    expect(result).toBe('');
  });
});
