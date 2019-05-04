const path = require('path')
const buildPath = path.resolve(__dirname, "./dist")
const isDev = process.env.ENV === 'development'

module.exports = {
    mode: process.env.ENV || 'production',
    target: "web",
    entry: [
        '@babel/polyfill',
        "./src/index.js"
    ],
    output: {
        path: buildPath,
        filename: `zangdar.min.js`,
    },
    devtool: isDev ? 'inline-source-map' : false,
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ["@babel/preset-env", {
                                modules: false,
                                targets: {
                                    browsers: ["last 2 versions", "safari >= 7", "IE >= 11"]
                                }
                            }]
                        ],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-transform-runtime',
                            ["@babel/plugin-transform-modules-commonjs", {
                                "allowTopLevelThis": true
                            }]
                        ]
                    }
                }
            }
        ]
    }
}