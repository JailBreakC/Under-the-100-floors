const webpack = require("webpack");

var webpackBase = {
  context: __dirname,
  entry: {
    app: [
      'webpack-dev-server/client?http://localhost:8081',
      './app/js/index.js'
    ]
  }, output: {
    path: __dirname + "/dist",
    filename: "[name].js",
    publicPath: "/dist/"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [{
          loader: 'babel-loader',
          options: { presets: ['es2015', 'stage-0'] },
        }],
      },
      {
        test: /\.less$/,
        use:[{
          loader: 'style-loader'
        }, {
          loader: 'css-loader'
        }, {
          loader: 'less-loader',
        }]
      }
      // Loaders for other file types can go here
    ],
  },
  devtool: "cheap-module-eval-source-map"
};

module.exports = webpackBase