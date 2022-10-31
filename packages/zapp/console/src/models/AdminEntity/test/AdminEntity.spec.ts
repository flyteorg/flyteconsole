import {
  NotAuthorizedError,
  NotFoundError,
  adminApiUrl,
  getAdminEntity,
} from '@flyteconsole/components';
import { Admin } from '@flyteconsole/flyteidl';
import { mockServer } from 'mocks/server';
import { rest } from 'msw';

describe('getAdminEntity', () => {
  const messageType = Admin.Workflow;
  let path: string;

  beforeEach(() => {
    path = '/workflows/someId';
  });

  it('Returns a NotFoundError for 404 responses', async () => {
    mockServer.use(
      rest.get(adminApiUrl(path), (_, res, ctx) => {
        return res(ctx.status(404));
      }),
    );

    await expect(getAdminEntity({ path, messageType })).rejects.toEqual(new NotFoundError(path));
  });

  it('Returns a NotAuthorizedError for 401 responses', async () => {
    mockServer.use(
      rest.get(adminApiUrl(path), (_, res, ctx) => {
        return res(ctx.status(401));
      }),
    );

    await expect(getAdminEntity({ path, messageType })).rejects.toBeInstanceOf(NotAuthorizedError);
  });
});
