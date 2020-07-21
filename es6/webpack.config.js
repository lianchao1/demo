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
		new webpack.DefinePlugin({
		  __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
		}),
		new webpack.ProvidePlugin({//优先于cdn方式引入
			'$': 'jquery',
			jQuery: 'jquery',
			'ssln': 'jquery',//由于node_modules中不存在依赖，使用externals.jquery作为取代，//打包模块中别名ssln能生效,打包模块外不生效
			'_': 'lodash',//由于node_modules中有依赖，打包模块中'_'使用的是node_modules中的代码
		}),
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin({
			patterns: [{
				from: path.join(__dirname, 'src/origin.js')
			},{
				from: path.join(__dirname, 'src/global.js')
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
		extensions: ['.js', ".json", '.css'],//在导入语句没带文件后缀时，Webpack 会自动带上后缀后去尝试访问文件是否存在
		modules: [path.resolve(__dirname, "src"), "node_modules"],
	},
	devtool: 'eval-source-map', //eval-source-map
	devServer: {
		//contentBase: path.join(__dirname, "dist"), //页面目录
		publicPath: '/es6/', //内存中生成的编译目标目录(类似应用名)
		port: 8081,
		open: true,
		openPage: 'es6/main.html'
	},
	externals: {
	  jquery: "jQuery",//以cdn方式取代node_modules中的依赖，模块名为'jquery'
	  '_': 'lodash',
	  globalObjSb:'globalData'//导入的是外部全局对象中的globalData对象，模块名为globalObjSb
	}
}
