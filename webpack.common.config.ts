// tslint:disable:no-var-requires
// tslint:disable:no-console
import chalk from 'chalk';
import * as path from 'path';
import * as webpack from 'webpack';
import { processEnv as env } from './env';

const { StatsWriterPlugin } = require('webpack-stats-plugin');
const FavIconWebpackPlugin = require('favicons-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

/** Current service name */
export const serviceName = process.env.SERVICE_NAME || 'not set';

/** Absolute path to webpack output folder */
export const dist = path.join(__dirname, 'dist');

/** Webpack public path. All emitted assets will have relative path to this path
 * every time it is changed - the index.js app.use should also be updated.
 */
export const publicPath = `${env.BASE_URL}/assets/`;

// /** True if we are in development mode */
// export const isDev = env.NODE_ENV === 'development';

// /** True if we are in production mode */
// export const isProd = env.NODE_ENV === 'production';

/** CSS module class name pattern */
// export const localIdentName = isDev ? '[local]_[fullhash:base64:3]' : '[fullhash:base64:6]';

// Report current configuration
console.log(chalk.cyan('Exporting Webpack config with following configurations:'));
console.log(chalk.blue('Environment:'), chalk.green(env.NODE_ENV));
console.log(chalk.blue('Output directory:'), chalk.green(path.resolve(dist)));
console.log(chalk.blue('Public path:'), chalk.green(publicPath));

/** Adds sourcemap support */
export const sourceMapRule: webpack.RuleSetRule = {
  test: /\.js$/,
  enforce: 'pre',
  use: ['source-map-loader'],
};

/** Rule for images, icons and fonts */
export const imageAndFontsRule: webpack.RuleSetRule = {
  test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
  type: 'asset/resource',
};

export const favIconPlugin = new FavIconWebpackPlugin({
  logo: path.resolve(__dirname, 'src/assets/favicon.png'),
  // we can add '[fullhash:8]/' to the end of the file in future
  // if this one will be changed - ensure that OneClick will still be working
  prefix: './',
});

/** Write client stats to a JSON file for production */
export const statsWriterPlugin = new StatsWriterPlugin({
  filename: 'client-stats.json',
  fields: ['chunks', 'publicPath', 'assets', 'assetsByChunkName', 'assetsByChunkId'],
});

/** Define "process.env" in client app. Only provide things that can be public */
export const getDefinePlugin = (isServer: boolean) =>
  new webpack.DefinePlugin({
    'process.env': isServer
      ? 'process.env'
      : Object.keys(env).reduce(
          (result, key: string) => ({
            ...result,
            [key]: JSON.stringify((env as any)[key]),
          }),
          {},
        ),
    __isServer: isServer,
  });

/** Limit server chunks to be only one. No need to split code in server */
export const limitChunksPlugin = new webpack.optimize.LimitChunkCountPlugin({
  maxChunks: 1,
});

const typescriptRule = {
  test: /\.tsx?$/,
  exclude: /node_modules/,
  include: path.resolve(__dirname, 'src'),
  use: [{ loader: 'ts-loader', options: { transpileOnly: true } }],
};

/**
 * Client configuration
 *
 * Client is compiled into multiple chunks that are result to dynamic imports.
 */
export const clientConfig: webpack.Configuration = {
  name: 'client',
  target: 'web',
  resolve: {
    /** Base directories that Webpack will look to resolve absolutely imported modules */
    modules: ['src', 'node_modules'],
    /** Extension that are allowed to be omitted from import statements */
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    /** "main" fields in package.json files to resolve a CommonJS module for */
    mainFields: ['browser', 'module', 'main'],
  },
  entry: ['babel-polyfill', './src/client'],
  module: {
    rules: [sourceMapRule, typescriptRule, imageAndFontsRule],
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
  output: {
    publicPath,
    path: dist,
    filename: '[name]-[fullhash:8].js',
    chunkFilename: '[name]-[chunkhash].chunk.js',
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    favIconPlugin,
    statsWriterPlugin,
    getDefinePlugin(false),
  ],
};

/**
 * Server configuration
 *
 * Server bundle is compiled as a CommonJS package that exports an Express middleware
 */
export const serverConfig: webpack.Configuration = {
  resolve: {
    /** Base directories that Webpack will look to resolve absolutely imported modules */
    modules: ['src', 'node_modules'],
    /** Extension that are allowed to be omitted from import statements */
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    /** "main" fields in package.json files to resolve a CommonJS module for */
    mainFields: ['browser', 'module', 'main'],
  },
  name: 'server',
  target: 'node',
  entry: ['babel-polyfill', './src/server'],
  module: {
    rules: [sourceMapRule, typescriptRule, imageAndFontsRule],
  },
  externalsPresets: { node: true },
  externals: [nodeExternals({ allowlist: /lyft/ })],
  output: {
    path: dist,
    filename: 'server.js',
    libraryTarget: 'commonjs2',
    clean: true,
  },
  plugins: [limitChunksPlugin, new ForkTsCheckerWebpackPlugin(), getDefinePlugin(true)],
};

export default { clientConfig, serverConfig };
