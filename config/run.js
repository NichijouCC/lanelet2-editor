const ora = require('ora');
const webpack = require('webpack');
const WebpackDevServer = require("webpack-dev-server");
const helper = require("./helper");
const pkg = require("../package.json");
const config = require("./config");


const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();


const beProduction = process.env.NODE_ENV == "production";
let webpackConfig = beProduction ? require('./webpack.prod') : require('./webpack.dev');
let beRunExampleFile = helper.runExampleFile();
const beNeedAnalyze = helper.beNeedAnalyze();
const haveCesium = pkg.dependencies["cesium"] != null || pkg.devDependencies['cesium'] != null;

(async () => {
    if (haveCesium) {
        webpackConfig = helper.formate_webpack_config_with_cesium(webpackConfig, beProduction);
    }
    if (beRunExampleFile) {
        let examplePath = await helper.findExampleFile();
        if (examplePath != null) {
            console.warn(`@@------------执行样例：${examplePath.substring(examplePath.lastIndexOf("\\"))}-----------------------`);
            webpackConfig.entry.app = examplePath + "/index.tsx";
        }
    }
    if (beNeedAnalyze) {
        webpackConfig = helper.formate_webpack_config_with_analyzer(webpackConfig);
    }

    if (config.showCostedBuildTime) {
        webpackConfig = smp.wrap(webpackConfig);
    }

    if (!beProduction) {
        const compiler = webpack(webpackConfig);
        const devServerOptions = webpackConfig.devServer;
        const server = new WebpackDevServer(compiler, devServerOptions);
        server.listen(devServerOptions.port, () => {
            console.info(`Starting server on http://${devServerOptions.host}:${devServerOptions.port}`);
        });
    } else {
        const spinner = ora('webpack编译开始...\n').start();
        webpack(webpackConfig, function (err, stats) {
            if (err) {
                spinner.fail('编译失败!\n');
                console.error(err);
                return;
            } else {
                spinner.succeed('编译结束!\n');
                let statsLogs = stats.toString(
                    {
                        ...webpackConfig.stats,
                        colors: true
                    });
                process.stdout.write(statsLogs + '\n\n');
            }
        });
    }
})()