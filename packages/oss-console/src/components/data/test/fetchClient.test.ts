import { fetchClient } from '../fetchClient';

function buildResponse(overrides: Partial<Response> & Pick<Response, 'status'>): Response {
  const { status } = overrides;
  return {
    ok: status >= 200 && status < 300,
    statusText: overrides.statusText ?? '',
    type: 'basic',
    url: 'http://localhost/api',
    redirected: false,
    headers: new Headers(),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    ...overrides,
  } as Response;
}

describe('fetchClient.request', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation(() =>
      Promise.resolve(
        buildResponse({
          status: 200,
          statusText: 'OK',
          ok: true,
        }),
      ),
    );
  });

  it('calls fetch with redirect: manual', async () => {
    await fetchClient.request({ url: 'http://localhost/api' });
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost/api',
      expect.objectContaining({ redirect: 'manual' }),
    );
  });

  it('throws HttpRequestError with status for 3xx redirect responses', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve(
        buildResponse({
          status: 302,
          statusText: 'Found',
          ok: false,
          headers: new Headers({ Location: '/login' }),
        }),
      ),
    );

    await expect(
      fetchClient.request({ url: 'http://localhost/api', skipAuthRefresh: true }),
    ).rejects.toMatchObject({
      name: 'HttpRequestError',
      response: { status: 302, statusText: 'Found' },
    });
  });

  it('throws HttpRequestError for opaqueredirect (cross-origin redirect) instead of TypeError', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve(
        buildResponse({
          status: 0,
          statusText: '',
          ok: false,
          type: 'opaqueredirect',
        }),
      ),
    );

    await expect(
      fetchClient.request({ url: 'http://localhost/api', skipAuthRefresh: true }),
    ).rejects.toMatchObject({
      name: 'HttpRequestError',
      message: 'Redirect',
      response: { status: 0, statusText: 'Redirect' },
    });
  });

  it('does not treat 304 Not Modified as a redirect error', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve(
        buildResponse({
          status: 304,
          statusText: 'Not Modified',
          ok: false,
        }),
      ),
    );

    await expect(
      fetchClient.request({ url: 'http://localhost/api', skipAuthRefresh: true }),
    ).rejects.toMatchObject({
      name: 'HttpRequestError',
      message: 'Not Modified',
      response: expect.objectContaining({ status: 304 }),
    });
  });
});
