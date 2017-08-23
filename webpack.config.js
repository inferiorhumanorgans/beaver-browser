const path = require('path');
const webpack = require('webpack');

var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context:          path.resolve(__dirname, 'src'),
  entry: {
    app:            './app.js',
    inject:         './inject.js'
  },
  output: {
    path:           path.resolve(__dirname, 'dist'),
    filename:       '[name].bundle.js',
    publicPath:     '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks:       ['app'],
      template:     'index.html'
    }),
    new CopyWebpackPlugin([
      {
        from:       path.resolve(__dirname, 'static/*'),
        flatten:    true
      }
    ])
  ],
  module: {
    rules: [
      {
        test:       /\.js$/,
        exclude:    [/node_modules/],
        use: [{
          loader:   'babel-loader',
          options:  { presets: ['es2015'] },
        }]
      },
      {
        test:       /\.(html)$/,
        use: {
          loader:   'html-loader',
          options: {
            attrs:  [':data-src']
          }
        }
      }
    ]
  }
};
