const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const {ModuleFederationPlugin} = webpack.container;

module.exports = () => {
	const common = {
		mode: `development`,
		entry: './src/index.js',
		resolve: {
			extensions: ['.js', '.jsx'],
		},
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: 'app.js',
			publicPath: 'http://localhost:4000/',
			clean: true,
		},
		devtool: 'source-map',
		devServer: {
			server: 'http',
			host: '0.0.0.0',
			port: 4000,
			open: true,
			historyApiFallback: true,
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
		},
		module: {
			rules: [
				{
					test: /\.(js|jsx)$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {presets: ['@babel/env', '@babel/preset-react']},
					},
				},
				{
					test: /\.html$/,
					use: [
						{
							loader: 'html-loader',
							options: {
								minimize: true,
							},
						},
					],
				},
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader', 'postcss-loader'],
				},
				{
					test: /\.(jpg|png|svg)$/,
					use: {
						loader: 'url-loader',
						options: {
							limit: 25000,
						},
					},
				},
			],
		},

		plugins: [
			new HtmlWebpackPlugin({
				template: 'public/index.html',
			}),
			new ModuleFederationPlugin({
				name: 'main',
				filename: 'remoteEntry.js',
				remotes: {
					admin: `admin@${'http://localhost:4002'}/remoteEntry.js`,
				},
				shared: {},
			}),
		],
	};
	return common;
};
