import '@testing-library/jest-dom';
import { mockServer } from 'mocks/server';
import { obj } from './utils';

beforeAll(() => {
    mockServer.listen({
        onUnhandledRequest: (req) => {
            const message = `Unexpected request: ${obj(req)}`;
            console.error(message);
            throw new Error(message);
        }
    });
});

afterEach(() => {
    mockServer.resetHandlers();
});

afterAll(() => {
    mockServer.close();
});
