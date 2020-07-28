import 'ztree'
import fuzzySearch from 'ztree-fuzzysearch'
/**
 * type:'tree'树-直接显示(只支持多选)
 * 		'treeSelect'树-选择器
 * 
 * @param fieldConf
 * @param data
 * @param contextPath
 * @param $context
 * @returns
 */
export default class FormTree {
	constructor(fieldConf, data, contextPath, $context) {


		this.contextPath = contextPath;
		this.context = $context || document;
		this.treeConf = fieldConf.extendObj;
		this.type = fieldConf.ctrlTypeId;

		this.treeId = this.treeConf.treeId;
		//0:单选,1:多选,2:单勾选
		this.checked = this.treeConf.checked;
		//全选标识
		this.allCheckFlag = this.treeConf.allCheckFlag;

		//nocheck：不可勾选，singleCheck：勾选一个（暂时不考虑），multiCheck：多选勾选
		if (this.checked == 1) {
			this.checked = 'multiCheck';
		} else if (this.checked == 2) {
			this.checked = 'singleCheck';
		} else {
			this.checked = 'nocheck';
		}

		//树真实值（input 掩藏）
		this.id = FormGlobalFn.eleId(fieldConf);
		this.$id = $("[id='" + this.id + "']", this.context);
		this.ztreeId = this.id + "_ztree";
		this.filterId = this.id + "_filter";

		switch (this.type) {
			case 'treeSelect':
				//树显示值
				this.textId = this.id + "_text";
				this.$textId = $("[id='" + this.textId + "']", this.context);
				//树控件清空按钮
				this.$clear = this.$textId.next().find("i");
				//下拉树包裹的div
				this.treeoutId = this.id + "_treeout";
				let treeoutHtml = '<div id="' + this.treeoutId + '" treeid="' + this.treeId +
					'" style="position: absolute;min-width:250px;min-height:300px;background-color:#f5f5f5;border :1px solid Silver;display:none;z-index:999999999;">' +
					'	<div style="position: absolute;min-width:25px; height:30px;z-index:9999;right:20px;top:1px;">' +
					'		<a href="javascript:void(0);" style="display:none;"><i class="iconfont iconpiliang"></i></a>' +
					'		<a href="javascript:void(0);"><i class="iconfont iconshanchu1"></i></a>' +
					'	</div>' +
					'	<div style="z-index:9999;display:none;"><input id="' + this.filterId +
					'" style="width: calc(100% - 80px);"></div>' +
					'	<ul class="ztree treeSelectorView" id="' + this.ztreeId + '"></ul>' //必须要提供id，不然ztree会有问题
					+
					'</div>';
				this.$treeoutId = $(treeoutHtml);
				if (this.treeConf.width) {
					this.$treeoutId.css({
						"width": this.treeConf.width
					});
				}
				if (this.treeConf.height) {
					this.$treeoutId.css({
						"height": this.treeConf.height
					});
				}

				this.$textId.after(this.$treeoutId);
				//下拉树包裹的关闭按钮
				this.$treeoutCheckId = this.$treeoutId.find("a:eq(0) > i");
				//下拉树包裹的关闭按钮
				this.$treeoutCloseId = this.$treeoutId.find("a:eq(1) > i");
				//树的html
				this.$handler = this.$treeoutId.find("ul.ztree");

				break;
			case 'tree':
				this.$handler = $("[id='" + this.ztreeId + "']", this.context);
				break;
		}


		this.handler = {};


		/*
		 * 原始数据数组形式
		 * 缓存数据，勾选后剔除已勾选的数据
		 */
		this.data = [];
		if (!!data) {
			this.data = data.split(",");
			this._setData(data);
		}

		this.handler = this.init4Tree();

		if (this.treeConf.filterFlag) {
			//过滤
			let $filter = $("input[id='" + this.filterId + "']", this.$context);
			$filter.parent().show();
			this.$handler.css({
				"max-height": "calc(100% - 30px)"
			})
			fuzzySearch(this.ztreeId, $filter, true, true); //初始化模糊搜索方法		
		}

		let _this = this;
		//树控件清空操作
		_this.type == 'tree' || _this.$clear.click(function() {
			if (_this.checked != 'nocheck') { //勾选
				//清楚缓存数据
				_this.data = [];
				//去除勾选
				_this.handler.checkAllNodes(false);
			}
			_this.$id.val(null);
			_this.$id.trigger("change");
			_this.$textId.html("请选择");
		});

	}
	init4Tree() {
		let _this = this;
		let treeId = _this.treeId;

		_this.type == 'tree' || _this.$textId.click(function() {
			if (_this.$treeoutId.is(":visible")) {
				return;
			} else {
				//掩藏其他下拉树
				$("div[id$='_treeout']", _this.context).hide();
			}

			let left = $(this).offset().left;
			let top = $(this).offset().top + $(this).height() + 10;
			_this.$treeoutId.css("left", left);
			_this.$treeoutId.css("top", top);
			_this.$treeoutId.show();
		});

		//掩藏下拉
		_this.type == 'tree' || _this.$treeoutCloseId.click(function() {
			_this.$treeoutId.hide();
		});
		//确认勾选
		_this.type == 'tree' || _this.$treeoutCheckId.click(function() {
			let nodes = _this.handler.getCheckedNodes(true);

			let text = "";
			let value = "";
			let index = 0;
			for (let i = 0; i < nodes.length; i++) {
				let node = nodes[i];
				//是否允许选择
				let shouldChecked = false;
				if (_this.allCheckFlag || !_this.treeConf.doubleDataSourceFlag || (_this.treeConf.doubleDataSourceFlag == true &&
						node.nodeType == "two")) {
					shouldChecked = true;
				}

				let bindToValueFlag = true;
				if (!_this.treeConf.doubleDataSourceFlag) { //单数据源节点
					bindToValueFlag = _this.treeConf.bindToValueFlag1;
				} else { //双数据源节点            	
					bindToValueFlag = (node.nodeType == "two" ? _this.treeConf.bindToValueFlag2 : _this.treeConf.bindToValueFlag1);
				}
				//bindToValueFlag = true;//控件中绑定值才有意义，不然都不能回填了

				if (!shouldChecked) {
					continue;
				}
				if (index == 0) {
					text += (node.oldname || node.name);
					value += (bindToValueFlag ? node.id : node.name);
				} else {
					text += "," + (node.oldname || node.name);
					value += "," + (bindToValueFlag ? node.id : node.name);
				}
				index++;
			}

			//再加上未展开的数据，即this.data中的值
			if (_this.data.length > 0) {
				_this._setData(index > 0 ? (value + "," + _this.data.join(',')) : _this.data.join(','));
				_this.$treeoutId.hide();
			} else {
				_this.$id.val(value);
				_this.$id.trigger("change");
				_this.$textId.html(text || "请选择");
				_this.$treeoutId.hide();
			}
		});


		let funClick = function(event, treeId, treeNode, clickFlag) {
			//树-直接显示 不支持非勾选
			if (_this.checked == 'nocheck') { //非勾选			
				if (_this.allCheckFlag || !_this.treeConf.doubleDataSourceFlag || (_this.treeConf.doubleDataSourceFlag == true &&
						treeNode.nodeType == "two")) {
					_this.$id.val(treeNode.id);
					_this.$id.trigger("change");
					_this.$textId.html(treeNode.name);

					//下拉不可勾选类型选择后掩藏弹出树
					_this.$treeoutId.hide();
				}
			}
		}

		function asyncNodes(node) {
			if (!node) return;

			//配置为静态则全部展开				
			if (node.isParent && node.zAsync) {
				let childrenNodes = node.children;
				for (let i = 0; i < childrenNodes.length; i++) {
					//当前节点配置的是否是动态数据
					let treeDynamicFlag = false;
					if (!_this.treeConf.doubleDataSourceFlag) { //单数据源节点
						treeDynamicFlag = _this.treeConf.treeDynamic1;
					} else { //双数据源节点
						treeDynamicFlag = (childrenNodes[i].nodeType == "two" ? _this.treeConf.treeDynamic2 : _this.treeConf.treeDynamic1);
					}
					//动态->静态，二数据源为静态时，需要在加载二级数据源时全部加载
					if (_this.treeConf.doubleDataSourceFlag && !_this.treeConf.treeDynamic2) { //判断是否是一级动态+二级静态
						if (node.nodeType != "two" && childrenNodes[i].nodeType == "two") { //判断是否为一二级交接处
							treeDynamicFlag = false;
						}
					}

					if (!treeDynamicFlag) { //静态才处理
						asyncNodes(childrenNodes[i]);
					}
				}
			} else {
				//当前节点配置的是否是动态数据
				let treeDynamicFlag = false;
				if (!_this.treeConf.doubleDataSourceFlag) { //单数据源节点
					treeDynamicFlag = _this.treeConf.treeDynamic1;
				} else { //双数据源节点
					treeDynamicFlag = (node.nodeType == "two" ? _this.treeConf.treeDynamic2 : _this.treeConf.treeDynamic1);
				}

				if (!treeDynamicFlag) { //静态才处理
					_this.handler.reAsyncChildNodes(node, "refresh", true);
				}
			}

		}
		/**
		 * 静默展开所有配置为静态的异步节点，达到静态的效果（静态动态区分太复杂了，简单处理）
		 * 
		 */
		function asyncAll4Static(event, treeId, treeNode, msg) {
			let nodes = !!treeNode ? [treeNode] : _this.handler.getNodes();
			for (let i = 0; i < nodes.length; i++) {
				asyncNodes(nodes[i]);
			}
		}
		let funAsyncSuccess = function(event, treeId, treeNode, msg) {
			if (_this.checked != 'nocheck') { //展开时勾选
				let nodes = !!treeNode ? treeNode.children : _this.handler.transformToArray(_this.handler.getNodes());
				for (let i = 0; i < nodes.length; i++) {
					//console.log(nodes[i].name);//不重复打印出所有节点

					let index = _this.data.indexOf(nodes[i]['id']);
					if (index > -1) {
						_this.handler.checkNode(nodes[i], true, false, false); //勾选树节点
						_this.data.delete(index); //删除已勾选的缓存数据
					}

				}
			}

			asyncAll4Static(event, treeId, treeNode, msg);
		}

		////树-直接显示 自动同步勾选 1秒内触发改变
		let synCheck = _.debounce(function(data) {
			_this._setData(data);
			console.log(data);
		}, 1000);
		let funCheck = function(event, treeId, treeNode) {
			//树-直接显示 自动同步勾选
			if (_this.type == 'tree' && _this.checked != 'nocheck') { //非勾选
				let nodes = _this.handler.getCheckedNodes(true);

				let value = "";
				let index = 0;
				for (let i = 0; i < nodes.length; i++) {
					let node = nodes[i];
					//是否允许选择
					let shouldChecked = false;
					if (_this.allCheckFlag || !_this.treeConf.doubleDataSourceFlag || (_this.treeConf.doubleDataSourceFlag == true &&
							node.nodeType == "two")) {
						shouldChecked = true;
					}

					let bindToValueFlag = true;
					if (!_this.treeConf.doubleDataSourceFlag) { //单数据源节点
						bindToValueFlag = _this.treeConf.bindToValueFlag1;
					} else { //双数据源节点            	
						bindToValueFlag = (node.nodeType == "two" ? _this.treeConf.bindToValueFlag2 : _this.treeConf.bindToValueFlag1);
					}
					//bindToValueFlag = true;//控件中绑定值才有意义，不然都不能回填了

					if (!shouldChecked) {
						continue;
					}
					if (index == 0) {
						value += (bindToValueFlag ? node.id : node.name);
					} else {
						value += "," + (bindToValueFlag ? node.id : node.name);
					}
					index++;
				}

				//再加上未展开的数据，即this.data中的值
				if (_this.data.length > 0) {
					value = index > 0 ? (value + "," + _this.data.join(',')) : _this.data.join(',');
				}

				//1秒内触发改变
				synCheck(value);
			}
		}

		let funBeforeCheck = function(treeId, treeNode) {
			//单勾选
			if (_this.checked == 'singleCheck') {
				//当前节点选中状态
				let treeNodeChecked = treeNode.checked;
				//去除勾选
				_this.data = [];
				_this.handler.checkAllNodes(false);

				_this.handler.checkNode(treeNode, treeNodeChecked, true, false);
			}
			return null;
		}
		let treeUrl = _this.contextPath + "/beta/dataService/tree";
		let setting = {
			async: {
				enable: true,
				url: treeUrl,
				autoParam: ["id=parentId", "nodeType", "linkValue", "level=lv"],
				otherParam: {
					"treeId": treeId
				}
			},
			view: {
				showTitle: false
			},
			callback: {
				onAsyncSuccess: funAsyncSuccess,
				onClick: funClick,
				onCheck: funCheck,
				beforeCheck: funBeforeCheck
			}
		};
		if (_this.checked != 'nocheck') {
			_this.type == 'tree' || _this.$treeoutCheckId.parent().show();
			setting.check = {
				enable: true,
				chkboxType: _this.checked == 'singleCheck' ? {
					"Y": "",
					"N": ""
				} : _this.treeConf.ztreeSettingCheckChkboxType
			}
		}
		return $.fn.zTree.init(_this.$handler, setting);
	}
	/**
	 * 对外赋值，需要清空已有数据，去除勾选，加上勾选
	 */
	setData(data) {
		this.$id.val(null);
		this.type == 'tree' || this.$textId.html("");
		if (this.checked != 'nocheck') {
			//去除勾选
			this.handler.checkAllNodes(false);

			//勾选已有
			this.data = data.split(",") || [];

			/*
			 * 原始数据数组形式
			 * 缓存数据，勾选后剔除已勾选的数据
			 */
			if (!!data) {
				this.data = data.split(",");
			} else {
				this.data = [];
			}
			let nodes = this.handler.transformToArray(this.handler.getNodes());
			for (let i = 0; i < nodes.length; i++) {
				let index = this.data.indexOf(nodes[i]['id']);
				if (index > -1) {
					this.handler.checkNode(nodes[i], true, false, false); //勾选树节点
					this.data.delete(index); //删除已勾选的缓存数据
				}
			}
		}
		this._setData(data);
	}
	/**
	 * 真实值，展示值回填
	 * 不做多选勾选
	 */
	_setData(data) {
		if (!data) {
			return;
		}

		//真实值回填
		this.$id.val(data);
		setTimeout(() => {
			//防止FormTree对象没有初始化就触发验证
			this.$id.trigger("change");
		}, 0);

		//普通树展示不需要翻译
		if (this.type == 'tree') return;

		let treeTextUrl = this.contextPath + "/beta/dataService/treeText?treeId=" + this.treeId;
		FormGlobalFn.ajaxRequestJson(treeTextUrl, {
			value: data,
			checked: this.checked != 'nocheck',
			allCheckFlag: this.allCheckFlag
		}, (ret) => {
			if (ret.result) {
				this.$textId.html(ret.obj || "请选择");
			}
		});

	}
	getData() {
		return this.$id.val();
	}
}
