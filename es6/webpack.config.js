var webpack = require('webpack');
const {
	CleanWebpackPlugin
} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const ImageInlineSizeLimit = 10000; //默认limit是10000了，就是让8kb之内的图片才编码

module.exports = {
	entry: {
		main: './src/main.js',
		page1: './src/page1.js',
	},
	output: {
		//filename: './dist/[name].js',
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [{
			test: [/\.js$/],
			exclude: /node_modules/,
			loader: 'babel-loader'
		}, {
			test: /\.css$/, //*.global.css->不开启css-loader modules
			//loader: 'style-loader!css-loader'
			use: ['style-loader', 'css-loader'] // 从后往前执行
		}, {
			test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
			loader: 'url-loader',
			options: {
				limit: ImageInlineSizeLimit,
				name: 'static/media/[name].[hash:8].[ext]',
			},
		}]
	},
	plugins: [
		new webpack.ProvidePlugin({
			'$': 'jquery',
			jQuery: 'jquery',
			'_': 'lodash',
		}),
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin({
			patterns: [{
				from: path.join(__dirname, 'src/origin.js')
			}]
		}),
		new HtmlWebpackPlugin({
			chunks: ['main'], //添加引入的js,也就是entry中的key
			filename: 'main.html',
			minify: {
				collapseWhitespace: false //折叠空白区域 也就是压缩代码
			},
			hash: true,
			title: 'main',
			template: path.join(__dirname, './page/main.html') //模板地址
		}),
		new HtmlWebpackPlugin({
			chunks: ['page1'], //添加引入的js,也就是entry中的key
			filename: 'page1.html',
			minify: {
				collapseWhitespace: false //折叠空白区域 也就是压缩代码
			},
			hash: true,
			title: 'page',
			template: path.join(__dirname, './page/page1.html') //模板地址
		})
	],
	resolve: {
		extensions: ['.js', ".json", '.css'],
		modules: [path.resolve(__dirname, "src"), "node_modules"],
	},
	devtool: 'eval-source-map', //eval-source-map
	devServer: {
		//contentBase: path.join(__dirname, "dist"), //页面目录
		//publicPath: '/dist/', //内存中生成的编译目标目录
		port: 8081,
		open: true,
		openPage: 'main.html'
	}
}
