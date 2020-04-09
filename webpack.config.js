const path = require('path')
const buildPath = path.resolve(__dirname, "./dist")
const isDev = process.env.ENV === 'development'

const baseConfig = {
		entry: ["./src/index.js"],
    mode: process.env.ENV || 'production',
    devtool: isDev ? 'inline-source-map' : false,
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {loader: 'babel-loader'}
            }
        ]
    }
}

/* const serverConfig = {
	target: "node",
	output: {
			path: buildPath,
			filename: 'zangdar.node.js',
	},
	...baseConfig
} */
const browserConfig = {
	target: "web",
	output: {
			path: buildPath,
			filename: 'zangdar.min.js',
	},
	...baseConfig
}

module.exports = [
	// serverConfig,
	browserConfig
]