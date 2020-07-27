import _FormGlobalData from '_FormGlobalData'
import _FormGlobalFn from '_FormGlobalFn'
import _FormGlobalConf from '_FormGlobalConf'

import MyPaging from './thirdParty/MyPaging/MyPaging.js'
import './thirdParty/MyPaging/MyPaging.css'

import FormRun from 'formRun'
import fuzzySearch from 'ztree-fuzzysearch'

/**
 * 
 * 分页初始化链
 * 	this.initevent() -> this.setPaging()
 * 分页调用链
 * 	this.page.paging.setCurrent() -> this.page.paging.jump() -> this.loadData() -> this.queryDatas -> this.setTbody()
 * @returns
 */
export default class ListRun {
	constructor() {

		this.isOutMobileTemp = false; //由主应用传入，判断外层是否为app
		this.$context = document;
		this.cfgdata = {};
		this.cfgdataModel = {};
		this.fieldRelas = {};
		this.datas = [];
		//this.updatedatas=[];//应该是用不到了，可以删除
		this.deldatas = [];
		this.page = null;
		this.searchFlag = false;
		this.searchCacheData = {};
		this.rowsForm = [];
		this.pform = null; //上层应用（主应用）
		this.fun = {};
		this.groupidx = 0;
	}
	setCfgData(cfgdata) {
		this.cfgdata = cfgdata;
		this.cfgdataModel = cfgdata.list;
		this.fieldRelas = cfgdata.list.fieldRelas;
		this.cfgdataModel.handler = null;
		this.cfgdataModel.fieldRelas = null;

		this.page = {
			current: 1, // 当前页
			size: this.cfgdataModel.pageSize || 10, // 每页显示多少条
			paging: null // 分页对象
		}
	}

	/**
	初始化事件
	**/
	initevent() {
		//列表全选，app列表暂时没这东西
		$("div.table-container tr.head input[type='checkbox']", this.$context).change(function() {
			var $checkboxs = $("div.table-container .row >td.td-checkbox >input", this.$context);
			if ($(this).is(":checked")) {
				$checkboxs.prop("checked", true);
			} else {
				$checkboxs.prop("checked", false);
			}
		});
		this.setPaging(); // 初始化分页对象并调用loadData方法

		// 初始化左边树
		if (this.cfgdataModel.leftTree) {
			this.initLeftTree();
		} else {
			$("body > div.table-body > div.left").hide();
		}

		let _this = this;
		this.fun.openCreate = function() {
			_this.openCreate();
		}
		this.fun.delData = function() {
			_this.delData();
		}
		this.fun.refresh = function() {
			_this.refresh();
		}
		this.fun.openRowView = function(eleObj) {
			_this.openRowView(eleObj);
		}
		this.fun.openRowUpdate = function(eleObj) {
			_this.openRowUpdate(eleObj);
		}
		this.fun.delRowData = function(eleObj) {
			_this.delRowData(eleObj);
		}

		if (this.cfgdata.isMobileTemp && typeof mui !== 'undefined') {
			mui(_this.$context).on('tap', '[tclick="btn"]', function() {
				_this.fun[$(this).attr("fun")](this);
			});
		} else {
			$(_this.$context).on("click", '[tclick="btn"]', function() {
				_this.fun[$(this).attr("fun")](this);
			});
		}
	}

	/**
	 * 自定义按钮初始化
	 */
	initBtn() {
		//表头按钮
		_FormGlobalFn.initBtn(this.cfgdataModel.btnConfs, "list");
		//列表按钮
		_FormGlobalFn.initListBtn(this.cfgdataModel.optBtnConfs);
	}

	/**
	 * 修改子应用时才用到
	 * 通过trGroupId获取行数据
	 */
	getDataBytrGroupId(trGroupId) {
		let index = -1;
		for (let i = 0; i < this.datas.length; i++) {
			if (this.datas[i]['_INNER_TR_GROUP_ID'] == trGroupId) {
				index = i;
				break;
			}
		}
		return index;
	}
	/**
	 * 修改子应用时才用到
	 * 通过trGroupId获取行formRun对象
	 */
	getFormRunBytrGroupId(trGroupId) {
		let index = -1;
		for (let i = 0; i < this.rowsForm.length; i++) {
			if (this.rowsForm[i].data.columnsData['_INNER_TR_GROUP_ID'] == trGroupId) {
				index = i;
				break;
			}
		}
		return index;
	}

	/**
	 * 获取子应用提交数据
	 */
	getSubData(trGroupId) {
		let subTableDatas = [];
		//子应用弹出框编辑
		/*
		for(let i=0;i<this.updatedatas.length;i++){
			let isDel = false;
			for(let j=0;j<this.deldatas.length;j++){
				if(this.updatedatas[i].columnsData['_INNER_TR_GROUP_ID'] == this.deldatas[j]['_INNER_TR_GROUP_ID']){
					isDel = true;
				}
			}
			if(!isDel){				
				subTableDatas.push(this.updatedatas[i]);
			}
		}
		*/
		let keyName = this.cfgdataModel.keyName;
		//子应用列表直接编辑
		for (let i = 0; i < this.rowsForm.length; i++) {
			let rowForm = this.rowsForm[i];
			let rowData = this.datas[i];
			//编辑过的或者新增的
			if (rowForm.subFormRunInitedChangedFlag || rowData['_INNER_CREATE_OR_UPDATE'] === 'create') {
				let updatedata = rowForm.getSubmitData();
				let _columnsData = updatedata.columnsData;

				for (let key in rowData) {
					if (_columnsData[key] !== 0 && !_columnsData[key]) {
						_columnsData[key] = rowData[key];
					}
				}
				_columnsData['I_INNER_KEYVALUE'] = rowData['I_INNER_KEYVALUE'] || rowData[keyName];
				_columnsData[keyName] = _columnsData['I_INNER_KEYVALUE'];
				_columnsData['_INNER_CREATE_OR_UPDATE'] = rowData['_INNER_CREATE_OR_UPDATE'];
				_columnsData['_INNER_ROW_NUM_FLAG'] = rowData['_INNER_ROW_NUM_FLAG'];
				_columnsData['_INNER_TR_GROUP_ID'] = rowData['_INNER_TR_GROUP_ID'];
				subTableDatas.push(updatedata);
			}
		}

		let delSubData = [];
		for (let j = 0; j < this.deldatas.length; j++) {
			if (this.deldatas[j]['I_INNER_KEYVALUE']) {
				delSubData.push(this.deldatas[j]['I_INNER_KEYVALUE']);
			}
		}

		return {
			entId: this.cfgdata.mainEntId, //子应用应用id
			subTableDatas: subTableDatas, //新增修改数据
			delSubData: delSubData, //删除主键值数组
			subTableKeys: this.cfgdataModel.keyName //主键名称
		};
	}

	/**
	 * 保存后初始子应用提交数据
	 */
	afterSubmitSubData(subTableDatas) {
		//this.updatedatas = [];
		this.deldatas = [];
		let keyName = this.cfgdataModel.keyName;
		for (let i = 0; i < subTableDatas.length; i++) {
			let keyValue = subTableDatas[i]['keyValue'] || subTableDatas[i]['columnsData']['I_INNER_KEYVALUE']; //主键
			for (let j = 0; j < this.datas.length; j++) {
				if (this.datas[j]['_INNER_TR_GROUP_ID'] == subTableDatas[i]['columnsData']['_INNER_TR_GROUP_ID']) {
					this.datas[j]['I_INNER_KEYVALUE'] = keyValue;
					this.datas[j][keyName] = keyValue;
					this.datas[j]['_INNER_CREATE_OR_UPDATE'] = 'update'; //保存后更新状况为修改

					//修改formRun
					this.rowsForm[j].data.columnsData['I_INNER_KEYVALUE'] = keyValue;
					this.rowsForm[j].data.columnsData[keyName] = keyValue;
					this.rowsForm[j].data.columnsData['_INNER_CREATE_OR_UPDATE'] = 'update'; //保存后更新状况为修改
					$(this.rowsForm[j].$context).closest(".row").attr("keyvalue", keyValue);
				}
			}
		}
	}

	refresh() {
		this.setCurrent();
	}
	/**
	 * 获取列表数据
	 */
	queryDatas(pageSize, currentPage, searchParam, callback) {
		var data = {
			entId: this.cfgdata.mainEntId,
			ctrlPrefix: this.cfgdataModel.ctrlPrefix,
			pageSize: pageSize,
			currentPage: currentPage,
			searchParamItems: searchParam.searchParamItems
		};

		_FormGlobalFn.ajaxRequestJson(this.cfgdataModel.dataUrl, data, callback);
	};
	/**
	 * 获取列表数据
	 * keyValue:(主应用)主键值/(子应用)列表下标,不传为勾选值
	 */
	getData(keyValue) {
		let _this = this;
		var keyName = _this.cfgdataModel.keyName;
		if (!!keyValue) {
			let index = -1;
			index = _this.datas.byAttr("I_INNER_KEYVALUE", keyValue);
			if (index === -1) {
				index = _this.datas.byAttr(keyName, keyValue);
			}
			return _this.datas[index];
		} else { //app列表暂时没有勾选
			var result = [];
			$('div.table-container .row', _this.$context).each(function(i, d) {
				if ($(this).find("td.td-checkbox input").is(":checked")) {
					let index = -1;
					let _keyValue = $(this).closest("tr").attr("keyvalue");
					index = _this.datas.byAttr("I_INNER_KEYVALUE", _keyValue);
					if (index === -1) {
						index = _this.datas.byAttr(keyName, _keyValue);
					}
					result.push(_this.datas[index]);
				}
			});
			return result;
		}
	}


	/**
	 * 新增，修改，查看弹出页面窗口
	 * xtip.close(id);
	 */
	showCreateUpdateViewWindow4Url(type, url, width, height, title, noYes) {
		let _this = this;
		return _FormGlobalFn.showWindow4Url(url, width, height, title, function(index, layero) {
			if (!_this.cfgdata.subEntFlag) { //主应用
				if (!_FormGlobalFn.d2sClick()) {
					return false;
				}

				if (!_this.cfgdata.isMobileTemp) { //普通列表（刷新）
					$(layero).find("iframe")[0].contentWindow.FormGlobalFn.api.form.submitForm(index);
				} else if (_this.cfgdata.isMobileTemp && 'update' === type) { //app列表且修改(不刷新，修改列)，新增不做处理					
					$(layero).find("iframe")[0].contentWindow.FormGlobalFn.api.form.submitForm(index,
						function(data, index) {
							_FormGlobalFn.showClose(index); //关闭本窗口
							_this.updateRow4App(data);
						}, false);
				} else if (_this.cfgdata.isMobileTemp && 'create' === type) { //app列表且新增只关闭窗口不做处理	
					$(layero).find("iframe")[0].contentWindow.FormGlobalFn.api.form.submitForm(index, function(data, index) {
						_FormGlobalFn.showClose(index); //关闭本窗口
					}, false);
				}


			} else if (_this.cfgdata.subEntFlag && !!_this.pform) { //子应用				
				$(layero).find("iframe")[0].contentWindow.FormGlobalFn.api.form.getData(function(data) {
					if (data) {
						_this.updateOrAdd(data);
						_FormGlobalFn.showClose(index);
					}
				});
			}
		}, noYes);
	}
	openCreate(width, height, title) {
		var url = /* this.cfgdata.contextPath + */
			'.#{appPrefix}/form.html?entId=#{entId}&optype=create&isOutMobileTemp=#{isOutMobileTemp}';
		url = url.format({
			appPrefix: this.cfgdata.isMobileTemp ? "/app" : "",
			entId: this.cfgdata.mainEntId,
			isOutMobileTemp: this.isOutMobileTemp
		});
		this.showCreateUpdateViewWindow4Url("create", url, width, height, this.cfgdata.mainEntName);
	}
	/**
	 * 列表上按钮查看当前行
	 */
	openRowView(eleObj, width, height, title) {
		let keyValue = $(eleObj).closest(".row").attr("keyvalue");

		let url = '';
		url = /* this.cfgdata.contextPath + */
			'.#{appPrefix}/form.html?entId=#{entId}&viewType=true&isOutMobileTemp=#{isOutMobileTemp}&mkfn=#{mkfn}&mkfv=#{mkfv}';
		url = url.format({
			appPrefix: this.cfgdata.isMobileTemp ? "/app" : "",
			entId: this.cfgdata.mainEntId,
			isOutMobileTemp: this.isOutMobileTemp,
			mkfn: this.cfgdataModel.keyName,
			mkfv: keyValue
		});

		this.showCreateUpdateViewWindow4Url("view", url, width, height, this.cfgdata.mainEntName, true);
	};
	/**
	 * 列表上按钮修改当前行
	 */
	openRowUpdate(eleObj, width, height, title) {
		if (!this.cfgdata.subEntFlag) { //主应用
			let keyValue = $(eleObj).closest(".row").attr("keyvalue");
			this.openUpdate(keyValue, width, height, title);
		} else if (this.cfgdata.subEntFlag && !!this.pform) { //子应用
			let trGroupId = $(eleObj).closest(".row").attr("trgroupid");
			this.openUpdate(trGroupId, width, height, title);
		}
	};
	/**
	 * 全局修改按钮
	 * keyValueOrTrGroupId:(主应用)keyValue主键值/(子应用)trgroupid唯一标识
	 */
	openUpdate(keyValueOrTrGroupId, width, height, title) {
		if (!keyValueOrTrGroupId && keyValueOrTrGroupId != 0) {
			let updateDatas = this.getData();
			if (updateDatas.length != 1) {
				_FormGlobalFn.showAlert('请勾选一个需要修改的数据！', 'w');
				return false;
			}
			keyValueOrTrGroupId = updateDatas[0][this.cfgdataModel.keyName]
		}
		let url = '';
		if (!this.cfgdata.subEntFlag) { //主应用
			url = /* this.cfgdata.contextPath + */
				'.#{appPrefix}/form.html?entId=#{entId}&optype=update&mkfn=#{mkfn}&mkfv=#{mkfv}';
			url = url.format({
				appPrefix: this.cfgdata.isMobileTemp ? "/app" : "",
				entId: this.cfgdata.mainEntId,
				mkfn: this.cfgdataModel.keyName,
				mkfv: keyValueOrTrGroupId
			});
		} else if (this.cfgdata.subEntFlag && !!this.pform) { //子应用
			url = /* this.cfgdata.contextPath + */
				'.#{appPrefix}/form.html?entId=#{entId}&optype=create&isOutMobileTemp=#{isOutMobileTemp}&trGroupId=#{trGroupId}&trGroupCreateOrUpdate=#{trGroupCreateOrUpdate}&data=#{data}';
			let trGroupId = keyValueOrTrGroupId;
			let index = this.getDataBytrGroupId(trGroupId);
			let rowData = this.datas[index] || {};

			//列表直接编辑
			let rowForm = this.rowsForm[index];
			let _columnsData = rowForm.getSubmitData().columnsData;
			_columnsData['I_INNER_KEYVALUE'] = rowData['I_INNER_KEYVALUE'];
			_columnsData['_INNER_CREATE_OR_UPDATE'] = rowData['_INNER_CREATE_OR_UPDATE'];
			_columnsData['_INNER_ROW_NUM_FLAG'] = rowData['_INNER_ROW_NUM_FLAG'];
			_columnsData['_INNER_TR_GROUP_ID'] = rowData['_INNER_TR_GROUP_ID'];
			rowData = _columnsData;

			var data = {
				columnsData: rowData,
				entId: this.cfgdata.mainEntId,
				keyName: this.cfgdataModel.keyName,
				keyValue: rowData[this.cfgdataModel.keyName],
				opType: "create" //???????????????????????
			}
			var _data = base64.encodeUrl(JSON.stringify(data));
			url = url.format({
				appPrefix: this.cfgdata.isMobileTemp ? "/app" : "",
				entId: this.cfgdata.mainEntId,
				isOutMobileTemp: this.isOutMobileTemp,
				trGroupId: trGroupId,
				trGroupCreateOrUpdate: rowData['_INNER_CREATE_OR_UPDATE'],
				data: _data
			});
		}
		this.showCreateUpdateViewWindow4Url("update", url, width, height, this.cfgdata.mainEntName);
	}
	/**
	 * 删除当前行
	 */
	delRowData(eleObj) {
		if (!this.cfgdata.subEntFlag) { //主应用
			let keyValue = $(eleObj).closest(".row").attr("keyvalue");
			this.delData(keyValue);
		} else if (this.cfgdata.subEntFlag && !!this.pform) { //子应用
			let trGroupId = $(eleObj).closest(".row").attr("trgroupid");
			this.delData(trGroupId);
		}
	}
	/**
	 * 全局删除（数据）按钮
	 * keyValueOrTrGroupId:(主应用)keyValue主键值/(子应用)trgroupid唯一标识
	 */
	delData(keyValueOrTrGroupId) {
		let _this = this;
		if (!_this.cfgdata.subEntFlag) { //主应用
			let delDatas = [];
			let keyValue = keyValueOrTrGroupId;
			if (keyValue) {
				delDatas.push(_this.getData(keyValue));
			} else {
				delDatas = _this.getData();
				if (delDatas.length == 0) {
					_FormGlobalFn.showAlert('请勾选需要删除的数据！', 'w');
					return false;
				}
			}
			_FormGlobalFn.showConfirm("是否删除数据？", function() {
				let delKeyValues = [];
				for (let i = 0; i < delDatas.length; i++) {
					delKeyValues.push(delDatas[i]['I_INNER_KEYVALUE'] || delDatas[i][_this.cfgdataModel.keyName]);
				}

				//app列表删除行后掩藏这行,通过trgroupid属性判断哪一行
				let delTrGroupIds = [];
				for (let i = 0; i < delDatas.length; i++) {
					delTrGroupIds.push(delDatas[i]['_INNER_TR_GROUP_ID']);
				}

				//请求后端删除
				_FormGlobalFn.ajaxRequestJson(_this.cfgdataModel.delUrl, {
					entId: _this.cfgdata.mainEntId,
					delKeyValues: delKeyValues
				}, function(data) {
					if (data.result) {
						if (_this.cfgdata.isMobileTemp) { // app列表删除行后掩藏这行
							$('div.table-container .row', _this.$context).each(function(i, d) {
								let trGroupId = $(this).attr("trgroupid");
								if (delTrGroupIds.indexOf(trGroupId) >= 0) {
									$(this).hide();
								}
							});
						} else { // 普通列表删除行后刷新列表
							_this.refresh();
						}
						_FormGlobalFn.showAlert('删除数据成功！', 's');
					} else {
						_FormGlobalFn.showAlert('删除数据失败！', 'e');
					}
				});
			}, "w");
		} else if (_this.cfgdata.subEntFlag && !!this.pform) { //子应用
			let trGroupIds = [];
			let trGroupId = keyValueOrTrGroupId;
			if (trGroupId) { //子应用传下标
				trGroupIds.push(trGroupId);
			} else {
				$('div.table-container .row', _this.$context).each(function(i, d) {
					trGroupId = $(this).attr("trgroupid");
					if ($(this).find("td.td-checkbox input").is(":checked")) {
						trGroupIds.push(trGroupId);
					}
				});
				if (trGroupIds.length == 0) {
					_FormGlobalFn.showAlert('请勾选需要删除的数据！', 'w');
					return false;
				}
			}
			_FormGlobalFn.showConfirm("是否删除数据？", function() {
				//子应用删除数据之前，将删除的数据保存起来，以供后端判断crud操作
				for (let i = 0; i < trGroupIds.length; i++) {
					let index = _this.getDataBytrGroupId(trGroupIds[i])
					if (index > -1) {
						_this.deldatas.push(_this.datas[index]);
					}
				}

				_this.delRows(trGroupIds); //删除页面上的列表展示
				_FormGlobalFn.showAlert('删除数据成功！', 's');
			}, "w");
		}
	}

	/**加载数据**/
	loadData() {
		let _this = this;
		var searchFn = function(searchParam) {
			let loadId = _FormGlobalFn.showLoad();
			_this.queryDatas(_this.page.size, _this.page.current, searchParam, function(data) {
				_FormGlobalFn.showClose(loadId);
				if (data.result) {
					var page = data.obj;
					if (page.list.length == 0 && _this.current > 1) {
						setTimeout(function() { //重新发起异步刷新页面请求
							_this.setCurrent(_this.current - 1);
						}, 0);
					} else {
						if (_this.cfgdata.isMobileTemp && !_this.cfgdata.subEntFlag) { //app列表主应用
							_this.datas.push(...page.list);
						} else { //普通列表以及app的子应用
							_this.datas = page.list;
						}
						_this.setTbody(page.list, page);
						_this.page.paging.setTotal(page.total);


						//搜索后执行
						if (typeof _FormGlobalFn.callback.search.afterSubmit == "function") {
							_FormGlobalFn.callback.search.afterSubmit(page);
						}
					}
				}
			});
		}
		if (_this.searchFlag) {
			searchFn(_this.searchCacheData);
		} else {
			//if(!_this.pform||_this.pform.cfgdataModel.opType!="create")
			if (!_this.cfgdata.subEntFlag) { //主应用
				searchFn({});
			} else if (_this.cfgdata.subEntFlag && !!_this.pform) { //子应用
				if (_this.pform.cfgdataModel.opType == "create") { //通过pform判断是新增还是修改
					searchFn({
						searchParamItems: [{
							fieldName: "1",
							value: "2",
							compareType: "="
						}]
					});
				} else if (_this.pform.cfgdataModel.opType == "update") {
					searchFn({
						searchParamItems: [{
							fieldName: _this.cfgdata.subJoinField4Sub,
							value: _this.pform.data.columnsData[_this.cfgdata.subJoinField4Parent],
							compareType: "="
						}]
					});
				}
			}

		}
	}
	// 创建分页对象
	setPaging() {
		let _this = this;

		var sizes = (function() {
			let pageSize = _this.cfgdataModel.pageSize || 10;
			return [pageSize, pageSize * 2, pageSize * 5, pageSize * 10];
		})();

		_this.page.paging = new MyPaging($('#page_box', _this.$context), {
			size: this.size,
			sizes: sizes, // 选择每页条数
			total: 0,
			current: this.current,
			prevHtml: '上一页',
			nextHtml: '下一页',
			layout: 'total, totalPage, sizes, prev, pager, next, jumper',
			jump: function() {
				// 这儿的this指向paging对象
				_this.page.current = this.current; // 设置当前页
				_this.page.size = this.size; // 设置当前每页多少条

				// 点击页数按钮都会调用
				_this.loadData();
			}
		});
	}
	//列表模板，后续加缓存
	temphtml() {
		let templ = $("div.table-container template[templid='" + this.cfgdata.mainEntId + "']", this.$context)[0].content.querySelector(
			"tbody").innerHTML;
		return templ;
	}
	setTbody(list) {
		let _this = this;
		$("div.table-container .row", _this.$context).remove();
		//模板
		let templ = _this.temphtml();
		_this.rowsForm = [];
		for (let i = 0; i < list.length; i++) {
			let item = list[i];

			item['_INNER_ROW_NUM_FLAG'] = i + 1; //行号
			let trGroupId = _this.cfgdata.mainEntId + "_trgroupid_" + (++_this.groupidx);
			item['_INNER_TR_GROUP_ID'] = trGroupId;
			item['_INNER_CREATE_OR_UPDATE'] = 'update';
			_this.datas[i] = item;
			let html = templ.format(item, true);
			let $html = $(html);
			$html.attr("trgroupid", trGroupId);
			$('div.table-container tbody', _this.$context).append($html);

			let rowForm = new FormRun();
			rowForm.opType = 'update';
			rowForm.data = {
				columnsData: item
			};
			rowForm.$context = $html;
			rowForm.setListCfgData(_this.cfgdata);
			rowForm.setFieldRelas(_this.fieldRelas);
			rowForm.inicfg(_this.cfgdata.mainEntId, "list");
			_this.rowsForm[i] = rowForm;
			//			$("[tclick=btn]",rowForm.$context).click(function(){
			//				_this.fun[$(this).attr("fun")](this);
			//		    });
		}
	}
	/**
	 * 针对子应用
	 */
	updateOrAdd(data) {
		if (!data.columnsData["_INNER_TR_GROUP_ID"]) {
			this.addRow(data);
		} else {
			let trGroupId = data.columnsData["_INNER_TR_GROUP_ID"];
			this.updateRow(trGroupId, data);
		}
	}

	/**
	 * 针对子应用
	 */
	addRow(data) { //针对子应用
		let _this = this;

		let templ = _this.temphtml();
		data.columnsData['_INNER_ROW_NUM_FLAG'] = _this.datas.length + 1; //行号
		let trGroupId = _this.cfgdata.mainEntId + "_trgroupid_" + (++_this.groupidx);
		data.columnsData['_INNER_TR_GROUP_ID'] = trGroupId;
		data.columnsData['_INNER_CREATE_OR_UPDATE'] = 'create';
		_this.datas.push(data.columnsData);
		let html = templ.format(data.columnsData, true);
		let $html = $(html);
		$html.attr("trgroupid", trGroupId);
		$('div.table-container tbody', _this.$context).append($html);

		let rowForm = new FormRun();
		rowForm.opType = 'create';
		rowForm.data = data;
		rowForm.$context = $html;
		rowForm.setListCfgData(_this.cfgdata);
		rowForm.inicfg(_this.cfgdata.mainEntId, "list");
		_this.rowsForm.push(rowForm);
		//		$("[tclick=btn]",rowForm.$context).click(function(){
		//			_this.fun[$(this).attr("fun")](this);
		//		});

		//子应用新增数据时，将新增的数据保存起来，以供后端判断crud操作
		//_this.updatedatas.push(data);
	}

	/**
	 * 针对子应用
	 * 
	 * 不需要处理['_INNER_CREATE_OR_UPDATE']，用原始值;
	 */
	updateRow(trGroupId, data) { //针对子应用
		let _this = this;

		let idx = _this.datas.byAttr("_INNER_TR_GROUP_ID", trGroupId);
		if (idx == -1) return;
		data.columnsData['_INNER_ROW_NUM_FLAG'] = _this.datas[idx]['_INNER_ROW_NUM_FLAG'] //行号
		data.columnsData['I_INNER_KEYVALUE'] = _this.datas[idx]['I_INNER_KEYVALUE'] //主键
		_this.datas[idx] = data.columnsData;

		let rowForm = _this.rowsForm[idx];
		rowForm.data = data;
		rowForm.inicfg(_this.cfgdata.mainEntId, "list");
		//标识子应用列表已经修改过了
		rowForm.subFormRunInitedChangedFlag = true;
		/*
		//子应用修改数据时，将修改的数据保存起来，以供后端判断crud操作(需要覆盖旧的相同trGroupId的数据)
		let isExist = false;
		for(let i=0; i<_this.updatedatas.length; i++){
			if(_this.updatedatas[i].columnsData['_INNER_TR_GROUP_ID'] == trGroupId){
				_this.updatedatas[i] = data;
				isExist = true;
				break;
			}
		}
		if(!isExist){//不存在则新增
			_this.updatedatas.push(data);
		}
		*/
	}
	/**
	 * 针对子应用
	 * 删除页面上的列表展示
	 */
	delRows(trGroupIds) {
		let indexs = [];
		for (let i = 0; i < trGroupIds.length; i++) {
			indexs.push(this.getDataBytrGroupId(trGroupIds[i]));
		}
		//删除数据
		this.datas.delete(indexs);
		//删除表单对象
		this.rowsForm.delete(indexs);
		//修改总共多少记录数据
		//this.page.paging.setTotal(this.page.paging.total - indexs.length);
		//删除展示行
		$('div.table-container .row', this.$context).each(function(i, d) {
			if (trGroupIds.indexOf($(this).attr("trgroupid")) > -1) {
				$(this).remove();
			}
		});
		//刷新行号
		$('div.table-container .row td.td-rowNum', this.$context).each(function(i, d) {
			$(this).text(i + 1);
		});
	}
	//翻页
	setCurrent(currentPage) {
		this.page.paging.setCurrent(currentPage || this.page.paging.current);
	}
	//左边树初始化
	initLeftTree() {
		let _this = this;
		$(".left", this.$context).attr("treeid", _this.cfgdataModel.leftTree.treeId);
		if (_this.cfgdataModel.treeConf.width) {
			$(".left", this.$context).css({
				"width": _this.cfgdataModel.treeConf.width
			});
		}
		let $tree = $(".left", this.$context).find(".ztree");
		if (_this.cfgdataModel.leftTree) {
			let bindOutFieldName = _this.cfgdataModel.treeConf.doubleDataSourceFlag ? _this.cfgdataModel.treeConf.bindOutFieldName2 :
				_this.cfgdataModel.treeConf.bindOutFieldName1;

			//非勾选			
			let treeClick = function(event, treeId, treeNode, clickFlag) {
				if (!_this.cfgdataModel.treeConf.doubleDataSourceFlag || (_this.cfgdataModel.treeConf.doubleDataSourceFlag ==
						true && treeNode.nodeType == "two")) {
					let bindToValueFlag = true;
					let bindOutFieldDataTypeId = '2';
					if (!_this.cfgdataModel.treeConf.doubleDataSourceFlag) { //单数据源节点
						bindToValueFlag = _this.cfgdataModel.treeConf.bindToValueFlag1;
						bindOutFieldDataTypeId = _this.cfgdataModel.treeConf.bindOutFieldDataTypeId1;
					} else { //双数据源节点            	
						bindToValueFlag = (treeNode.nodeType == "two" ? _this.cfgdataModel.treeConf.bindToValueFlag2 : _this.cfgdataModel
							.treeConf.bindToValueFlag1);
						bindOutFieldDataTypeId = (treeNode.nodeType == "two" ? _this.cfgdataModel.treeConf.bindOutFieldDataTypeId2 :
							_this.cfgdataModel.treeConf.bindOutFieldDataTypeId1);
					}

					let treeData = {
						fieldName: bindOutFieldName,
						value: bindToValueFlag ? treeNode.id : treeNode.name,
						fieldDataTypeId: bindOutFieldDataTypeId
					};

					_FormGlobalFn.api.search.search(treeData);
				}
			}
			let treeUrl = _this.cfgdata.contextPath + "/beta/dataService/tree";
			let setting = {
				async: {
					enable: true,
					url: treeUrl,
					autoParam: ["id=parentId", "nodeType", "linkValue", "level=lv"],
					otherParam: {
						"treeId": _this.cfgdataModel.leftTree.treeId
					}
					//dataFilter: filter
				},
				callback: {
					onClick: treeClick
				}
			};
			// 保存树对象对外提供扩展
			_this.leftTree = $.fn.zTree.init($tree, setting);

			//过滤
			let $search = $(".left", _this.$context).find("div.search input");
			fuzzySearch("leftTreeContainer", $search, true, true); //初始化模糊搜索方法		       
		}
	}

}
