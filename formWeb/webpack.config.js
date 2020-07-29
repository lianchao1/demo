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
		formEntry: ['@babel/polyfill', 'lodash', 'layui-layer', './src/base64.js', './src/common.js',
			'./src/form/form.js', './src/list/list.js', './src/list/search.js', './src/formEntry.js'
		],
		listEntry: ['@babel/polyfill', 'lodash', 'layui-layer', './src/base64.js', './src/common.js',
			'./src/form/form.js', './src/list/list.js', './src/list/search.js', './src/listEntry.js'
		],
		appListEntry: ['@babel/polyfill', 'lodash', 'layui-layer', './src/base64.js', './src/common.js',
			'./src/form/form.js', './src/list/list.js', './src/list/search.js',
			'./src/thirdParty/mui/js/mui.min.js', './src/thirdParty/mui/css/mui.min.css',
			'./src/app_listEntry.js'
		]
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
		}, {
			test: /\.(ttf|eot|woff|woff2|svg)/,
			use: ['file-loader']
		}]
	},
	plugins: [
		new webpack.DefinePlugin({
			__DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
		}),
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			chunks: ['formEntry'], //添加引入的js,也就是entry中的key
			filename: 'form.html',
			minify: {
				collapseWhitespace: false //折叠空白区域 也就是压缩代码
			},
			hash: true,
			template: path.join(__dirname, './page/form.html') //模板地址
		}),
		new HtmlWebpackPlugin({
			chunks: ['formEntry'], //添加引入的js,也就是entry中的key
			filename: 'appform.html',
			minify: {
				collapseWhitespace: false //折叠空白区域 也就是压缩代码
			},
			hash: true,
			template: path.join(__dirname, './page/app_form.html') //模板地址
		}),
		new HtmlWebpackPlugin({
			chunks: ['listEntry'], //添加引入的js,也就是entry中的key
			filename: 'list.html',
			minify: {
				collapseWhitespace: false //折叠空白区域 也就是压缩代码
			},
			hash: true,
			template: path.join(__dirname, './page/list.html') //模板地址
		}),
		new HtmlWebpackPlugin({
			chunks: ['appListEntry'], //添加引入的js,也就是entry中的key
			filename: 'applist.html',
			minify: {
				collapseWhitespace: false //折叠空白区域 也就是压缩代码
			},
			hash: true,
			template: path.join(__dirname, './page/app_list.html') //模板地址
		})
	],
	resolve: {
		extensions: ['.js', ".json", '.css'], //在导入语句没带文件后缀时，Webpack 会自动带上后缀后去尝试访问文件是否存在
		modules: [path.resolve(__dirname, "src"), "node_modules"],
	},
	devtool: 'eval-source-map', //eval-source-map
	devServer: {
		//contentBase: path.join(__dirname, "dist"), //页面目录
		publicPath: '/formWeb/beta2/', //内存中生成的编译目标目录(类似应用名)
		port: 8081,
		open: true,
		openPage: '/formWeb/beta2/applist.html?entId=entid_TEST_INFO_ZBUYAODONG'
	},
	externals: {

	}
}
