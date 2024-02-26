// @ts-ignore
// @ts-nocheck
import chalk from 'chalk';
import path from 'path';
import webpack, { ResolveOptions } from 'webpack';

import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import HTMLWebpackPlugin, { Options as HtmlWebpackOptions } from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const CopyPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const { merge } = require('webpack-merge');
/**
 * EXPORTED CONSTANTS
 */
export const configFilePath = path.resolve(__dirname, './tsconfig.build.json');
export const BUILD_TARGET = path.resolve(__dirname, 'dist');
import * as envVars from './env';

/**
 * CONSTANTS
 */
const { ASSETS_PATH: publicPath, processEnv } = envVars;

const getDefinePluginOptions = (isServer: boolean) => ({
  process: {
    env: Object.keys(processEnv).reduce(
      (result, key: string) => ({
        ...result,
        [key]: JSON.stringify((processEnv as any)[key]),
      }),
      {},
    ),
    __isServer: isServer,
  },
});

/** Define "process.env" in client app. Only provide things that can be public */
const getDefinePlugin = (isServer: boolean) =>
  new webpack.DefinePlugin(getDefinePluginOptions(isServer));

const resolve: ResolveOptions = {
  /** Base directories that Webpack will look into resolve absolutely imported modules */
  modules: [
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, '../../packages/common/src'),
    path.resolve(__dirname, '../../packages/flyte-api/src'),
    path.resolve(__dirname, '../../packages/locale/src'),
    path.resolve(__dirname, '../../packages/oss-console/src'),
    path.resolve(__dirname, '../../packages/primitives/src'),
    path.resolve(__dirname, '../../packages/theme/src'),
    path.resolve(__dirname, '../../packages/ui-atoms/src'),
    'node_modules',
  ],
  /** Extension that are allowed to be omitted from import statements */
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  /** "main" fields in package.json files to resolve a CommonJS module for */
  mainFields: ['browser', 'module', 'main'],
  /** allow to resolve local packages to it's source code */
  alias: {
    '@clients/common': path.resolve(__dirname, '../../packages/common/src'),
    '@clients/flyte-api': path.resolve(__dirname, '../../packages/flyte-api/src'),
    '@clients/locale': path.resolve(__dirname, '../../packages/locale/src'),
    '@clients/oss-console': path.resolve(__dirname, '../../packages/oss-console/src'),
    '@clients/primitives': path.resolve(__dirname, '../../packages/primitives/src'),
    '@clients/theme': path.resolve(__dirname, '../../packages/theme/src'),
    '@clients/ui-atoms': path.resolve(__dirname, '../../packages/ui-atoms/src'),
  },
};

const moduleOptions: webpack.ModuleOptions = {
  rules: [
    {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      loader: 'ts-loader',
      options: {
        configFile: configFilePath,
        // disable type checker - as it's done by ForkTsCheckerWebpackPlugin
        transpileOnly: true,
        // needed for proper code splitting
        compilerOptions: { module: 'esnext' },
        // compiler: 'typescript',
      },
    },
    {
      test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
      type: 'asset/resource',
    },
    {
      test: /\.js$/,
      enforce: 'pre',
      use: ['source-map-loader'],
      exclude: [/node_modules/],
      // ignoreWarnings: [/Failed to parse source map/],
    },
    {
      test: /\.css$/i,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'postcss-loader',
        },
      ],
    },
  ],
};

// Report current configuration
console.log(chalk.magenta('Exporting Webpack config with following configurations:'));
console.log(chalk.magenta('Environment:'), chalk.green(processEnv.NODE_ENV));
console.log(chalk.magenta('Output directory:'), chalk.green(BUILD_TARGET));
console.log(chalk.magenta('Public path:'), chalk.green(publicPath));
console.log(chalk.magenta('TSconfig file used for build:'), chalk.green(configFilePath));

const webpackConfigSettings = {
  production: 'webpack.prod.config.ts',
  development: 'webpack.dev.config.ts',
};

const htmlWebpackOptionsDefault: HtmlWebpackOptions = {
  template: './src/assets/index.html',
  inject: 'body',
  publicPath,
};

module.exports = (_env: any, argv: { mode: 'production' | 'development' }) => {
  const { mode } = argv;
  const webpackConfig = require(`./${webpackConfigSettings[mode]}`);
  const htmlWebpackOptions: HtmlWebpackOptions = {
    ...htmlWebpackOptionsDefault,
    ...webpackConfig.htmlWebpackOptions,
  };

  const mergeConfig: webpack.Configuration = {
    name: 'client',
    mode,
    target: ['web', 'es5'],
    entry: {
      main: {
        import: './src/client/index.tsx',
      },
    },
    output: {
      path: BUILD_TARGET,
      publicPath,
      filename: '[name]-[fullhash:8].js',
      chunkFilename: '[name]-[chunkhash].chunk.js',
    },
    resolve: resolve,
    module: moduleOptions,

    optimization: {
      concatenateModules: true,
      usedExports: true,
      runtimeChunk: 'single', // https://bundlers.tooling.report/code-splitting/multi-entry/

      splitChunks: {
        // include all types of chunks
        chunks: 'all',

        automaticNameDelimiter: '_',

        cacheGroups: {
          reactPackage: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|history)[\\/]/,
            name: 'vendor_react',
            chunks: 'all',
            priority: 10,
          },
          patternflyPackage: {
            test: /[\\/]node_modules[\\/](@patternfly)[\\/]/,
            name: 'vendor_patternfly',
            chunks: 'all',
            priority: 10,
          },
          muiPackage: {
            test: /[\\/]node_modules[\\/](@mui|@emotion|@rjsf)[\\/]/,
            name: 'vendor_mui_emotion_rjsf',
            chunks: 'all',
            priority: 10,
          },
          momentPackage: {
            test: /[\\/]node_modules[\\/](moment|moment-timezone)[\\/]/,
            name: 'vendor_moment',
            chunks: 'all',
            priority: 10,
          },
          graphPackage: {
            test: /[\\/]node_modules[\\/](react-flow-renderer|graphlib)[\\/]/,
            name: 'vendor_react_flow_renderer_graphlib',
            chunks: 'all',
            priority: 10,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          // Opt out of defaultVendors, so rest of the node modules will be part of default cacheGroup
          defaultVendors: false,
        },
      },
    },

    plugins: [
      new ForkTsCheckerWebpackPlugin({
        async: false,
        typescript: {
          build: true,
          configFile: configFilePath,
          mode: 'readonly',
          configOverwrite: {
            compilerOptions: {
              // needed for proper code splitting
              module: 'esnext',
            },
          },
        },
      }),
      new CopyPlugin({
        patterns: [{ from: './src/assets/public', to: '' }],
      }),
      new NodePolyfillPlugin({
        includeAliases: ['http', 'https', 'stream', 'zlib', 'Buffer'],
      }),
      getDefinePlugin(false),
      new HTMLWebpackPlugin(htmlWebpackOptions),
    ],

    stats: {
      modulesSpace: 100,

      // Display bailout reasons
      optimizationBailout: true,

      errors: true,
      children: true,
      errorDetails: true,

      // Assets
      assets: true,
      assetsSpace: 100,
      groupAssetsByExtension: true,
      groupAssetsByChunk: true,
      groupAssetsByPath: false,
      groupAssetsByEmitStatus: false,
      groupAssetsByInfo: false,
      excludeAssets: [/\.woff$/, /\.woff2$/],

      // Modules
      moduleAssets: true,
      nestedModules: false,
      nestedModulesSpace: 1,
      // modulesSpace: 999,
      // moduleAssets: false,
      // nestedModules: false,
      groupModulesByPath: true,
    },
  };
  /**
   * Webpack configuration for client code.
   */
  const clientConfig: webpack.Configuration = merge(mergeConfig, webpackConfig.clientConfig);

  /**
   * Server configuration
   *
   * Server bundle is compiled as a CommonJS package that exports an Express middleware.
   */
  const serverConfig: webpack.Configuration = merge(
    {
      mode,
      name: 'server',
      target: 'node',
      entry: {
        server: ['./src/server/index.ts'],
      },
      output: {
        path: BUILD_TARGET,
        filename: '[name].js',
        clean: true,
      },
      externals: [nodeExternals()],
      externalsPresets: { node: true },
      resolve,
      module: moduleOptions,

      plugins: [],

      stats: {
        errors: true,
        children: true,
        errorDetails: true,
      },
    },
    webpackConfig.serverConfig,
  );

  return [clientConfig, serverConfig];
};
