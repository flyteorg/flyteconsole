/* eslint-disable import/no-import-module-exports */
/* eslint-disable no-console */
import * as webpack from 'webpack';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import HTMLWebpackPlugin from 'html-webpack-plugin';

import { ASSETS_PATH as publicPath, processEnv } from './env';
import {
  type Mode,
  BUILD_OUTPUT_PATH,
  DEFAULT_HTML_WPC_OPTS,
  CDN_REACT_DOM,
  CDN_REACT,
  WEBPACK_PATHS,
  getConfigFile,
  getDefinePlugin,
  statsWriterPlugin,
  resolveOptions,
  getModuleOptions,
  getShouldLoadReactFromCDN,
  logWebpackStats,
} from './webpack.utilities';

const { merge } = require('webpack-merge');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = (_env: any, argv: { mode: Mode }) => {
  const { mode } = argv;

  // Log webpack stats
  logWebpackStats(mode);

  const configFile = getConfigFile(mode);
  const webpackConfig = require(WEBPACK_PATHS[mode]);
  const shouldLoadReactFromCDN = getShouldLoadReactFromCDN(mode);

  const htmlWebpackOptions: HTMLWebpackPlugin.Options = merge(
    DEFAULT_HTML_WPC_OPTS,
    {
      ...webpackConfig.htmlWebpackOptions,
      processEnv: JSON.stringify(processEnv),
      ...(shouldLoadReactFromCDN
        ? {
            cdnSettings: {
              cdnReact: CDN_REACT,
              cdnReactDOM: CDN_REACT_DOM,
            },
          }
        : {}),
    },
  );

  /**
   * Client configuration
   *
   * Client is compiled into multiple chunks that are result to dynamic imports.
   */
  const clientConfig: webpack.Configuration = merge(
    {
      mode,

      name: 'client',

      target: 'web',

      entry: ['./src/client'],

      output: {
        publicPath,
        path: BUILD_OUTPUT_PATH,
        filename: '[name]-[fullhash:8].js',
        chunkFilename: '[name]-[chunkhash].chunk.js',
      },

      // externals
      ...(shouldLoadReactFromCDN
        ? {
            externals: {
              'react-dom': 'ReactDOM',
              react: 'React',
            },
          }
        : {}),

      resolve: resolveOptions,

      module: getModuleOptions(mode),

      plugins: [
        statsWriterPlugin,
        getDefinePlugin(false),
        new NodePolyfillPlugin({
          includeAliases: ['http', 'https', 'stream', 'zlib'],
        }),
        new ForkTsCheckerWebpackPlugin({
          async: false,
          typescript: {
            build: true,
            configFile,
            compiler: 'typescript',
          },
        }),
        new CopyPlugin({
          patterns: [
            { from: './src/assets/public', to: '' },
            { from: './src/assets/favicon.ico', to: '' },
            { from: './src/assets/favicon.svg', to: '' },
          ],
        }),
        new HTMLWebpackPlugin(htmlWebpackOptions),
      ],

      stats: {
        errors: true,
        children: true,
        errorDetails: true,
      },

      optimization: {
        splitChunks: {
          cacheGroups: {
            vendor: {
              chunks: 'initial',
              enforce: true,
              name: 'vendor',
              priority: 10,
              test: /[\\/]node_modules/,
            },
          },
        },
      },
    },
    webpackConfig.clientConfig,
  );

  /**
   * Server configuration
   *
   * Server bundle is compiled as a CommonJS package that exports an Express middleware.
   *
   * Note: This configuration is ONLY needed if we need to run 'yarn build' locally, in dev mode,
   * otherwise the server config is bypassed completely in devmode since 'yarn start' will
   * spin up its own server locally and will programatically load the client config only defined above...
   */
  const serverConfig: webpack.Configuration = merge(
    {
      mode,
      name: 'server',
      target: 'node',
      entry: ['./src/server'],

      output: {
        path: BUILD_OUTPUT_PATH,
        filename: 'server.js',
        libraryTarget: 'commonjs2',
        clean: true,
      },

      externals: [nodeExternals({ allowlist: /lyft/ })],
      externalsPresets: { node: true },

      resolve: resolveOptions,

      module: getModuleOptions(mode),

      plugins: [
        // new ForkTsCheckerWebpackPlugin({
        //   typescript: {
        //     configFile,
        //     build: true
        //   }
        // }),
        // getDefinePlugin(true),
      ],
    },
    webpackConfig.serverConfig,
  );

  return [clientConfig, serverConfig];
};
