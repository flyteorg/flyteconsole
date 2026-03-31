import '@testing-library/jest-dom';

jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  prism: {},
}));

// Avoid real network I/O from fetch in unit tests.
const fetchMock = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    url: 'http://localhost/',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve({}),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    text: () => Promise.resolve(''),
  } as Response),
);

global.fetch = fetchMock as typeof fetch;

beforeAll(() => {});

afterEach(() => {});

afterAll(() => {
  fetchMock.mockClear();
});
