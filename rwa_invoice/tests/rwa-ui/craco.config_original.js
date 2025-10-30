const webpack = require("webpack");
const path = require("path");

module.exports = {
  webpack: {
    alias: {},
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        assert: require.resolve("assert/"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        os: require.resolve("os-browserify/browser"),
        url: require.resolve("url/"),
        buffer: require.resolve("buffer/"),
        process: require.resolve("process/browser.js"),
      };

      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser.js",
          Buffer: ["buffer", "Buffer"],
        })
      );

      // react-refresh runtime 문제 우회
      webpackConfig.resolve.modules = [
        path.resolve(__dirname, "src"),
        "node_modules",
      ];

      return webpackConfig;
    },
  },
};
