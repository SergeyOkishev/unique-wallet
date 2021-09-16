// [object Object]
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line header/header
const _ = require('lodash');
const webpack = require('webpack');
const path = require('path');
const production = process.env.NODE_ENV === 'production';
const TerserPlugin = require('terser-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

let entry = {
  index: './src/index.ts'
};

if (production) {
  entry = _.assign({}, entry, { 'index.min': './src/index.ts' });
}

module.exports = {
  entry,
  mode: 'production',
  output: {
    path: path.resolve(__dirname, '_bundles'),
    filename: '[name].js',
    libraryTarget: 'commonjs',
    library: 'OpenSea'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    fallback: {
      http: false,
      https: false,
      os: false,
      sream: false
    }
  },

  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [
     new TerserPlugin({
       terserOptions: {
         compress: true,
         sourceMap: true,
       },
     }),
   ],
  },
  plugins: [
    new NodePolyfillPlugin()
  ],
  // plugins: [
  //   new webpack.optimize.UglifyJsPlugin({
  //     minimize: true,
  //     sourceMap: true,
  //     include: /\.min\.js$/
  //   })
  // ],
  module: {
    rules: [
        /*{
          test: /\.json$/,
          loader: 'json-loader',
          exclude: '/node_modules/',
        },*/
        {
          test: /\.ts$/,
          /*exclude: [
            path.resolve(__dirname, "/node_modules/")
          ],*/
          use: [
            {
              loader: 'ts-loader',
              options: {
                colors: true
              }
            }
          ],
        }
    ]
  }
};
