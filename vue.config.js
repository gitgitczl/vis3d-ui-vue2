const CopyWebpackPlugin = require("copy-webpack-plugin"); //将单个文件或整个目录复制到构建目录
const webpack = require("webpack");
const path = require("path");

let cesiumSource = "./node_modules/cesium/Source";
let cesiumWorkers = "../Build/Cesium/Workers";
const port = process.env.port || process.env.npm_config_port || 80 // 端口
module.exports = {
    // 基本路径
    parallel: false,
    publicPath: "./", // 打包后资源的访问路径
    // 输出文件目录
    outputDir: "dist",
    lintOnSave: false, // 关闭eslint语法检测
    // webpack-dev-server 相关配置
    devServer: {
        host: 'localhost',
        port: port,
        open: true,
        /* proxy: {
             // localhost:80/data --> http://47.117.134.108:9009/prod-api/prod-api/code
            [process.env.VUE_APP_BASE_API]: {
                target: `http://47.117.134.108:9009/`,
                changeOrigin: true,
                pathRewrite: {
                    ['^' + process.env.VUE_APP_BASE_API]: '/',
                }
            }
        }, */
        disableHostCheck: true
    },
    configureWebpack: {
        output: {
            sourcePrefix: " ",
        },
        amd: {
            toUrlUndefined: true,
        },
        resolve: {
            alias: {
                vue$: "vue/dist/vue.esm.js",
                "@": path.resolve("src"),
                cesium: path.resolve(__dirname, cesiumSource),
            },
        },
        plugins: [
                new CopyWebpackPlugin([
                    { from: path.join(cesiumSource, cesiumWorkers), to: "Workers" },
                ]),
                new CopyWebpackPlugin([
                    { from: path.join(cesiumSource, "Assets"), to: "Assets" },
                ]),
                new CopyWebpackPlugin([
                    { from: path.join(cesiumSource, "Widgets"), to: "Widgets" },
                ]),
                new CopyWebpackPlugin([
                    {
                        from: path.join(cesiumSource, "ThirdParty"),
                        to: "ThirdParty",
                    },
                ]),
                new webpack.DefinePlugin({
                    CESIUM_BASE_URL: JSON.stringify("/"),
                }),
        ],
        module: {
            unknownContextCritical: /^.\/.*$/,
            unknownContextCritical: false,
            rules: [
                {
                    test: /\.js$/,
                    use: {
                        loader: "@open-wc/webpack-import-meta-loader",
                    },
                },
            ],
        }
    }
};