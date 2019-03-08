const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

function NothingPlugin() {
	this.apply = function _() {};
}

const config = env => ({
	entry: './src/index.tsx',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: env && env.NODE_ENV === 'production' ? '[name].[contenthash].js' : '[name].js',
	},
	devtool: 'inline-source-map',
	// devtool: env && env.NODE_ENV === 'production' ? 'source-map' : 'cheap-module-eval-source-map',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.(css|less)$/,
				use: [
					env && env.NODE_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
					{
						loader: 'css-loader',
						options: {
							importLoaders: 2,
						},
					},
					'postcss-loader',
					'less-loader',
				],
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 2048,
						},
					},
				],
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: 'file-loader',
			},
		],
	},
	resolve: {
		extensions: [
			'.tsx',
			'.ts',
			'.js',
			'.jsx',
			'.mjs',
		],
	},
	devServer: {
		contentBase: './dist',
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),
		env && env.analyze ? new BundleAnalyzerPlugin() : new NothingPlugin(),
		new HtmlWebpackPlugin({
			template: 'public/index.html',
		}),
		env && env.NODE_ENV === 'production'
			? new MiniCssExtractPlugin({
				chunkFilename: '[id].css',
				filename: '[name].[contenthash].css',
			})
			: new NothingPlugin(),
	],
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				cache: true,
				parallel: true,
				sourceMap: true,
			}),
			new OptimizeCSSAssetsPlugin({}),
		],
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /node_modules/,
					chunks: 'initial',
					name: 'vendor',
					enforce: true,
				},
				styles: {
					name: 'styles',
					test: /\.(css|less)$/,
					chunks: 'all',
					enforce: true,
				},
			},
		},
	},
});

module.exports = config;
