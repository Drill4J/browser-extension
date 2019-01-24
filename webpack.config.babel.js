/* eslint-disable no-console */
import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import WebpackNotifierPlugin from 'webpack-notifier';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import WriteFilePlugin from 'write-file-webpack-plugin';
import ChromeExtensionReloader from 'webpack-chrome-extension-reloader';
import dotenv from 'dotenv';

dotenv.config();
if (!process.env.PROXY_PATH) {
  console.log('========== Specify the PROXY_PATH variable in the .env file =========');
}

const defaultEnv = {
  dev: true,
  production: false,
};

export default (env = defaultEnv) => ({
  entry: {
    popup: path.resolve('src', 'popup.js'),
    options: path.resolve('src', 'options.js'),
    background: path.resolve('src', 'background.js'),
    content: path.resolve('src', 'content.js'),
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      components: path.resolve(__dirname, 'src/components'),
      common: path.resolve(__dirname, 'src/common'),
    },
  },
  plugins: [
    new CleanWebpackPlugin([
      path.resolve(__dirname, 'build'),
      path.resolve(__dirname, 'localization/messages'),
    ]),
    new WebpackNotifierPlugin({ skipFirstNotification: true }),
    new webpack.DefinePlugin({
      JEST: false,
    }),
    new webpack.ProvidePlugin({
      React: 'react',
      Utils: 'common/utils',
    }),
    new ExtractTextPlugin({
      filename: '[name].bundle.css',
      allChunks: true,
      disable: env.dev,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve('src', 'popup.html'),
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve('src', 'options.html'),
      filename: 'options.html',
      chunks: ['options'],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve('src', 'background.html'),
      filename: 'background.html',
      chunks: ['background'],
    }),
    new WriteFilePlugin(),
    new CopyWebpackPlugin([
      {
        from: 'src/manifest.json',
        transform: (content) =>
          Buffer.from(
            JSON.stringify({
              description: process.env.npm_package_description,
              version: process.env.npm_package_version,
              ...JSON.parse(content.toString()),
            }),
          ),
      },
    ]),
    ...(env.production
      ? [
          new CompressionPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            threshold: 10240,
            minRatio: 0.8,
          }),
        ]
        : [
          //it causes an error in Firefox browser in dev mode (webpack-chrome-extension-reloader.js:5184 browserVersion.split is not a function)
          new ChromeExtensionReloader(),
        ]),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
        query: {
          presets: ['babel-preset-env', 'babel-preset-react'],
          plugins: [
            'react-hot-loader/babel',
            'transform-decorators-legacy',
            'transform-class-properties',
            'transform-object-rest-spread',
          ],
        },
      },
      {
        test: /\.css$/,
        include: /(node_modules|global)/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader'],
        }),
      },
      {
        test: /\.css$/,
        exclude: /(node_modules|global)/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                alias: {
                  common: path.resolve(__dirname, 'src/common'),
                },
                importLoaders: 1,
                localIdentName: '[name]__[local]___[hash:base64:5]',
              },
            },
            'postcss-loader',
          ],
        }),
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        loader: 'url-loader',
        exclude: /\/*-inline.svg/,
        query: {
          limit: 1000,
          name: 'media/[name].[ext]',
        },
      },
      {
        test: /\/*-inline.svg/,
        loader: 'svg-inline-loader',
      },
    ],
  },
  devtool: env.dev ? 'eval-source-map' : false,
  devServer: {
    contentBase: './build',
    hot: true,
    historyApiFallback: true,
    disableHostCheck: true,
    https: false,
    host: '0.0.0.0',
    port: 3000,
  },
});
