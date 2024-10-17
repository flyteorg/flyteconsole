import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  prism: {},
}));

// mock axios to avoid open handles
const axiosMock = jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    request: jest.fn().mockResolvedValue({ response: {} }),
    get: jest.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    }
  }),
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
