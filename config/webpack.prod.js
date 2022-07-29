const baseConfig = require('./webpack.base');
const path = require('path');

const config = require("./config");

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    ...baseConfig,
    mode: "production",
    output: {
        ...baseConfig.output,
        filename: 'static/js/[name]-[contenthash:8].js'
    },
    module: {
        ...baseConfig.module,
        rules: [
            {
                oneOf: [
                    {
                        test: /\.(j|t)sx?$/,
                        include: config.appPath,
                        exclude: config.node_modules_path,
                        use: "babel-loader",
                    },
                    {
                        test: /\.(less|css)$/,
                        use: [
                            {
                                loader: MiniCssExtractPlugin.loader,
                                options: {
                                    publicPath: '../../',
                                },
                            }
                            , "css-loader", "sass-loader"]
                    },
                    {
                        test: /\.(svg|jpg|jpeg|bmp|png|webp|gif|ico|ttf)$/,
                        type: 'asset',
                        parser: {
                            dataUrlCondition: {
                                maxSize: 8 * 1024,
                            },
                        },
                        generator: {
                            filename: 'static/images/[name]-[contenthash:8][ext]',
                        }
                    },
                    {
                        type: 'asset/resource',
                        exclude: [/(^|\.(svg|png|jpg|js|jsx|ts|tsx|html|json))$/],
                        generator: {
                            filename: 'static/others/[name]-[contenthash:8][ext]',
                        }
                    }
                ]
            }

        ]
    },
    plugins: [
        ...baseConfig.plugins,
        new HtmlWebpackPlugin({
            template: config.indexHtmlPath,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeOptionalTags: false,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                removeAttributeQuotes: true,
                removeCommentsFromCDATA: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            }
        }),
        new CompressionWebpackPlugin({
            filename: "[path][base].gz",
            algorithm: "gzip",
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0.8,
        }),
        new MiniCssExtractPlugin({
            filename: 'static/css/[name]-[contenthash:8].css',
        }),
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
            minChunks: 1,
            maxInitialRequests: 5,
            cacheGroups: {
                vendor: {
                    priority: 20,
                    minSize: 400 * 1000,
                    test: /[\\/]node_modules[\\/]/,
                    name(module, chunks, cacheGroupKey) {
                        // get the name. E.g. node_modules/packageName/not/this/part.js
                        // or node_modules/packageName
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                        // npm package names are URL-safe, but some servers don't like @ symbols
                        return `npm.${packageName.replace('@', '')}`;
                    },
                },
                // 提取公共模块
                commons: {
                    chunks: 'all',
                    test: /[\\/]node_modules[\\/]/,
                    minChunks: 2,
                    maxInitialRequests: 5,
                    minSize: 0,
                    name: 'common'
                }
            },
        },
        minimize: true,
        minimizer: [new TerserPlugin()]
    }
}

