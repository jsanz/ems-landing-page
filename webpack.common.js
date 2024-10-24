/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const ASSET_PATH = process.env.ASSET_PATH || '';

module.exports = {
  entry: {
    mapbox: './node_modules/mapbox-gl/dist/mapbox-gl.js',
    main: ['@babel/polyfill', path.resolve(__dirname, 'public/main.js')]
  },
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'build/release'),
    filename: '[name].bundle.js',
    publicPath: ASSET_PATH,
  },
  module: {
    noParse: /iconv-loader\.js/,
    rules: [
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: ['file-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'resolve-url-loader', 'postcss-loader', 'sass-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.hbs$/,
        use: {
          loader: 'handlebars-loader'
        }
      }
    ]
  },
  externals: {
    'config': JSON.stringify(require(path.resolve(__dirname, 'public', 'config.json')))
  },
  resolve: {
    alias: {

    }
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        exclude: /node_modules\/(?!mapbox-gl\/dist)/
      })
    ],
    occurrenceOrder: true,
    splitChunks: {
      chunks: 'all'
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: './public/config.json', to: '.' }
      ]
    }),
    new HTMLWebpackPlugin({
      template: 'public/index.hbs',
      hash: true,
    }),
    new OptimizeCssAssetsPlugin()
  ],
  stats: {
    colors: true
  },
  devtool: 'source-map',
  devServer: {
    contentBase: './build/release',
    compress: true
  }
};
