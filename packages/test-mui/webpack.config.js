const dotenv = require('dotenv');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const deps = require('./package.json').dependencies;
const webpack = require('webpack');
const {ModuleFederationPlugin} = webpack.container;

const isAnalyze = process.env.ANALYZE === 'true'; // 번들 분석 여부

module.exports = () => {
	dotenv.config({path: `../../config/.env.${process.env.NODE_ENV}`});
	console.log('WEBPACK - NODE_ENV: ----->' + process.env.NODE_ENV);

	const common = {
		mode: process.env.NODE_ENV,
		entry: './src/main.js',
		resolve: {
			extensions: ['.js', '.jsx'],
		},
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: 'app.js',
			publicPath: 'http://localhost:4002/',
			clean: true,
		},
		module: {
			rules: [
				{
					test: /\.(js|jsx)$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/env', '@babel/preset-react'],
						},
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
					use: ['style-loader', 'css-loader'],
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
				name: 'mui',
				filename: 'remoteEntry.js',
				exposes: {
					'./Page': './src/Page.js',
					'./ExPage': './src/ExPage.js',
				},
				shared: {
					react: {
						singleton: true,
						eager: true,
						// requiredVersion: deps.react,
					},
					'react-dom': {
						singleton: true,
						eager: true,
						requiredVersion: deps['react-dom'],
					},
				},
			}),
		],
	};

	if (isAnalyze) {
		const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
		common.plugins.push(
			new BundleAnalyzerPlugin({
				analyzerMode: 'static',
				reportFilename: 'bundle-report.html',
				openAnalyzer: true,
			}),
		);
	}

	if (process.env.NODE_ENV === 'development') {
		common.devtool = 'source-map';
		common.devServer = {
			server: 'http',
			host: '0.0.0.0',
			port: 4002,
			open: true,
			historyApiFallback: true,
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
		};
	} else {
		common.devtool = 'hidden-source-map';
	}
	return common;
};
