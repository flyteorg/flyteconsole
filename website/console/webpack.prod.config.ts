import webpack from 'webpack';
import { Options as HtmlWebpackOptions } from 'html-webpack-plugin';

const CompressionPlugin = require('compression-webpack-plugin');

const zlib = require('zlib');

export const htmlWebpackOptions: HtmlWebpackOptions = {
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
  newRelic: true,
};

/**
 * Webpack configuration for client code.
 */
export const clientConfig: webpack.Configuration = {
  plugins: [
    // provide two compression setting brotli for modern browsers, and gzip as fallback
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        },
      },
      threshold: 10240,
      minRatio: 0.8,
    }),
  ],
};

/**
 * Server configuration
 *
 * Server bundle is compiled as a CommonJS package that exports an Express middleware.
 */
export const serverConfig: webpack.Configuration = {};

export default [clientConfig, serverConfig];
