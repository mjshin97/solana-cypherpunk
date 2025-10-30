const webpack = require("webpack");
const path = require("path");

module.exports = {
  // 🚨 이전에 추가했던 'style:' 블록을 제거하고,
  // 'postcss:'를 'webpack:'과 나란히 최상위 레벨로 수정했습니다.
  postcss: {
    plugins: [
      require('tailwindcss'),
      require('autoprefixer'),
    ],
  },

  // 👇 회원님의 기존 'webpack' 설정은 그대로 유지합니다.
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

      return webpackConfig;
    },
  },
};
