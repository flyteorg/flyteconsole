import { setupServer } from 'msw/lib/types/node';
import { bindHandlers } from './handlers';

const server = setupServer();
const handlers = bindHandlers(server);
export const mockServer = { ...server, ...handlers };
