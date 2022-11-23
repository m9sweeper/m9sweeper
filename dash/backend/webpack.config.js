const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  target: "node",
  devtool: 'source-map',
  entry: {
    main: './src/main.ts',
    cli: './src/cli.ts'
  },
  module: {
    rules:
      [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
      ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  node: {
    __dirname: false
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/gatekeeper-templates', to: './gatekeeper-templates' },
        { from: './src/modules/kube-bench/config_files', to: './kube-bench-templates' },
        { from: './src/gatekeeper-templates', to: './src/gatekeeper-templates' },
        { from: './src/email-templates', to: './dist/email-templates' },
        { from: './src/gatekeeper-templates', to: './dist/gatekeeper-templates' },
        { from: './package.json', to: './package.json' },
        { from: './package-lock.json', to: './package-lock.json' },
        { from: './info.json', to: './info.json' },
      ]
    })
  ],
  optimization: {
    minimize: false
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: '[name].js'
  }
};
