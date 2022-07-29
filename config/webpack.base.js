const path = require('path');
const pkg = require("../package.json");

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const config = require("./config");
const { DefinePlugin } = require('webpack');

module.exports = {
    entry: {
        app: path.resolve(config.appPath, "index.tsx"),
    },
    output: {
        filename: 'static/js/[name]-[fullhash:8].js',
        path: config.buildPath,
        publicPath: config.assetBasePath,
    },
    target: "web",
    module: {
        rules: [
            {
                oneOf: [
                    {
                        test: /\.(j|t)sx?$/,
                        include: config.appPath,
                        exclude: config.node_modules_path,
                        use: ["babel-loader"],
                    },
                    {
                        test: /\.(less|css)$/,
                        use: ["style-loader", "css-loader", "less-loader"]
                    },
                    {
                        test: /\.(svg|jpg|jpeg|bmp|png|webp|gif|ico|ttf)$/,
                        type: 'asset',
                        generator: {
                            filename: 'static/images/[name]-[fullhash:8][ext]',
                        }
                    },
                    {
                        type: 'asset/resource',
                        exclude: [/(^|\.(svg|png|jpg|js|jsx|ts|tsx|html|json))$/],
                        generator: {
                            filename: 'static/others/[name]-[fullhash:8][ext]',
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.json', '.jsx', '.ts', '.tsx'],
        plugins: [
            new TsconfigPathsPlugin({
                extensions: [".ts", ".tsx", ".js"]
            })
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public', globOptions: { ignore: ['index.html'] } },
            ]
        }),
        new CleanWebpackPlugin(),
        new DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.APP_ENV': JSON.stringify(process.env.APP_ENV),
            APP_VERSION: JSON.stringify(`Version${pkg.version} - ${new Date().toUTCString()}`),
        }),
    ]
}