import { setupServer } from 'msw/node';
import { AdminServer, createAdminServer } from './createAdminServer';

const { handlers, server } = createAdminServer();
export type MockServer = AdminServer;

export const mockServer: MockServer = {
  ...setupServer(...handlers),
  ...server,
};
