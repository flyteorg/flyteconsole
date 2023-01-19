import * as webpack from 'webpack';
import { Options as HtmlWebpackOptions } from 'html-webpack-plugin';

import {
  LOCAL_DEV_HOST,
  CERTIFICATE_PATH,
  ASSETS_PATH as publicPath,
  BASE_URL,
  ADMIN_API_USE_SSL,
} from './env';
import { BUILD_OUTPUT_PATH, ClientConfig } from './webpack.utilities';

const fs = require('fs');

export const htmlWebpackOptions: HtmlWebpackOptions = {
  template: './src/assets/index.html',
  publicPath: publicPath,
  inject: 'body',
  minify: false,
  hash: false,
  showErrors: true,
};

/**
 * Client configuration
 *
 * Client is compiled into multiple chunks that are result to dynamic imports.
 */
export const clientConfig: ClientConfig = {
  mode: 'development',
  devtool: 'eval-source-map',
  output: {
    filename: '[name].js',
  },
  optimization: {
    emitOnErrors: false,
    runtimeChunk: 'single',
  },
  devServer: {
    historyApiFallback: {
      logger: console.log.bind(console),
      disableDotRule: true,
    },
    hot: true,
    open: [BASE_URL || '/'],
    static: {
      directory: BUILD_OUTPUT_PATH,
      publicPath,
    },
    compress: true,
    port: 3000,
    host: LOCAL_DEV_HOST,
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
    devMiddleware: {
      serverSideRender: true,
    },
  },
  plugins: [],
};

/**
 * Server configuration
 *
 * Server bundle is compiled as a CommonJS package that exports an Express middleware
 */
export const serverConfig: webpack.Configuration = {
  devtool: 'eval-source-map',
};

export default { clientConfig, serverConfig };
