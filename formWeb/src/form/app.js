import _FormGlobalData from '_FormGlobalData'
import _FormGlobalFn from '_FormGlobalFn'

export default class FormApp {
	constructor(fieldConf, contextPath, formRun) {
		this.context = formRun.$context;
		this.formRun = formRun;
		this.contextPath = contextPath;
		this.fieldConf = fieldConf;
		this.selectorConf = fieldConf.selectorConf;
		this.id = _FormGlobalFn.eleId(fieldConf);

		this.$id = $("[id='" + this.id + "']", this.context);
		this.$button = this.$id.parent().find("button");
		this.$button.off("click");
		this.$button.click(() => {
			_FormGlobalData.handler = this;
			this.openSelector(this.selectorConf.url, this.selectorConf.width, this.selectorConf.height);
		});
	}

	openSelector(url, width, height) {
		if (!url) {
			url = this.contextPath + "/beta/list/#{entId}.html";
			url = url.format({
				entId: this.selectorConf.sourceEnt
			}, true);
		}
		_FormGlobalFn.showWindow4Url(url, width, height, "应用选择", (index, layero) => {
			//获取勾选值
			let data = _FormGlobalFn.api.list.getData(undefined, layer.getChildFrame("body", index)[0].ownerDocument.defaultView
				.listRun);

			if (data.length > 0) {
				this.setData(data);
				_FormGlobalFn.showClose(index);
			} else {
				_FormGlobalFn.showAlert('请勾选一条记录！', 'w');
			}
		});
	}

	setData(data) {
		let sourceFields = this.selectorConf.sourceField.split(",");
		let targetFields = this.selectorConf.targetField.split(",");

		for (let i = 0; i < sourceFields.length; i++) {
			let fieldConf = _FormGlobalFn.getFieldConfByEntIdAndFieldName(this.selectorConf.targetEnt, targetFields[i], this.formRun
				.cfgdataModel.fieldConfs);
			if (fieldConf) {
				this.formRun.initSingleFormValue(fieldConf, data[0][sourceFields[i]]);
			}
		}
	}
}