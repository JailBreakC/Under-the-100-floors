'use strict';
const webpack = require("webpack");
module.exports = {
  context: __dirname,
  entry: {
    app: "./app/js/index.js",
  }, output: {
    path: __dirname + "/dist",
    filename: "[name].bundle.js",
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
};