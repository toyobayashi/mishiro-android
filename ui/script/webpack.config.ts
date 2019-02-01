import { Configuration, HotModuleReplacementPlugin, DefinePlugin } from 'webpack'
import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin'
import * as OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import * as UglifyJSPlugin from 'uglifyjs-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
import { mode, getPath, config } from './constant'

const webpackConfig: Configuration = {
  mode,
  context: getPath(),
  entry: {
    main: [getPath('./src/index.ts')]
  },
  output: {
    filename: '[name].js',
    path: getPath(config.outputPath)
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
              transpileOnly: mode !== 'production'
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          mode === 'production' ? MiniCssExtractPlugin.loader : 'vue-style-loader',
          'css-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.css']
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      title: 'mishiro-android',
      template: getPath('./src/index.html'),
      chunks: ['main', 'dll', 'common']
    }),
    new DefinePlugin({
      LAST_UPDATE_TIME: JSON.stringify(new Date().toISOString())
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'common',
      cacheGroups: {
        dll: {
          test: /[\\/]node_modules[\\/]/,
          name: 'dll'
        }
      }
    }
  }
}

if (mode === 'production') {
  // webpackConfig.devtool = 'inline-source-map'
  const uglifyJS = () => new UglifyJSPlugin({
    parallel: true,
    cache: true,
    // sourceMap: true,
    uglifyOptions: {
      output: {
        comments: false
      }
    }
  })
  webpackConfig.plugins = [
    ...(webpackConfig.plugins || []),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ]
  webpackConfig.optimization = {
    ...(webpackConfig.optimization || {}),
    minimizer: [
      uglifyJS(),
      new OptimizeCSSAssetsPlugin({})
    ]
  }
} else {
  webpackConfig.devtool = 'eval-source-map'
  webpackConfig.plugins = [
    ...(webpackConfig.plugins || []),
    new HotModuleReplacementPlugin(),
    new ForkTsCheckerWebpackPlugin()
  ]

  if (config.publicPath) {
    webpackConfig.output && (webpackConfig.output.publicPath = config.publicPath)
  }
}

export default webpackConfig
