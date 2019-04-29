// tslint:disable:no-var-requires
const path = require('path');
const webpack = require('webpack');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// import * as CompressionPlugin from 'compression-webpack-plugin';
// import WriteFilePlugin from 'write-file-webpack-plugin';
// import ChromeExtensionReloader from 'webpack-chrome-extension-reloader';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';

module.exports = {
  entry: {
    popup: path.resolve('src', 'popup.ts'),
    options: path.resolve('src', 'options.ts'),
    background: path.resolve('src', 'background.ts'),
    content: path.resolve('src', 'content.ts'),
  },
  output: {
    filename: '[name].bundle.js',
    path: __dirname + '/build',
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },

  plugins: [
    new CleanWebpackPlugin(),
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
    new CopyWebpackPlugin([
      {
        from: 'src/manifest.json',
        // transform: (content) =>
        //   Buffer.from(
        //     JSON.stringify({
        //       description: process.env.npm_package_description,
        //       version: process.env.npm_package_version,
        //       ...JSON.parse(content.toString()),
        //     }),
        //   ),
      },
    ]),
    new ExtractTextPlugin({
      filename: '[name].bundle.css',
      allChunks: true,
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new webpack.HotModuleReplacementPlugin(),
    new ChromeExtensionReloader(),
  ],

  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader!sass-loader',
        }),
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

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  // externals: {
  //   react: 'React',
  //   'react-dom': 'ReactDOM',
  // },
};

// export default (env: string) => {
//   const isEnvDevelopment = env === 'development';

//   return {
//     entry: {
//       popup: path.resolve('src', 'popup.ts'),
//       options: path.resolve('src', 'options.ts'),
//       background: path.resolve('src', 'background.ts'),
//       content: path.resolve('src', 'content.ts'),
//     },
//     output: {
//       path: path.join(__dirname, 'build'),
//       filename: '[name].bundle.js',
//     },
//     resolve: {
//       extensions: ['.ts', '.tsx', '.js', '.jsx'],
//       alias: {
//         components: path.resolve(__dirname, 'src/components'),
//         common: path.resolve(__dirname, 'src/common'),
//       },
//     },
//     plugins: [
//       // new CleanWebpackPlugin(),
//       new webpack.DefinePlugin({
//         JEST: false,
//       }),
//       new webpack.ProvidePlugin({
//         React: 'react',
//         Utils: 'common/utils',
//       }),
//       new ExtractTextPlugin({
//         filename: '[name].bundle.css',
//         allChunks: true,
//         disable: env === 'development',
//       }),
//       new webpack.HotModuleReplacementPlugin(),
//       new HtmlWebpackPlugin({
//         template: path.resolve('src', 'popup.html'),
//         filename: 'popup.html',
//         chunks: ['popup'],
//       }),
//       new HtmlWebpackPlugin({
//         template: path.resolve('src', 'options.html'),
//         filename: 'options.html',
//         chunks: ['options'],
//       }),
//       new HtmlWebpackPlugin({
//         template: path.resolve('src', 'background.html'),
//         filename: 'background.html',
//         chunks: ['background'],
//       }),
//       new MiniCssExtractPlugin({
//         filename: isEnvDevelopment ? '[name].css' : '[name].[hash].css',
//         chunkFilename: isEnvDevelopment ? '[id].css' : '[id].[hash].css',
//       }),
//       // new WriteFilePlugin(),
//       new CopyWebpackPlugin([
//         {
//           from: 'src/manifest.json',
//           // transform: (content) =>
//           //   Buffer.from(
//           //     JSON.stringify({
//           //       description: process.env.npm_package_description,
//           //       version: process.env.npm_package_version,
//           //       ...JSON.parse(content.toString()),
//           //     }),
//           //   ),
//         },
//       ]),
//       ...(env === 'production'
//         ? [
//             new CompressionPlugin({
//               // asset: '[path].gz[query]',
//               algorithm: 'gzip',
//               threshold: 10240,
//               minRatio: 0.8,
//             }),
//           ]
//         : [
//             // it causes an error in Firefox browser in dev mode (webpack-chrome-extension-reloader.js:5184
//             // browserVersion.split is not a function)
//             // @ts-ignore
//             new ChromeExtensionReloader(),
//           ]),
//     ],
//     module: {
//       rules: [
//         { test: /\.(t|j)sx?$/, use: { loader: 'awesome-typescript-loader' } },
//         { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
//         {
//           test: /\.css$/,
//           include: /(node_modules|global)/,
//           use: ExtractTextPlugin.extract({
//             fallback: 'style-loader',
//             use: ['css-loader'],
//           }),
//         },
//         {
//           test: /\.css$/,
//           exclude: /(node_modules|global)/,
//           use: ExtractTextPlugin.extract({
//             fallback: 'style-loader',
//             use: [
//               {
//                 loader: 'css-loader',
//                 options: {
//                   modules: true,
//                   alias: {
//                     common: path.resolve(__dirname, 'src/common'),
//                   },
//                   importLoaders: 1,
//                   localIdentName: '[name]__[local]___[hash:base64:5]',
//                 },
//               },
//               'postcss-loader',
//             ],
//           }),
//         },
//         {
//           test: /\.module\.s(a|c)ss$/,
//           loader: [
//             isEnvDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
//             {
//               loader: 'css-loader',
//               options: {
//                 modules: true,
//                 localIdentName: '[name]__[local]___[hash:base64:5]',
//                 camelCase: true,
//                 sourceMap: isEnvDevelopment,
//               },
//             },
//             {
//               loader: 'sass-loader',
//               options: {
//                 sourceMap: isEnvDevelopment,
//               },
//             },
//           ],
//         },
//         {
//           test: /\.s(a|c)ss$/,
//           exclude: /\.module.(s(a|c)ss)$/,
//           loader: [
//             isEnvDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
//             'css-loader',
//             {
//               loader: 'sass-loader',
//               options: {
//                 sourceMap: isEnvDevelopment,
//               },
//             },
//           ],
//         },
//         {
//           test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
//           use: [
//             {
//               loader: 'file-loader',
//               options: {
//                 name: '[name].[ext]',
//                 outputPath: 'fonts/',
//               },
//             },
//           ],
//         },
//         {
//           test: /\/*-inline.svg/,
//           loader: 'svg-inline-loader',
//         },
//       ],
//     },
//     devtool: env === 'development' ? 'eval-source-map' : false,
//     devServer: {
//       contentBase: './build',
//       hot: true,
//       historyApiFallback: true,
//       disableHostCheck: true,
//       https: false,
//       host: '0.0.0.0',
//       port: 3000,
//     },
//   };
// };
