/* eslint-disable no-console */
import * as webpack from 'webpack';
import * as path from 'path';
import chalk from 'chalk';
import { WebpackOptionsNormalized } from 'webpack';
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import { Options as HtmlWebpackOptions } from 'html-webpack-plugin';

import {
  processEnv as env,
  ASSETS_PATH as publicPath,
  ADMIN_API_USE_SSL,
  CERTIFICATE_PATH,
} from './env';

const fs = require('fs');

export type Mode = 'development' | 'production';

export type ClientConfig = Partial<WebpackOptionsNormalized> & {
  devServer?: DevServerConfiguration;
};
/*
 **************************************************************************************
 **************************************************************************************
 ***********************         CONSTANTS        *************************************
 **************************************************************************************
 **************************************************************************************
 */
/** Current service name */
export const SERVICE_NAME = process.env.SERVICE_NAME || 'not set';

/** Absolute path to webpack output folder */
export const BUILD_OUTPUT_PATH = path.join(__dirname, 'dist');

export const DEFAULT_HTML_WPC_OPTS: HtmlWebpackOptions = {
  template: './src/assets/index.html',
  inject: 'body',
  publicPath,
};

export const PACKAGE_JSON_CONFIG: {
  dependencies: { [libName: string]: string };
  devDependencies: { [libName: string]: string };
  peerDependencies: { [libName: string]: string };
} = require('./package.json');

/** CDN path to use minified react and react-DOM instead of prebuild version */
export const CDN_REACT = `//unpkg.com/react@${absoluteVersion(
  PACKAGE_JSON_CONFIG.peerDependencies.react,
)}/umd/react.production.min.js`;
export const CDN_REACT_DOM = `//unpkg.com/react-dom@${absoluteVersion(
  PACKAGE_JSON_CONFIG.peerDependencies['react-dom'],
)}/umd/react-dom.production.min.js`;

export const WEBPACK_PATHS = {
  production: path.resolve('webpack.prod.config.ts'),
  development: path.resolve('webpack.dev.config.ts'),
};

/*
 **************************************************************************************
 **************************************************************************************
 ***********************         UTILITIES        *************************************
 **************************************************************************************
 **************************************************************************************
 */

// Determines which config file to use based on current development mode.
export const getConfigFile = (mode: Mode): string =>
  mode === 'production'
    ? path.resolve(__dirname, './tsconfig.build.json')
    : path.resolve(__dirname, './tsconfig.build.json');

// Determines whether to use CDN based on current development mode.
export const getShouldLoadReactFromCDN = (mode: Mode) =>
  mode === 'production' ||
  !fs.existsSync(path.resolve(__dirname, '../node_modules/react'));

// Report current configuration
export const logWebpackStats = (mode: Mode) => {
  if (getShouldLoadReactFromCDN(mode) && mode === 'development') {
    chalk.red(`ERROR: Could not find react installed. Using CDN fallback`);
  }

  if (
    ADMIN_API_USE_SSL === 'https' &&
    (!fs.existsSync(`${CERTIFICATE_PATH}/server.key`) ||
      !fs.existsSync(`${CERTIFICATE_PATH}/server.crt`))
  ) {
    console.log(
      chalk.red(
        `ERROR: Can not locate server.key and server.crt in ${CERTIFICATE_PATH} location`,
      ),
    );
    console.log(
      chalk.red('Please re-genereate your site certificates by running'),
      'make generate_ssl',
      chalk.red('than re-run the command'),
    );
    process.exit(0);
  }

  console.log(
    chalk.cyan('Exporting Webpack config with following configurations:'),
  );
  console.log(chalk.blue('Environment:'), chalk.green(env.NODE_ENV));
  console.log(
    chalk.blue('Output directory:'),
    chalk.green(path.resolve(BUILD_OUTPUT_PATH)),
  );
  console.log(chalk.blue('Public path:'), chalk.green(publicPath));
  console.log(
    chalk.blue('TSconfig file used for build:'),
    chalk.green(getConfigFile(mode)),
  );
};

/** Get clean version of a version string of package.json entry for a package by
 * extracting only alphanumerics, hyphen, and period. Note that this won't
 * produce a valid URL for all possible NPM version strings, but should be fine
 * on those that are absolute version references.
 * Examples: '1', '1.0', '1.2.3', '1.2.3-alpha.0'
 */
export function absoluteVersion(version: string) {
  return version.replace(/[^\d.\-a-z]/g, '');
}

/*
 **************************************************************************************
 **************************************************************************************
 ***********************         PLUGINS          *************************************
 **************************************************************************************
 **************************************************************************************
 */
/** Limit server chunks to be only one. No need to split code in server */
export const LimitChunksPlugin = new webpack.optimize.LimitChunkCountPlugin({
  maxChunks: 1,
});

/** Define "process.env" in client app. Only provide things that can be public */
export const getDefinePlugin = (isServer: boolean) =>
  new webpack.DefinePlugin(getDefinePluginOptions(isServer));

/*
 **************************************************************************************
 **************************************************************************************
 ***********************  WEBPACK CONFIG OPTIONS  *************************************
 **************************************************************************************
 **************************************************************************************
 */
export const getModuleOptions = (mode: Mode): webpack.ModuleOptions => ({
  rules: [
    {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      loader: 'ts-loader',
      options: {
        configFile: getConfigFile(mode),
        // disable type checker - as it's done by ForkTsCheckerWebpackPlugin
        transpileOnly: true,
        compiler: 'typescript',
      },
    },
    {
      test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
      type: 'asset/resource',
    },
  ],
});

/** Define "process.env" in client app. Only provide things that can be public */
const getDefinePluginOptions = (isServer: boolean) => ({
  process: {
    env: isServer
      ? process.env
      : Object.keys(env).reduce(
          (result, key: string) => ({
            ...result,
            [key]: JSON.stringify((env as any)[key]),
          }),
          {},
        ),
    __isServer: isServer,
  },
});

export const resolveOptions = {
  /** Base directories that Webpack will look into resolve absolutely imported modules */
  modules: ['src', 'node_modules'],
  /** Extension that are allowed to be omitted from import statements */
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  /** "main" fields in package.json files to resolve a CommonJS module for */
  mainFields: ['browser', 'module', 'main'],
  // when in production, only use published package versions
  alias: {
    '@flyteorg/locale': path.resolve(__dirname, '../packages/locale/src'),
    '@flyteorg/flyte-api': path.resolve(__dirname, '../packages/flyte-api/src'),
    '@flyteorg/flyteidl-types': path.resolve(
      __dirname,
      '../packages/flyteidl-types/src',
    ),
    '@flyteorg/ui-atoms': path.resolve(__dirname, '../packages/ui-atoms/src'),
    '@flyteorg/components': path.resolve(
      __dirname,
      '../packages/components/src',
    ),
    '@flyteorg/common': path.resolve(__dirname, '../packages/common/src'),
    '@flyteorg/console': path.resolve(__dirname, '../packages/console/src'),
  },
};
