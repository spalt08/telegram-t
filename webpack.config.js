const path = require('path');
const dotenv = require('dotenv');

const { EnvironmentPlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

dotenv.config();

module.exports = (env, argv) => {
  return {
    mode: argv.mode,
    entry: './src/index.tsx',
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
      new HtmlWebpackPlugin({
        template: 'src/index.html',
      }),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[name].[chunkhash].css',
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
