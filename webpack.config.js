const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const { DefinePlugin } = require("webpack");
const dotenv = require("dotenv");

module.exports = {
  entry: "./src/index.ts",
  devtool: "inline-source-map",
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  mode: "production",
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      fs: false,
    },
  },
  plugins: [
    new NodePolyfillPlugin(),
    new DefinePlugin({
      "process.env": `(${JSON.stringify(dotenv.config().parsed)})`,
    }),
  ],
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};
