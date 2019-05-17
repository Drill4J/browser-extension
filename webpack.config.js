const webpack = require('webpack');
const path = require('path');
const fileSystem = require('fs');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const env = require('./build-utils/env');

// load the secrets
const alias = {};

const secretsPath = path.join(__dirname, `secrets.${env.NODE_ENV}.js`);

const fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

if (fileSystem.existsSync(secretsPath)) {
  alias.secrets = secretsPath;
}

const options = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    popup: path.join(__dirname, 'src', 'popup.ts'),
    options: path.join(__dirname, 'src', 'options.ts'),
    background: path.join(__dirname, 'src', 'background.ts'),
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
        exclude: /node_modules/,
      },
      {
        test: new RegExp(`.(${fileExtensions.join('|')})$`),
        loader: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
      {
        test: /\/*-inline.svg/,
        loader: 'svg-inline-loader',
      },
      {
        test: /\.module\.s(a|c)ss$/,
        loader: [
          env.NODE_ENV === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]__[local]___[hash:base64:5]',
              camelCase: true,
              sourceMap: env.NODE_ENV === 'development',
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: env.NODE_ENV === 'development',
            },
          },
        ],
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        loader: [
          env.NODE_ENV === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: env.NODE_ENV === 'development',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias,
    extensions: fileExtensions
      .map((extension) => `.${extension}`)
      .concat(['.jsx', '.js', '.tsx', '.ts', '.css']),
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin(['build']),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development', // use 'development' unless process.env.NODE_ENV is defined
      DEBUG: false,
    }),
    new CopyWebpackPlugin([
      {
        from: 'src/manifest.json',
        transform(content) {
          // generates the manifest file using the package.json informations
          return Buffer.from(
            JSON.stringify({
              description: process.env.npm_package_description,
              version: process.env.npm_package_version,
              ...JSON.parse(content.toString()),
            }),
          );
        },
      },
    ]),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'popup.html'),
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'options.html'),
      filename: 'options.html',
      chunks: ['options'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'background.html'),
      filename: 'background.html',
      chunks: ['background'],
    }),
    new WriteFilePlugin(),
    new ChromeExtensionReloader(),
  ],
};

if (env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-eval-source-map';
}

module.exports = options;
