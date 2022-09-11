module.exports = {
  entry: {
    bandle: "./src/index.ts",
  },
  output: {
    path: `${__dirname}/docs`,
    filename: "[name].js",
  },
  mode: "development",
  resolve: {
    extensions: [".ts", ".js"],
  },
  devServer: {
    static: {
      directory: `${__dirname}/docs`,
    },
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
      },
    ],
  },
};
