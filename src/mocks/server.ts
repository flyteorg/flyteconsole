import { setupServer } from 'msw/lib/types/node';
import { getDefaultData } from './getDefaultData';
import { bindHandlers } from './handlers';

const server = setupServer(...getDefaultData());
const handlers = bindHandlers(server);
export const mockServer = { ...server, ...handlers };
