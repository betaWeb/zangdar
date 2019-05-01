const path = require('path')
/*const nodeExternals = require('webpack-node-externals')
const webpack = require('webpack')*/
const buildPath = path.resolve(__dirname, "./dist")

module.exports = {
    mode: 'production',
    target: "web",
    entry: {
        app: ["./src/index.js"]
    },
    output: {
        path: buildPath,
        filename: "zangdar.min.js",
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-proposal-class-properties']
                    }
                }
            }
        ]
    }
}