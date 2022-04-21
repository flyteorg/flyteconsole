import * as webpack from 'webpack';
import * as CompressionWebpackPlugin from 'compression-webpack-plugin';
import * as HTMLWebpackPlugin from 'html-webpack-plugin';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.config').default;

/**
 * Client configuration
 *
 * Client is compiled into multiple chunks that are result to dynamic imports.
 */
export const clientConfig: webpack.Configuration = merge(common.clientConfig, {
  mode: 'production',
  optimization: {
    emitOnErrors: true,
  },
  plugins: [
    new CompressionWebpackPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new HTMLWebpackPlugin({
      template: './src/assets/index.html',
      inject: 'body',
      minify: {
        minifyCSS: true,
        minifyJS: false,
        removeComments: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
      },
      hash: false,
      showErrors: false,
    }),
  ],
});

/**
 * Server configuration
 *
 * Server bundle is compiled as a CommonJS package that exports an Express middleware
 */
export const serverConfig: webpack.Configuration = merge(common.serverConfig, {
  mode: 'production',
});

export default [clientConfig, serverConfig];
