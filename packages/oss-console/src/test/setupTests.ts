import '@testing-library/jest-dom';

jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  prism: {},
}));

// mock axios to avoid open handles
const axiosMock = jest.mock('axios', () => ({
  request: jest.fn().mockResolvedValue({ data: {} }),
  defaults: {
    transformRequest: [],
    transformResponse: [],
    withCredentials: true,
  },
}));

beforeAll(() => {});

afterEach(() => {});

afterAll(() => {
  axiosMock.clearAllMocks();
});
