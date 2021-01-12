const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const ExtensionReloader = require('webpack-extension-reloader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

const options = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    content: path.join(__dirname, 'src', 'content.ts'),
    popup: path.join(__dirname, 'src', 'popup.ts'),
    options: path.join(__dirname, 'src', 'options.ts'),
    background: path.join(__dirname, 'src', 'background/index.ts'),
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
      {
        test: new RegExp(`.(${fileExtensions.join('|')})$`),
        loader: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/,
      },
      {
        test: /\.module\.s(a|c)ss$/,
        loader: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: process.env.NODE_ENV === 'development',
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: process.env.NODE_ENV === 'development',
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        loader: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: process.env.NODE_ENV === 'development',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: fileExtensions
      .map((extension) => `.${extension}`)
      .concat(['.jsx', '.js', '.tsx', '.ts', '.css']),
  },
  plugins: [
    // new ExtensionReloader({
    //   entries: {
    //     contentScript: 'content',
    //     background: 'background',
    //     optionsScript: 'options',
    //     extensionPage: ['popup', 'options'],
    //   },
    // }),
    new MiniCssExtractPlugin(),
    new CopyWebpackPlugin([
      { from: path.join(__dirname, 'src', 'manifest.json') },
      { from: path.join(__dirname, 'src', 'background.html') },
      { from: path.join(__dirname, 'src', 'popup.html') },
      { from: path.join(__dirname, 'src', 'options.html') },
      { from: path.join(__dirname, 'src', 'uikit.css') },
    ]),
  ],
};

if (process.env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-eval-source-map';
}

module.exports = options;
