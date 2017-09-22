const path = require('path');
const webpack = require('webpack');

module.exports = {
  name: 'browser',
  entry: './client/app.js',
  output: {
    path: path.resolve(__dirname, 'public/javascripts/'),
    filename: 'app.bundle.js'
  },
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.ProvidePlugin({
      d3: "d3",
      $: "jquery",
      jQuery: "jquery",
      io: "socket.io-client"
    })
    // new HtmlWebpackPlugin({template: './src/index.html'})
  ]
};
