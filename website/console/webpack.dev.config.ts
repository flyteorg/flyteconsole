import chalk from 'chalk';
import path from 'path';
import { WebpackOptionsNormalized } from 'webpack';
import { Options as HtmlWebpackOptions } from 'html-webpack-plugin';
import DevServer from 'webpack-dev-server';
import webpack from 'webpack';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import * as envVars from './env';

const {
  ASSETS_PATH: publicPath,
  CERTIFICATE_PATH,
  BASE_URL,
  LOCAL_DEV_HOST,
  ADMIN_API_USE_SSL,
} = envVars;

/**
 * CONSTANTS
 */
const devtool = 'source-map';

const fs = require('fs');

// Check if certificate provided and if not - exit early
if (
  !fs.existsSync(`${CERTIFICATE_PATH}/server.key`) ||
  !fs.existsSync(`${CERTIFICATE_PATH}/server.crt`)
) {
  console.log(
    chalk.red(`ERROR: Can not locate server.key and server.crt in ${CERTIFICATE_PATH} location`),
  );
  console.log(
    chalk.red('Please re-genereate your site certificates by running'),
    'yarn gen:ssl',
    chalk.red('than re-run the command'),
  );
  process.exit(0);
}

export const htmlWebpackOptions: HtmlWebpackOptions = {
  publicPath,
  minify: false,
  hash: false,
  showErrors: true,
  newRelic: false,
};

type ClientOptions = Partial<WebpackOptionsNormalized> & {
  devServer?: DevServer.Configuration;
};
/**
 * Webpack configuration for client code.
 */
export const clientConfig: ClientOptions = {
  devtool,

  watch: true,

  output: {
    clean: true,
  },

  devServer: {
    hot: true,
    open: [BASE_URL || '/'],
    port: 8080,
    host: LOCAL_DEV_HOST,
    allowedHosts: 'all',
    https: ADMIN_API_USE_SSL === 'https',

    devMiddleware: {
      writeToDisk: true,
    },

    historyApiFallback: {
      logger: console.log.bind(console),
      disableDotRule: true,
    },

    static: {
      directory: path.join(__dirname, 'dist'),
      publicPath,
    },

    server: {
      type: ADMIN_API_USE_SSL,
      options: {
        key: fs.readFileSync(`${CERTIFICATE_PATH}/server.key`),
        cert: fs.readFileSync(`${CERTIFICATE_PATH}/server.crt`),
      },
    },

    client: {
      logging: 'verbose',
      overlay: false,
      progress: true,
    },
  },

  // plugins: [new BundleAnalyzerPlugin()],
};

/**
 * Server configuration
 *
 * Server bundle is compiled as a CommonJS package that exports an Express middleware.
 *
 * Note: This configuration is ONLY needed if we need to run 'yarn build' locally, in dev mode,
 * otherwise the server config is bypassed completely in devmode since 'yarn start' will
 * spin up its own server locally and will programatically load the client config only defined above...
 */
export const serverConfig: webpack.Configuration = {
  devtool,
};

/**
 * Caution: even though we export both configs, know that the server config will only be used
 * if we need to build code in dev mode for some reason (like debugging production build errors
 * locally and you need to enable more logging or verbosity).
 * Otherwise, the 'yarn start' command used for development will programatically load clientConfig
 * and spin up a local server for development using ts-node and ./src/server/index.ts as an entrypoint
 * and serverConfig is completely ignored.
 */

export default { clientConfig, serverConfig };
