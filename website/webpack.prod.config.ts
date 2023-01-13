import * as webpack from 'webpack';
import CompressionWebpackPlugin from 'compression-webpack-plugin';
import { Options as HtmlWebpackOptions } from 'html-webpack-plugin';
import { ClientConfig, LimitChunksPlugin } from './webpack.utilities';


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
}


/**
 * Client configuration
 *
 * Client is compiled into multiple chunks that are result to dynamic imports.
 */
export const clientConfig: ClientConfig = {
  output: {
    filename: '[name].[contenthash].js',
  },
  plugins: [
    new CompressionWebpackPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
  ],
  optimization: {
    emitOnErrors: true,
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
}

/**
 * Server configuration
 *
 * Server bundle is compiled as a CommonJS package that exports an Express middleware
 */
export const serverConfig: webpack.Configuration = {
  plugins: [
    LimitChunksPlugin,
  ]
};

export default [clientConfig, serverConfig];
