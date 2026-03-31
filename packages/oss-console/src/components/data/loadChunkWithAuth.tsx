import NotAuthorizedError from '@clients/common/Errors/NotAuthorizedError';
import React from 'react';
import { ErrorHandler } from '../Errors/ErrorHandler';
import { refreshAuth } from './fetchClient';

type ImportFunction = () => Promise<{ default: React.ComponentType<any> }>;

export const loadChunkWithAuth = (
  importFunction: ImportFunction,
): Promise<{ default: React.ComponentType<any> }> => {
  return new Promise((resolve, _reject) => {
    importFunction()
      .then((res) => {
        resolve(res);
      })
      .catch((_error) => {
        refreshAuth(undefined, true)
          .then((_res) => {
            importFunction().then((res) => {
              resolve(res);
            });
          })

          .catch((_err) => {
            // if loading chunk failed, show unauthorized error
            resolve({
              default: () => <ErrorHandler error={new NotAuthorizedError('chunk_error')} />,
            });
          });
      });
  });
};
