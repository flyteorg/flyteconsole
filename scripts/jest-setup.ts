import '@testing-library/jest-dom';
import { randomFillSync } from 'crypto';
import 'whatwg-fetch';
import { TextEncoder } from 'util';

// text encoder polyfill
window.TextEncoder = TextEncoder;

// Mock crypto API. This is needed for the `nanoid` package.
Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues<T extends ArrayBufferView | null>(array: T): T {
      if (array) {
        // @ts-ignore
        return randomFillSync(array as ArrayBufferView) as unknown as T;
      }
      return array as T;
    },
    subtle: {} as SubtleCrypto,
    randomUUID: () => '00000000-0000-0000-0000-000000000000',
  },
});

// Supress react act() warnings
// https://github.com/testing-library/react-testing-library/issues/459

// eslint-disable-next-line no-console
const consoleError = console.error;
let mockConsoleError: jest.SpyInstance;

// eslint-disable-next-line no-console
const consoleWarn = console.warn;
let mockConsoleWarn: jest.SpyInstance;
beforeAll(() => {
  mockConsoleError = jest.spyOn(console, 'error').mockImplementation((...args) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (
      message.includes(
        'When testing, code that causes React state updates should be wrapped into act(...)',
      ) ||
      message.includes('antd') ||
      message.includes('ReactDOM.render') ||
      message.includes('MUI') ||
      message.includes('ERROR:') ||
      message.includes('Warning:') ||
      message.includes('queryFn') ||
      message.includes('TypeError') ||
      message.includes('BASE_URL')
    ) {
      return;
    }

    return consoleError.call(console, args);
  });

  mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation((...args) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (message.includes('MUI')) {
      return;
    }

    return consoleWarn.call(console, args);
  });
});

afterAll(() => {
  mockConsoleError.mockRestore();
  mockConsoleWarn.mockRestore();
});
