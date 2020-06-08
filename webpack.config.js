const path = require('path');
const dotenv = require('dotenv');

const { EnvironmentPlugin } = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

dotenv.config();

module.exports = (env, argv) => {
  return {
    mode: argv.mode,
    entry: './src/index.tsx',
    devServer: {
      contentBase: [
        path.resolve(__dirname, 'public'),
        path.resolve(__dirname, 'node_modules/emoji-data-ios'),
        path.resolve(__dirname, 'node_modules/opus-recorder/dist'),
      ],
      port: 1234,
      host: '0.0.0.0',
      disableHostCheck: true,
      stats: 'minimal',
    },
    output: {
      filename: '[name].[contenthash].js',
      chunkFilename: '[name].[chunkhash].js',
      path: path.resolve(__dirname, argv['output-path'] || 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js)$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
            'postcss-loader',
          ],
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg|png|jpg|tgs)(\?v=\d+\.\d+\.\d+)?$/,
          use: 'file-loader',
        },
        {
          test: /\.wasm$/,
          type: 'javascript/auto',
          use: 'file-loader',
        },
        {
          test: /\.tl$/i,
          use: 'raw-loader',
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.ts', '.tsx'],
    },
    plugins: [
      new HtmlPlugin({
        template: 'src/index.html',
      }),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[name].[chunkhash].css',
        ignoreOrder: true,
      }),
      new EnvironmentPlugin(['NODE_ENV', 'TELEGRAM_T_API_ID', 'TELEGRAM_T_API_HASH']),
      ...(argv.mode === 'production' ? [
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        }),
      ] : []),
    ],
    node: {
      fs: 'empty',
    },

    ...(argv.devtool === 'source-map' && {
      devtool: 'source-map',
    }),

    ...(argv['optimize-minimize'] && {
      optimization: {
        minimizer: [
          new TerserJSPlugin({ sourceMap: true }),
          new OptimizeCSSAssetsPlugin({}),
        ],
      },
    }),
  };
};
