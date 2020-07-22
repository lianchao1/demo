//FormGlobalData
//FormGlobalFn
export default class SubEntBatchApp {
	constructor($button, targetEntId, sourceEntId, formRun) {

		this.formRun = formRun;
		this.contextPath = formRun.cfgdata.contextPath;
		this.targetEntId = targetEntId;
		this.sourceEntId = sourceEntId;

		this.$button = $($button);
		this.$button.off("click");
		this.$button.click(() => {
			FormGlobalData.handler = this;
			this.openSelector();
		});
		setTimeout(() => {
			this.$button.click();
		}, 0);
	}
	openSelector = function(url, width, height) {
		if (!url) {
			url = this.contextPath + "/beta/list/#{entId}.html";
			url = url.format({
				entId: this.sourceEntId
			}, true);
		}
		FormGlobalFn.showWindow4Url(url, width, height, "应用选择", (index, layero) => {
			//获取勾选值
			let datas = FormGlobalFn.api.list.getData(undefined, layer.getChildFrame("body", index)[0].ownerDocument.defaultView
				.listRun);

			if (datas.length > 0) {
				this.setData(datas);
				FormGlobalFn.showClose(index);
			} else {
				FormGlobalFn.showAlert('请勾选记录！', 'w');
			}
		});
	}

	setData = function(datas) {
		let _datas = [];
		for (let i = 0; i < datas.length; i++) {
			_datas.push({
				columnsData: datas[i],
				entId: this.targetEntId
			});
		}
		FormGlobalFn.api.form.subAddRows(_datas, undefined, this.formRun)
	}
}
