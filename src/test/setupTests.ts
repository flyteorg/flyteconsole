import '@testing-library/jest-dom';
import { apiPrefix } from 'mocks/constants';
import { mockServer } from 'mocks/server';

// Make sure the env object exists in a sane way
window.env = {
    ADMIN_API_URL: apiPrefix,
    BASE_URL: ''
};

beforeAll(() => {
    mockServer.listen();
});

afterEach(() => {
    mockServer.resetHandlers();
});

afterAll(() => {
    mockServer.close();
});
