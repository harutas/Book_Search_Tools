const HtmlWebpackPlugin = require("html-webpack-plugin");

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
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      // 対象のテンプレートを設定
      template: `${__dirname}/index.html`,
      // 書き出し先
      filename: `${__dirname}/docs/index.html`,
      // ビルドしたjsファイルを読み込む場所。デフォルトはhead
      inject: "body",
    }),
  ],
};
