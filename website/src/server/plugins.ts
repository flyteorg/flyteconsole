/* eslint-disable import/no-dynamic-require */
import chalk from 'chalk';

const env = require('../../env');

const middleware = env.PLUGINS_MODULE
  ? require(env.PLUGINS_MODULE)?.middleware
  : {};

// eslint-disable-next-line import/no-mutable-exports
let exportMiddleware = (_app: any) => {
  chalk.magenta('No middleware found. Skipping...');
};
if (Array.isArray(middleware)) {
  exportMiddleware = app => {
    chalk.magenta('Found middleware plugins, applying...');
    middleware.forEach(m => m(app));
  };
} else if (middleware !== undefined) {
  exportMiddleware = (_app: any) => {
    chalk.red(
      `Expected middleware to be of type Array, but got ${middleware} instead`,
    );
  };
}

export const applyMiddleware = exportMiddleware;
