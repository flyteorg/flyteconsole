import { NotAuthorizedError, NotFoundError } from 'errors';
import { Admin } from 'flyteidl';
import { mockServer } from 'mocks/server';
import { apiPath } from 'mocks/utils';
import { rest } from 'msw';
import { getAdminEntity } from '../AdminEntity';

describe('getAdminEntity', () => {
    const messageType = Admin.Workflow;
    let path: string;

    beforeEach(() => {
        path = '/workflows/someId';
    });

    it('Returns a NotFoundError for 404 responses', async () => {
        mockServer.use(
            rest.get(apiPath(path), (_, res, ctx) => {
                return res(ctx.status(404));
            })
        );

        await expect(getAdminEntity({ path, messageType })).rejects.toEqual(
            new NotFoundError(path)
        );
    });

    it('Returns a NotAuthorizedError for 401 responses', async () => {
        mockServer.use(
            rest.get(apiPath(path), (_, res, ctx) => {
                return res(ctx.status(401));
            })
        );

        await expect(
            getAdminEntity({ path, messageType })
        ).rejects.toBeInstanceOf(NotAuthorizedError);
    });
});
