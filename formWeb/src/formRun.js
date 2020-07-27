import _FormGlobalData from '_FormGlobalData'
import _FormGlobalFn from '_FormGlobalFn'
import _FormGlobalConf from '_FormGlobalConf'

import FormFile from './form/file'
import FormDate from './form/date'
import FormMap from './form/map'
import FormApp from './form/app'
import FormFilter from './form/filter'
import FormLeft2Right from './form/left2right'
import FormTree from './form/tree'

export default class FormRun {
	constructor() {
		this.$context = document;
		this.cfgdata = {};
		this.cfgdataModel = {};
		this.fieldRelas = {};
		this.data = {};
		this.ctrlType = "form"; //form list
		this.viewType = false;
		this.handler = {};
		this.trGroupId = null; //子应用唯一标识
		this.trGroupCreateOrUpdate = "create"; //标识子应用新增修改，而非当前高级表单是新增还是修改
		this.subFormRunInitedFlag = false; //子应用formRun实例是否初始化完成(首先是子应用，然后初始化完成)
		this.subFormRunInitedChangedFlag = false; //子应用formRun实例初始化完成后是否修改
		this.initFormDynamicValueFlag = true; //搜索栏表单赋值单个值时，不需要重复初始化
		this.subListRuns = []; //子应用列表对象
		this.isShowMsg = true; //是否显示提示信息
	}
	setCfgData(cfgdata) {
		this.cfgdata = cfgdata;
		this.cfgdataModel = cfgdata.form;
		this.fieldRelas = cfgdata.form.fieldRelas;
		this.cfgdataModel.handler = null;
		this.cfgdataModel.fieldRelas = null;
		if (!this.fieldRelas) {
			this.fieldRelas = [];
		}
	}
	//搜索栏上的编辑
	setSearchCfgData(cfgdata) {
		this.cfgdata = cfgdata;
		this.cfgdataModel = cfgdata.search;
		this.fieldRelas = cfgdata.search.fieldRelas
		this.cfgdataModel.handler = null;
		this.cfgdataModel.fieldRelas = null;
		if (!this.fieldRelas) {
			this.fieldRelas = [];
		}
	}
	//列表上编辑
	setListCfgData(cfgdata) {
		this.cfgdata = cfgdata;
		this.cfgdataModel = cfgdata.list;
		this.cfgdataModel.handler = null;
		this.cfgdataModel.fieldRelas = null;
		this.fieldRelas = cfgdata.list.fieldRelas;
		this.cfgdataModel.opType = "update";
		if (!this.fieldRelas) {
			this.fieldRelas = [];
		}
	}
	setFieldRelas(fieldRelas) {
		this.fieldRelas = fieldRelas;
	}
	/**
	 * entid:应用id
	 * type:（form、list）
	 * ctrlPrefix:列表传入类型（主要后端获取缓存用的）
	 */
	inicfg(entid, type) {
		let optype = _FormGlobalFn.getQueryString("optype");
		let viewType = _FormGlobalFn.getQueryString("viewType");
		//明细报表通过修改表单来实现
		if (viewType == "true" && type !== "list") {
			this.viewType = true;
			optype = "update";
			this.cfgdataModel = this.cfgdata.view;
			this.fieldRelas = this.cfgdata.view.fieldRelas
			this.cfgdataModel.handler = null;
			this.cfgdataModel.fieldRelas = null;
			if (!this.fieldRelas) {
				this.fieldRelas = [];
			}
		}
		this.ctrlType = type;
		this.cfgdataModel.opType = this.cfgdataModel.opType || optype || 'create';
		if ("update" == this.cfgdataModel.opType || type === "list") {
			if (type === "list") {
				this.initFormValue();
				//子应用每行formRun实例初始化后标识初始化成功
				if (this.cfgdata.subEntFlag) {
					this.subFormRunInitedFlag = true;
				}
			} else {
				let mkfn = _FormGlobalFn.getQueryString("mkfn");
				let mkfv = _FormGlobalFn.getQueryString("mkfv");
				let url2 = this.cfgdata.contextPath + "/beta/dataService/queryFormData?entid=" + entid + "&mkfn=" + mkfn +
					"&mkfv=" + mkfv;
				let _this = this;
				_FormGlobalFn.ajaxRequestJson(url2, {}, function(ret) {
					if (ret.result) {
						//修改页面数据加载完毕（包括子应用数据）
						editDataHasInitFlag = true;
						_this.data = ret.obj;
						_this.initFormValue();
					}
				});
			}
		} else {
			this.initFormValue();
			if (this.cfgdata.subEntFlag) {
				//子应用
				let data = _FormGlobalFn.getQueryString("data");
				let trGroupId = _FormGlobalFn.getQueryString("trGroupId");
				let trGroupCreateOrUpdate = _FormGlobalFn.getQueryString("trGroupCreateOrUpdate");
				if (data && trGroupId != "") {
					this.trGroupId = trGroupId;
					this.trGroupCreateOrUpdate = trGroupCreateOrUpdate;
					data = JSON.parse(base64.decodeUrl(data));
					_FormGlobalFn.api.form.setData(data);
				}
			}
		}
	}

	/**
	 * 自定义按钮初始化
	 */
	initBtn() {
		_FormGlobalFn.initBtn(this.cfgdataModel.btnConfs, "form");
	}

	/**
	 * 控件默认修改事件
	 * 该方法目前是通过调用触发的，非事件触发，this指向FormRun实例
	 */
	change(event) {
		let _this = this;
		let $this = $(event.target);
		let eleId = $this.attr("id");
		let fieldRelas = _this.fieldRelas;
		//let formSubmitData = _this.getSubmitData();
		_this.validateone($this); //数据有效性验证
		for (let i = 0; i < fieldRelas.length; i++) {
			let fieldRela = fieldRelas[i];
			let fieldConf = _this.cfgdataModel.fieldConfs[fieldRela.id];
			if (fieldRela.dependFieldMap != null && fieldRela.dependFieldMap[eleId] == "true") {
				let formData = {};
				for (let keyid in fieldRela.dependFieldMap) {
					let fieldConf = _this.cfgdataModel.fieldConfs[keyid];
					let resultObj = _this.getSingleSubmitData(fieldConf);
					formData[fieldConf.fieldName] = resultObj.value;
				}

				if (fieldRela.initSqlkey != "") {
					let url = _this.cfgdata.contextPath + "/beta/dataService/queryFieldSql";
					let datajson = {
						mainEntId: _this.cfgdata.mainEntId,
						ctrlPrefix: _this.cfgdataModel.ctrlPrefix,
						fieldRelaVo: fieldRela,
						formdata: formData,
					};
					_FormGlobalFn.ajaxRequestJson(url, datajson, function(data) {
						if (data.result) {
							_this.initFieldHtml(fieldConf, data.obj);
						}
					});
				}
				if (fieldRela.initSysVar != "" || fieldRela.initJs != "" || fieldRela.initUrlParam != "") {
					let url = _this.cfgdata.contextPath + "/beta/dataService/queryExpression";
					let datajson = {
						mainEntId: _this.cfgdata.mainEntId,
						ctrlPrefix: _this.cfgdataModel.ctrlPrefix,
						fieldRelaVo: fieldRela,
						formdata: formData,
					};
					_FormGlobalFn.ajaxRequestJson(url, datajson, function(data) {
						if (data.result) {
							let val = data.obj;
							if (fieldRela.initJs != "") {
								try {
									eval("val=" + val);
								} catch (err) {
									val = "";
								}
							}
							_this.initSingleFormValue(fieldConf, val);
						}
					});
				}
			}
		}
	}

	/**
	 * 动态初始化html
	 */
	initFormDynamicValue() {
		let _this = this;
		let fieldRelas = _this.fieldRelas;


		/**
		 * sql翻译
		 */
		let sqlFn = function(fieldRela, fieldConf, _this, formData) {
			//过滤控件在设值之前不需要初始化，否则会有异步回填不确定问题
			if (fieldRela.initSqlkey != "" && _this.cfgdataModel.fieldConfs[fieldRela.id].ctrlTypeId != "filter") {
				let url = _this.cfgdata.contextPath + "/beta/dataService/queryFieldSql";
				let datajson = {
					mainEntId: _this.cfgdata.mainEntId,
					ctrlPrefix: _this.cfgdataModel.ctrlPrefix,
					fieldRelaVo: fieldRela,
					formdata: formData,
				};
				let id = _FormGlobalFn.eleId(fieldConf);
				if (_FormGlobalData.dict[id] && !(_this.cfgdataModel.opType == "create" && fieldConf.ctrlTypeId == "input")) {
					/*非新增时获取oracle 序列的场景*/
					_this.initFieldHtml(fieldConf, _FormGlobalData.dict[id]);
				} else {
					if (_this.cfgdataModel.opType == "create" && fieldConf.ctrlTypeId == "input") {
						/*新增时获取oracle 序列的场景*/
						_FormGlobalFn.ajaxRequestJson(url, datajson, function(data) {
							if (data.result) {
								let $id = $("[id='" + id + "']", _this.$context);
								$id.val(data.obj[0]["value"]);
							}
						});
					} else {
						/*非新增时获取oracle 序列的场景*/
						_FormGlobalFn.ajaxRequestJson(url, datajson, function(data) {
							if (data.result) {
								if (data.cacheFlag) {
									_FormGlobalData.dict[id] = data.obj;
								}
								_this.initFieldHtml(fieldConf, data.obj);
							}
						});
					}
				}
			}
		}
		/**
		 * 表达式翻译翻译
		 */
		let expressionFn = function(fieldRela, fieldConf, _this, formData) {
			if (fieldRela.initSysVar != "" || fieldRela.initJs != "" || fieldRela.initUrlParam != "") {
				let url = _this.cfgdata.contextPath + "/beta/dataService/queryExpression";
				let datajson = {
					mainEntId: _this.cfgdata.mainEntId,
					ctrlPrefix: _this.cfgdataModel.ctrlPrefix,
					fieldRelaVo: fieldRela,
					formdata: formData,
				};
				datajson.fieldId = fieldRela.id;

				//没有缓存的可能性吧。。。。。
				let id = _FormGlobalFn.eleId(fieldConf);
				if (_FormGlobalData.dict[id]) {
					let val = _FormGlobalData.dict[id];
					if (fieldRela.initJs != "") {
						eval("val=" + val);
					}
					_this.initSingleFormValue(fieldConf, val);

				} else {
					_FormGlobalFn.ajaxRequestJson(url, datajson, function(data) {
						if (data.result) {
							if (data.cacheFlag) {
								_FormGlobalData.dict[id] = data.obj;
							}
							let val = data.obj;
							if (fieldRela.initJs != "") {
								eval("val=" + val);
							}
							_this.initSingleFormValue(fieldConf, val);
						}
					});
				}
			}
		}




		//let formSubmitData = _this.getSubmitData();
		for (let i = 0; i < fieldRelas.length; i++) {
			let fieldRela = fieldRelas[i];
			let fieldConf = _this.cfgdataModel.fieldConfs[fieldRela.id];

			let formData = {};
			if (_this.ctrlType == "list") {
				formData = _this.data.columnsData;
			}
			/**
			 * 翻译（包括多选，单选，下拉类选项）：
			 *  列表：listDefault不管有没变量自己翻译，
			 *  表单：虚拟字段：没表单变量的直接翻译，有表单变量的通过change翻译；
			 *  	非虚拟字段：没表单变量的
			 *  					新增时直接翻译，
			 *  					修改时(input/textarea:不翻译（oracle取序列）,非输入控件需要翻译)，
			 *					有表单变量的通过change翻译
			 *  				
			 *  列表表单：非listDefault按表单逻辑
			 */
			if (_this.ctrlType == 'list') {
				if (fieldConf.ctrlTypeId == 'listDefault') {
					/*listDefault不管有没变量直接翻译*/
					sqlFn(fieldRela, fieldConf, _this, formData);
					expressionFn(fieldRela, fieldConf, _this, formData);
				} else {
					if (fieldConf.virtualFieldFlag && fieldRela.dependFieldMap == null) {
						/*虚拟字段：没变量的直接翻译*/
						sqlFn(fieldRela, fieldConf, _this, formData);
						expressionFn(fieldRela, fieldConf, _this, formData);
					} else if (!fieldConf.virtualFieldFlag && fieldRela.dependFieldMap == null) {
						if (_this.cfgdataModel.opType == "create") {
							/*新增时直接翻译*/
							sqlFn(fieldRela, fieldConf, _this, formData);
							expressionFn(fieldRela, fieldConf, _this, formData);
						} else if (fieldConf.ctrlTypeId !== 'input' && fieldConf.ctrlTypeId !== 'textarea') {
							/*修改时(input/textarea:不翻译（oracle取序列）,非输入控件需要翻译)*/
							sqlFn(fieldRela, fieldConf, _this, formData);
							expressionFn(fieldRela, fieldConf, _this, formData);
						}
					}
				}
			} else {
				if (fieldConf.virtualFieldFlag && fieldRela.dependFieldMap == null) {
					/*虚拟字段：没变量的直接翻译*/
					sqlFn(fieldRela, fieldConf, _this, formData);
					expressionFn(fieldRela, fieldConf, _this, formData);
				} else if (!fieldConf.virtualFieldFlag && fieldRela.dependFieldMap == null) {
					if (_this.cfgdataModel.opType == "create") {
						/*新增时直接翻译*/
						sqlFn(fieldRela, fieldConf, _this, formData);
						expressionFn(fieldRela, fieldConf, _this, formData);
					} else if (fieldConf.ctrlTypeId !== 'input' && fieldConf.ctrlTypeId !== 'textarea') {
						/*修改时(input/textarea:不翻译（oracle取序列）,非输入控件需要翻译)*/
						sqlFn(fieldRela, fieldConf, _this, formData);
						expressionFn(fieldRela, fieldConf, _this, formData);
					}
				}
			}
		}
	}
	/**
	 * 初始化控件
	 */
	initFormValue() {
		let _this = this;
		$("input", _this.$context).not("[no-form-ctrl='true']").off("change"); //解绑修改事件方便多次初始化
		$("select", _this.$context).not("[no-form-ctrl='true']").off("change"); //解绑修改事件方便多次初始化
		$("textarea", _this.$context).not("[no-form-ctrl='true']").off("change"); //解绑修改事件方便多次初始化
		let fnchange = function(event) {
			//子应用fromRun修改过标识
			if (_this.subFormRunInitedFlag) {
				_this.subFormRunInitedChangedFlag = true;
			}
			_this.change(event); //change函数为FormRun对象的函数，非jquery对象函数
		}
		$("input", _this.$context).not("[no-form-ctrl='true']").change(fnchange); //添加修改事件
		$("select", _this.$context).not("[no-form-ctrl='true']").change(fnchange); //添加修改事件
		$("textarea", _this.$context).not("[no-form-ctrl='true']").change(fnchange); //添加修改事件
		$("input[type=file]", _this.$context).not("[no-form-ctrl='true']").change(function() {
			_this.uploadFiles(this);
		});
		//搜索栏表单不需要重复初始化
		if (this.initFormDynamicValueFlag) {
			this.initFormDynamicValue();
		}

		if (_this.cfgdataModel.opType == "create") {
			for (let key in this.cfgdataModel.fieldConfs) {
				let fieldConf = this.cfgdataModel.fieldConfs[key];

				if (fieldConf == null) {
					break;
				}
				//uuid
				if (fieldConf.valueType == '7') { //"7" :UUID (系统生成唯一标识)
					fieldConf.defaultValue = _FormGlobalFn.uuid();
				}

				_this.initSingleFormValue(fieldConf, fieldConf.defaultValue);
			}
		} else {
			//修改
			for (let ownEntId_fieldName_fldId of this.cfgdataModel.mainFields) {
				let fieldConf = _this.cfgdataModel.fieldConfs[ownEntId_fieldName_fldId];
				if (typeof _this.data.columnsData[fieldConf.fieldName] != "undefined") {
					let value = _this.data.columnsData[fieldConf.fieldName];
					this.initSingleFormValue(fieldConf, value);
				} else if (!fieldConf.virtualFieldFlag) { //虚拟字段一般是通过翻译出来的
					this.initSingleFormValue(fieldConf, /*fieldConf.virtualFieldFlag? fieldConf.defaultValue: */ null);
				}
			}
		}
	}
	/**
	 * 表单验证
	 *
	 */
	validate(callback) {
		let _this = this;
		let fieldConfs = _this.cfgdataModel.fieldConfs;
		let re = true;
		let fildIds = [];
		for (let fildId in fieldConfs) {
			fildIds[fildIds.length] = fildId;
		}
		let icount = 0;
		let context = _this.$context;
		let resultCall = function(result) {
			re = result && re;
			icount = icount + 1;
			if (icount < fildIds.length) {
				_this.validateone($("[id='" + fildIds[icount] + "']", context), resultCall);
			} else {
				if (typeof callback == "function") {
					callback(re);
				}
			}
		};
		if (fildIds.length > 0) {
			_this.validateone($("[id='" + fildIds[icount] + "']", context), resultCall);
		}
	}
	/**
	 * required	必填
	 * valueOnly	无重复
	 * letter	英文字母
	 * integer	数字
	 * email	邮件
	 * zip	邮编
	 * idcard	身份证
	 * regexp	正则表达式
	 * custom	自定义表达式
	 */
	validateone($thisObj, callback) {
		let _this = this;
		let fieldConf = _this.cfgdataModel.fieldConfs[$thisObj.attr("id")];
		let validateConfs = [];
		if (!!fieldConf) {
			validateConfs = fieldConf.validateConfs;
		} else {
			if (typeof callback == "function") {
				callback(true);
			}
			return; //防止继续执行触发多次验证回调
		}
		let resultObj = _this.getSingleSubmitData(fieldConf);
		let result = {
			state: true
		};
		let isprocing = false;
		let asynValidateConfs = [];
		if (validateConfs != null) {
			for (let i = 0; i < validateConfs.length; i++) {
				let validateConf = validateConfs[i];
				switch (validateConf.validateType) {
					case "regexp":
						let reg = new RegExp(validateConf.rExp);
						if (!reg.test(resultObj.value)) {
							result.state = false;
						}
						break;
					case "custom":
					case "valueOnly":
						asynValidateConfs[asynValidateConfs.length] = validateConf;
						break;
					default:
						if (typeof _FormGlobalFn.check[validateConf.validateType] == "function") {
							result = _FormGlobalFn.check[validateConf.validateType](resultObj.value);
						}
						break;
				}
				if (!result.state) {
					result.validateConf = validateConf;
					break;
				}
			}
			if (!result.state || asynValidateConfs.length == 0 || resultObj.value == "" || resultObj.value == null) {
				this.procError($thisObj, result);
				if (typeof callback == "function") {
					callback(result.state);
				}
				return; //防止继续执行触发多次验证回调
			} else {
				//异步验证
				let icount = 0;
				let validFun = function(validateConf) {
					let url = _this.cfgdata.contextPath + "/beta/dataService/fieldValidate";
					let datajson = {
						mainEntId: _this.cfgdata.mainEntId,
						ctrlPrefix: _this.cfgdataModel.ctrlPrefix,
						formValidateConf: validateConf,
					};
					datajson.formdata = _this.getFormDataMap();
					datajson.fieldId = $thisObj.attr("id");
					_FormGlobalFn.ajaxRequestJson(url, datajson, function(data) {
						if (data.result) {
							let val = data.obj;
							try {
								eval("result.state=" + val);
							} catch (str) {}
							icount = icount + 1;
							if (!result.state || icount >= asynValidateConfs.length) {
								result.validateConf = validateConf;
								result.validateConf.errTip = data.msg;
								_this.procError($thisObj, result);
								if (typeof callback == "function") {
									callback(result.state);
								}
								return; //防止继续执行触发多次验证回调
							} else {
								validFun(asynValidateConfs[icount]);
							}
						}
					});
				};
				validFun(asynValidateConfs[icount]);
			}
		}
	}
	/**
	 * 验证提示
	 */
	procError($thisObj, result) {
		if (!result.state) {
			let validateConf = result.validateConf;
			let errmsg = validateConf.errTip;
			if (errmsg == null || errmsg == "") {
				errmsg = result.msg;
			}
			let html = "<div class='error'>" + errmsg + "</div>";
			$($thisObj).parent().parent().find(".error").remove();
			$($thisObj).parent().parent().append(html);
			//this.cfgdataModel.fieldConfs[$thisObj.attr("id")]["validata"]=false;
		} else {
			$($thisObj).parent().parent().find(".error").remove();
			//this.cfgdataModel.fieldConfs[$thisObj.attr("id")]["validata"]=true;
		}
	}
	/**
	 * 表单提交
	 */
	submitForm(showIndex, callback, ctrlPrefix) {
		let _this = this;
		this.validate(function(result) {
			if (result) {
				if (!_this.cfgdata.subEntFlag) { //主应用
					_this.submitForm2(function(result) {
						if (typeof callback == "function") {
							callback(result, showIndex);
						}
						//保存后执行
						if (typeof _FormGlobalFn.callback.form.afterSubmit == "function") {
							_FormGlobalFn.callback.form.afterSubmit(result, showIndex);
						}

						if (result && window.top != window) {
							try {
								let parent = window.parent; //获取父窗口
								if (parent.FormGlobalFn) {
									if (_FormGlobalConf.refresh4SubmitFlag) { //提交后是否刷新列表
										parent.FormGlobalFn.api.list.refresh();
									}
									_FormGlobalConf.refresh4SubmitFlag = true;
									if (_this.isShowMsg) {
										parent.FormGlobalFn.showAlert('保存成功！', 's');
									}

									//回调中可能存在异步请求需要等待异步结果，不能一味关闭页面
									if (typeof callback != "function" && typeof _FormGlobalFn.callback.form.afterSubmit != "function") {
										parent.FormGlobalFn.showClose(showIndex); //关闭本窗口
									}
								}
							} catch (e) {
								console.error("主应用提交，关闭弹窗失败！")
							}
						}
					}, ctrlPrefix);
				} else { //子应用
					//子应用提交在弹出yes按钮回调中操作
				}
			}
		});
		//异步的，永远返回false;
		return false;
	}
	/**
	 * 提交请求
	 */
	submitForm2(callback, ctrlPrefix) {
		let _this = this;
		let formSubmitData = _this.getSubmitData();
		//区分是否是通过列表编辑保存的数据，判断使用AjaxF_ 还是ListR_ 的字段配置
		formSubmitData.ctrlPrefix = ctrlPrefix || (this.cfgdata.isMobileTemp ? 'app_AjaxF_' : 'AjaxF_');

		//保存前执行
		if (typeof _FormGlobalFn.callback.form.beforeSubmit == "function") {
			let execFlag = _FormGlobalFn.callback.form.beforeSubmit(formSubmitData);
			if (!execFlag) return;
		}

		_FormGlobalFn.ajaxRequestJson(_this.cfgdataModel.submitUrl, formSubmitData, function(data) {
			if (data.result) {
				if (_this.isShowMsg) {
					parent.FormGlobalFn.showAlert("保存成功！", 's');
				}
				_this.cfgdataModel.opType = "update";
				_this.data = data.obj;

				//子应用新增记录时回填主键以及清空子应用updatedatas，deldatas数据
				if (_this.subListRuns.length > 0) {
					for (let i = 0; i < _this.subListRuns.length; i++) {
						let subEntId = _this.subListRuns[i].cfgdata.mainEntId;
						_this.subListRuns[i].afterSubmitSubData(_this.data['subTableDatas'][subEntId]);
					}
				}

				if (typeof callback == "function") {
					callback(_this.data);
				}
			} else {
				if (_this.isShowMsg) {
					parent.FormGlobalFn.showAlert("保存失败！", 'e');
				}
				if (typeof callback == "function") {
					callback(false);
				}
			}
		});
	}
	/**
	 * 文件上传
	 */
	uploadFiles($thisObj) {
		let _this = this;
		let fd = new FormData();
		let file = $thisObj.files[0];
		fd.append("files", file);

		$.ajax({
			method: "POST",
			url: this.cfgdata.contextPath + "/beta/dataService/uploadFiles",
			// 告诉jQuery不要去处理发送的数据，用于对data参数进行序列化处理 这里必须false
			processData: false,
			async: this.cfgdata.asyncFlag,
			// 告诉jQuery不要去设置Content-Type请求头
			contentType: false, //必须
			data: fd,
			success: function(ret) {
				if (ret.result) {
					console.log("上传成功！");
					let id = $($thisObj).attr("id");;
					if (!!_this.handler[id]) {
						_this.handler[id].add(ret.obj);
					} else {
						let fieldConf = _this.cfgdataModel.fieldConfs[id];
						let formFile = new FormFile(fieldConf, ret.obj, _this.cfgdata.contextPath, _this);
						_this.handler[id] = formFile;
					}
				} else {
					console.log("上传失败！");
				}
			},
			error: function(responseStr) {
				console.log("上传error！");
			}
		});
	}

	/**
	 * 获取单个控件
	 * 
	 */
	getSingleSubmitData(fieldConf) {
		if (!fieldConf) {
			return {
				result: false
			};
		}

		let context = this.$context;

		let result = false;
		let value = null;
		let id = _FormGlobalFn.eleId(fieldConf);

		let handlerId = id;
		let textId = id + "_text";
		//let fieldConf = this.cfgdataModel.fieldConfs[id];
		let $id = $("[id='" + id + "']", context);
		let $textId = $("[id='" + textId + "']", context);
		switch (fieldConf.ctrlTypeId) {
			case 'listDefault':
				value = $id.attr("value");
				result = true;
				break;
			case 'singleImgImport':
			case 'multiImgImport':
			case 'singleImgShow':
			case 'singleFileImport':
			case 'multiFileImport':
			case 'multiImgShow':
				result = true;
				if (!!this.handler[handlerId]) {
					value = this.handler[handlerId].getData();
				} else {
					value = "[]";
				}
				break;

			case 'date':
			case 'dateTime':
			case 'time':
				result = true;
				if (!!this.handler[handlerId]) {
					value = this.handler[handlerId].getData();
				} else {
					value = "";
				}
				break;
			case 'richText':
				result = true;
				if (!!this.handler[handlerId]) {
					value = this.handler[handlerId].getContent();
				} else {
					value = "";
				}
				break;
			case 'multiSelect':
				result = true;
				if (!!this.handler[handlerId]) {
					value = this.handler[handlerId].getData();
				} else {
					value = "";
				}
				break;
			case 'filter':
				if ($id.length > 0) {
					result = true;
					value = $id.val();
					//textValue = $textId.val();
				}
				break;
			case 'radio':
			case 'checkbox':

				value = getCheckBoxs(id, context);
				result = true;
				//$id.attr("oldValue",value);
				break;
			case 'tree':
			case 'treeSelect':
				result = true;
				if (!!this.handler[handlerId]) {
					value = this.handler[handlerId].getData();
				} else {
					value = "";
				}
				break;
			default:
				if ($id.length > 0) {
					result = true;
					value = $id.val();
				}
		}
		return {
			result: result,
			value: value,
			textValue: null,
			compareOperator: fieldConf.compareOperator,
			fieldDataTypeId: fieldConf.fieldDataTypeId || fieldConf._fieldDataTypeId
		};
	}
	/**
	 * 初始化单个控件
	 * 
	 */
	initSingleFormValue(fieldConf, value, textValue /*过滤控件输入值*/ ) {
		let _this = this;
		if (fieldConf == null) {
			return;
		}
		let context = _this.$context;
		let id = _FormGlobalFn.eleId(fieldConf);
		let handlerId = id;
		let $id = $("[id='" + id + "']", context); //异步中必须用let
		let $iddict = $("[id='" + id + "dict']", context);
		let $treediv = $("[treediv='" + id + "']", context);

		_FormGlobalFn.enabled($id);
		if (fieldConf.unableAdd && 'create' == _this.cfgdataModel.opType) {
			_FormGlobalFn.disabled($id);
		} else if (fieldConf.unableUpdate && 'update' == _this.cfgdataModel.opType) {
			_FormGlobalFn.disabled($id);
		}

		switch (fieldConf.ctrlTypeId) {
			case 'listDefault': //异步翻译任务与当前任务（同步任务）不在同一个宏任务，先执行当前静态翻译，后执行异步翻译
				/**
				 * fieldDataTypeId:
				 * "3" :日期 （例：2012-12-12）
				 * "8" :日期时间 （例：2012-12-12 12:12:12）
				 */
				if (fieldConf.virtualFieldFlag) { //非异步情况，虚拟字段从后端是获取不到值的，一般都是翻译出来的
					$id.attr("value", value);
					$id.html(value);
				} else if (!value && value != 0) {
					$id.attr("value", "");
					$id.html("");
				} else {
					switch (fieldConf.fieldDataTypeId || '') {
						case '3':
							value = (new Date(value)).format("yyyy-MM-dd");
							break;
						case '8':
							value = (new Date(value)).format("yyyy-MM-dd HH:mm:ss");
							break;
					}
					value += ""; //数值转字符串，null，undefined上面已经处理
					let multiValue = value.split(",");
					let listDefaultText = '';
					for (let i = 0; i < multiValue.length; i++) {
						let $dict = $iddict.find("[value='" + multiValue[i] + "']");
						if (i !== 0) listDefaultText += ",";

						if ($dict.length > 0) {
							listDefaultText += $dict.html();
						} else {
							listDefaultText += value;
						}
					}
					$id.attr("value", value);
					$id.html(listDefaultText);
				}
				break;
			case 'singleImgImport':
			case 'multiImgImport':
			case 'singleImgShow':
			case 'singleFileImport':
			case 'multiFileImport':
			case 'multiImgShow':
				let valueObject = [];
				if (!!value) {
					valueObject = JSON.parse(value);
				}
				let formFile = _this.handler[handlerId];
				if (!formFile) {
					formFile = new FormFile(fieldConf, valueObject, _this.cfgdata.contextPath, _this);
					_this.handler[handlerId] = formFile;
				} else {
					formFile.setData(value);
				}

				break;

			case 'date':
			case 'dateTime':
			case 'time':
				let formDate = _this.handler[handlerId];
				if (!formDate) {
					formDate = new FormDate(fieldConf, value, context);
					_this.handler[handlerId] = formDate;
				} else {
					formDate.setData(value);
				}
				break;
			case 'richText':
				let richText = _this.handler[handlerId];
				if (!richText) {
					let ctrlWidth = 500;
					let ctrlHeight = 500;
					try {
						if (fieldConf.ctrlWidth.endsWith("%")) {
							ctrlWidth = fieldConf.ctrlWidth;
						} else if (fieldConf.ctrlWidth.endsWith("px")) {
							ctrlWidth = fieldConf.ctrlWidth.replace("px", "");
						}
					} catch (e) {}
					try {
						if (fieldConf.ctrlHeight.endsWith("px")) {
							ctrlHeight = fieldConf.ctrlHeight.replace("px", "");
						}
					} catch (e) {}
					_this.handler[handlerId] = UE.getEditor($id[0], {
						initialFrameWidth: ctrlWidth, //只认百分比和数值，不支持px字符串
						initialFrameHeight: ctrlHeight, //只认数值，不支持px字符串和百分比
						autoHeightEnabled: false
					});
					_this.handler[handlerId].ready(function() {
						_this.handler[handlerId].setContent(value || '');
					});
				} else {
					richText.setContent(value || '');
				}
				break;
			case 'map':
				let formMap = _this.handler[handlerId];
				if (!formMap) {
					formMap = new FormMap(fieldConf, _this.cfgdata.contextPath, context);
					_this.handler[handlerId] = formMap;
				}
				$id.val(value);
				$id.trigger("change");
				break;
			case 'appCtrl':
				let formApp = _this.handler[handlerId];
				if (!formApp) {
					formApp = new FormApp(fieldConf, _this.cfgdata.contextPath, _this);
					_this.handler[handlerId] = formApp;
				}
				$id.val(value);
				$id.trigger("change");
				break;
			case 'filter':
				let formFilter = _this.handler[handlerId];
				if (!formFilter) {
					formFilter = new FormFilter(fieldConf, value, textValue, _this.cfgdataModel.ctrlPrefix, _this);
					_this.handler[handlerId] = formFilter;
				} else {
					formFilter.setData(value, textValue);
				}
				//		//在setData中触发
				//		$id.trigger("change");
				break;
			case 'radio':
				$("[ctrlId='" + id + "']", context).attr("oldValue", value);
				setRadio(id, value, context);
				break;
			case 'checkbox':

				$("[ctrlId='" + id + "']", context).attr("oldValue", value);
				setCheckBoxs(id, value, context);
				//$id.attr("oldValue",value);
				break;
			case 'select':
				$id.attr("oldValue", value);
				$id.val(value); //非变量联动的情况需要直接设置值
				if ($id.val() != null) { //赋值成功，触发change事件
					$id.trigger("change");
				}
				break;
			case 'multiSelect':
				let formLeft2Right = _this.handler[handlerId];
				if (!formLeft2Right) {
					formLeft2Right = new FormLeft2Right(fieldConf, value, _this);
					_this.handler[handlerId] = formLeft2Right;
				} else {
					formLeft2Right.setData(value);
				}
				$id.attr("oldValue", value);
				break;
			case 'tree':
			case 'treeSelect':
				let formTree = _this.handler[handlerId];
				if (!formTree) {
					formTree = new FormTree(fieldConf, value, _this.cfgdata.contextPath, _this.$context);
					_this.handler[handlerId] = formTree;
				} else {
					formTree.setData(value);
				}
				break;

			case 'input':
			case 'textarea':
				if ($id.length > 0) {
					let value_ = value;
					switch (fieldConf.fieldDataTypeId || '') {
						case '3':
							if (value_ || value_ === 0) {
								value_ = (new Date(value)).format("yyyy-MM-dd");
							}
							break;
						case '8':
							if (value_ || value_ === 0) {
								value_ = (new Date(value)).format("yyyy-MM-dd HH:mm:ss");
							}
							break;
					}

					$id.val(value_);
					$id.trigger("change");
				}
				break;
			default:
				if ($id.length > 0) {
					$id.val(value);
					$id.trigger("change");
				}
		}
	}

	initTree($treeObj) {
		let treeClick = function(event, treeId, treeNode) {
			//vm.queryVo.parentId=treeNode.id;
		}
		let treeUrl = this.cfgdata.contextPath + "/beta/dataService/tree";
		let setting = {
			async: {
				enable: true,
				url: treeUrl,
				autoParam: ["id=parentId", "nodeType", "linkValue", "level=lv"],
				otherParam: {
					"treeId": treeId
				}
				//dataFilter: filter
			},
			callback: {
				onClick: treeClick
			}
		};
		$.fn.zTree.init(eleObj, setting);
	}
	//初始化控件的html
	initFieldHtml(fieldConf, data) {
		if (fieldConf == null) {
			return false;
		}
		let context = this.$context;
		let result = false,
			value = null;
		let id = _FormGlobalFn.eleId(fieldConf);
		let handlerId = id;
		let $id = $("[id='" + id + "']", context);
		let $iddict = $("[id='" + id + "dict']", context);
		let html = "";
		switch (fieldConf.ctrlTypeId) {
			case 'listDefault':
				html = "";
				$iddict.html(html);
				for (let i = 0; i < data.length; i++) {
					let dv = data[i];
					html = html + "<div value='" + dv.value + "'>" + dv.name + "</div>";
				}

				$iddict.html(html);
				let value = $id.attr("value");
				if (fieldConf.virtualFieldFlag) { //异步情况
					$id.attr("value", data[0].value);
					$id.html(data[0].name);
				} else if (value) {
					let dictHtml = $iddict.find("[value=" + $id.attr("value") + "]").html();
					if (dictHtml) {
						//$id.attr("value",$dict);
						$id.html(dictHtml);
					} else {
						$id.html(value);
					}
				} else {
					$id.html("");
				}
				break;
			case 'input':
			case 'textarea':
				//翻译
				if (data.length > 0) {
					let value_ = data[0].value;
					switch (fieldConf.fieldDataTypeId || '') {
						case '3':
							if (value_ || value_ === 0) {
								value_ = (new Date(data[0].value)).format("yyyy-MM-dd");
							}
							break;
						case '8':
							if (value_ || value_ === 0) {
								value_ = (new Date(data[0].value)).format("yyyy-MM-dd HH:mm:ss");
							}
							break;
					}
					$id.val(value_);
					$id.trigger("change");
				}
				break;
			case 'select':
				html = "";
				$id.html(html);
				for (let i = 0; i < data.length; i++) {
					let dv = data[i];
					html = html + "<option value='" + dv.value + "'>" + dv.name + "</option>";
				}
				$id.html(html);
				$id.val($id.attr("oldValue"));
				if ($id.val() != null) { //赋值成功，触发change事件
					$id.trigger("change");
				}
				break;
			case 'multiSelect':
				html = "";
				for (let i = 0; i < data.length; i++) {
					let dv = data[i];
					html = html + "<option value='" + dv.value + "'>" + dv.name + "</option>";
				}

				let formLeft2Right = this.handler[handlerId];
				if (!formLeft2Right) {
					//必存在，宏任务列表中，this.initSingleFormValue优先于异步初始化下拉
				} else {
					formLeft2Right.setData($id.attr("oldValue"), html);
				}

				break;
			case 'checkbox':
				html = "";
				$id = $("[ctrlId='" + id + "']", context);
				$id.html(html);
				for (let i = 0; i < data.length; i++) {
					let dv = data[i];

					html = html + "<div class='zh-checkbox'><label><input id='" + id + "' name='" + id + "' type='checkbox' entid='" +
						fieldConf.ownEntId + "' value='" + dv.value + "' />" + dv.name + "</label></div>";
				}
				$id.html(html);
				setCheckBoxs(id, $id.attr("oldValue"), context);
				//$id.val($id.attr("oldValue"));
				break;
			case 'radio':
				html = "";
				$id = $("[ctrlId='" + id + "']", context);
				$id.html(html);
				for (let i = 0; i < data.length; i++) {
					let dv = data[i];

					html = html + "<div class='zh-radio'><label ><input id='" + id + "' name='" + id + "' type='radio' entid='" +
						fieldConf.ownEntId + "' value='" + dv.value + "' />" + dv.name + "</label></div>";
				}
				$id.html(html);
				setRadio(id, $id.attr("oldValue"), context);
				//$id.val($id.attr("oldValue"));
				break;

			case 'singleImgShow':
				break;
			case 'singleFileImport':
				break;
			case 'multiFileImport':
				break;
			case 'multiImgShow':
				break;
			case 'filter':
				break;
			case 'tree':
			case 'treeSelect':
				break;
			default:
				/*if(data.length>0){
			  $id.val($id.attr("oldValue"));
			  $id.trigger("change");
		    }*/

		}
	}
	/**
	 * 获取提交数据
	 * 
	 */
	getSubmitData() {
		let _this = this;
		let columnsData = {};
		let searchParamItems = [];
		for (let ownEntId_fieldName_fldId of this.cfgdataModel.mainFields) {
			let fieldConf = this.cfgdataModel.fieldConfs[ownEntId_fieldName_fldId];
			let resultObj = this.getSingleSubmitData(fieldConf);
			if (resultObj.result) {
				columnsData[fieldConf.fieldName] = resultObj.value;

				//搜索栏数据
				if (resultObj.value) { //空不作为查询条件				
					let searchParamItem = {};
					searchParamItems.push(searchParamItem);
					searchParamItem['fieldName'] = fieldConf.fieldName;
					searchParamItem['value'] = resultObj.value;
					searchParamItem['compareType'] = resultObj.compareOperator;
					searchParamItem['fieldDataTypeId'] = resultObj.fieldDataTypeId;
				}
			}
		}

		let submitData = {
			columnsData: columnsData,
			searchParamItems: searchParamItems,
			entId: this.cfgdata.mainEntId,
			keyName: this.cfgdataModel.keyName,
			keyValue: (function() { //新增保存后再次修改提取主键值
				if (!!_this.data && (0 === _this.data.keyValue || !!_this.data.keyValue)) {
					return _this.data.keyValue;
				}
				if (!!_this.data.columnsData) {
					return _this.data.columnsData['I_INNER_KEYVALUE'] || _this.data.columnsData[_this.cfgdataModel.keyName];
				}
				return null;
			})(),
			opType: this.cfgdataModel.opType
		}

		//子应用数据
		if (this.subListRuns.length > 0) {
			let delSubData = {};
			let subEntIds = [];
			let subTableDatas = {}
			let subTableKeys = {};

			for (let i = 0; i < this.subListRuns.length; i++) {
				let subData = this.subListRuns[i].getSubData();
				subEntIds.push(subData.entId); //子应用应用id
				subTableKeys[subData.entId] = subData.subTableKeys; //主键名称
				delSubData[subData.entId] = subData.delSubData; //删除主键值数组
				subTableDatas[subData.entId] = subData.subTableDatas; //新增修改数据
			}

			submitData.subEntIds = subEntIds;
			submitData.subTableKeys = subTableKeys;
			submitData.delSubData = delSubData;
			submitData.subTableDatas = subTableDatas;
		}


		if (submitData.keyValue == "null") {
			submitData.keyValue = null;
		}
		return submitData;
	}
	/**
	 * 验证用到
	 */
	getFormDataMap() {
		let formData = this.getSubmitData().columnsData;
		formData[this.cfgdataModel.keyName] = this.data.keyValue;
		return formData;
	}
}
