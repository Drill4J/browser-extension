/* eslint-disable no-console */
import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import WriteFilePlugin from 'write-file-webpack-plugin';
import ChromeExtensionReloader from 'webpack-chrome-extension-reloader';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const defaultEnv = {
  dev: true,
  production: false,
};

export default (env = defaultEnv) => {
  const isEnvDevelopment = env === 'development';

  return {
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
      new CleanWebpackPlugin(),
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
      new MiniCssExtractPlugin({
        filename: isEnvDevelopment ? '[name].css' : '[name].[hash].css',
        chunkFilename: isEnvDevelopment ? '[id].css' : '[id].[hash].css',
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
            // it causes an error in Firefox browser in dev mode (webpack-chrome-extension-reloader.js:5184 browserVersion.split is not a function)
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
          test: /\.module\.s(a|c)ss$/,
          loader: [
            isEnvDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: true,
                localIdentName: '[name]__[local]___[hash:base64:5]',
                camelCase: true,
                sourceMap: isEnvDevelopment,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: isEnvDevelopment,
              },
            },
          ],
        },
        {
          test: /\.s(a|c)ss$/,
          exclude: /\.module.(s(a|c)ss)$/,
          loader: [
            isEnvDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                sourceMap: isEnvDevelopment,
              },
            },
          ],
        },
        {
          test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'fonts/',
              },
            },
          ],
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
  };
};
