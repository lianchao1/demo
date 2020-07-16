var webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
const ImageInlineSizeLimit = 10000; //默认limit是10000了，就是让8kb之内的图片才编码

module.exports = {
	entry: {
		main: './src/main.js',
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
		new CleanWebpackPlugin()
	],
	resolve: {
		extensions: ['.js', ".json", '.css'],
		modules: [path.resolve(__dirname, "src"), "node_modules"],
	},
	devtool: 'eval-source-map',//eval-source-map
	devServer: {
		contentBase: path.join(__dirname, "page"), //页面目录
		publicPath: '/dist/', //内存中生成的编译目标目录
		port: 8081,
		open: true
	}
}
