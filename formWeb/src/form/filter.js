import _FormGlobalFn from '_FormGlobalFn'

export default class FormFilter {
	constructor(fieldConf, value, name, ctrlPrefix, formRun) {

		this.context = formRun.$context;
		this.formRun = formRun;
		this.ctrlPrefix = ctrlPrefix;
		this.fieldConf = fieldConf;
		this.id = _FormGlobalFn.eleId(fieldConf);
		this.textId = this.id + "_text";
		if (value) {
			this.setData(value, name);
		}

		let $inputText = $("[id='" + this.textId + "']", this.context);
		let $div = $inputText.parent().find("div");

		$inputText.off("blur");
		$div.off("blur");
		$inputText.on("blur", function() { //失去焦点
			setTimeout(function() { //宏任务队列
				if (!$div.is(":focus")) {
					$div.hide();
				}
			}, 0);
		});
		$div.on("blur", function() { //失去焦点
			setTimeout(function() { //宏任务队列
				if (!$inputText.is(":focus")) {
					$div.hide();
				}
			}, 0);
		});

		var _this = this;
		this.onInput = _.debounce(function(event) {
			let $inputText = $("[id='" + _this.textId + "']", _this.context);
			let $div = $inputText.parent().find("div");
			$div.show();

			let fieldRelas = _this.formRun.fieldRelas;
			let fieldRela = {
				id: _this.id
			};
			let formData = {};
			for (let i = 0; i < fieldRelas.length; i++) {
				if (fieldRelas[i].id == _this.id) {
					let fieldRela = fieldRelas[i];
					for (let keyid in fieldRela.dependFieldMap) {
						let fieldConf = _this.formRun.cfgdataModel.fieldConfs[keyid];
						let resultObj = _this.formRun.getSingleSubmitData(fieldConf);
						formData[fieldConf.fieldName] = resultObj.value;
					}
				}
			}


			formData["_filter_norepeat_"] = $inputText.val();

			//if(fieldRela.initSqlkey!="")/*过滤控件必查库，且不一定有可见变量*/

			let url = _this.formRun.cfgdata.contextPath + "/beta/dataService/queryFieldSql";
			let datajson = {
				mainEntId: _this.fieldConf.ownEntId,
				ctrlPrefix: _this.ctrlPrefix,
				fieldRelaVo: fieldRela,
				formdata: formData
			};
			_FormGlobalFn.ajaxRequestJson(url, datajson, function(data) {
				if (data.result) {
					let fieldConf = _this.fieldConf;
					var html = '<span reflag="1" value="" text="请选择">请选择</span>'
					$.each(data.obj, function(i, d) {
						/*if(i>0) */
						html += "<br>";
						html += '<span reflag="1" value="' + d.value + '" text="' + d.name + '">' + d.name + '</span>'
					});
					$div.html(html);
					$div.find("span").off("click");
					$div.find("span").on("click", function() {
						_this.formRun.handler[_this.id].setData($(this).attr("value"), $(this).attr("text"), true);
						$div.closest('div').blur();
					});
				}
			});


		}, 500);

		$inputText.off("input click");
		//输入框事件
		$inputText.on("input click", this.onInput);

	}
	/**
	 * isManual是否手动点击回填
	 * isManual为空时为初始化赋值用到此方法，变量联动不触发此方法，通过输入过滤字符调用this.onInput进行赋显示值
	 */
	setData(value, name, isManual) {
		if (typeof name == 'undefined') {
			name = value;
		}
		if (isManual) {
			$("[id='" + this.textId + "']", this.context).val(name);
		} else if (this.formRun.cfgdataModel.opType == 'update') {
			let fieldRelas = this.formRun.fieldRelas;
			let formData = {};
			let fieldRela = {
				id: this.id
			};
			for (let i = 0; i < fieldRelas.length; i++) {
				if (fieldRelas[i].id == this.id) {
					fieldRela = fieldRelas[i];
					for (let keyid in fieldRela.dependFieldMap) {
						let fieldConf = this.formRun.cfgdataModel.fieldConfs[keyid];
						formData[fieldConf.fieldName] = this.formRun.data.columnsData[fieldConf.fieldName];
					}
					break;
				}
			}
			let url = this.formRun.cfgdata.contextPath + "/beta/dataService/filterText?value=" + value;
			let datajson = {
				mainEntId: this.fieldConf.ownEntId,
				ctrlPrefix: this.ctrlPrefix,
				fieldRelaVo: fieldRela,
				formdata: formData
			};
			_FormGlobalFn.ajaxRequestJson(url, datajson, (data) => {
				if (data.result) {
					$("[id='" + this.textId + "']", this.context).val(data.obj[0].name);
				}
			});

		}
		$("[id='" + this.id + "']", this.context).val(value);

		setTimeout(() => {
			//防止FormFilter对象没有初始化就触发验证
			$("[id='" + this.id + "']", this.context).trigger("change");
		}, 0);
	}
}
