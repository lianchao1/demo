import _FormGlobalFn from '_FormGlobalFn'

export default class FormFile {
	constructor(fieldConf, datas, contextPath, formRun) {

		let ownEntId = fieldConf.ownEntId;
		let fieldName = fieldConf.fieldName;
		let type = fieldConf.ctrlTypeId
		this.context = formRun.$context;
		this.formRun = formRun;
		switch (type) {
			case "singleImgImport":
			case "singleImgShow":
			case "multiImgImport":
				this.type = "img";
				break;
			case "singleFileImport":
			case "singleFileShow":
			case "multiFileImport":
				this.type = "file";
				break;
			default:
				this.type = "file";
		}
		this.isSingle = type.toLowerCase().indexOf("single") >= 0;
		this.isShow = type.toLowerCase().indexOf("show") >= 0;
		this.ownEntId = ownEntId;
		this.fieldName = fieldName;
		this.id = _FormGlobalFn.eleId(fieldConf);
		this.datas = [];
		this.contextPath = contextPath;

		if (this.isShow) {
			$("[id='" + this.id + "_text']", this.context).addClass("files-container-readonly");
		} else {
			$("[id='" + this.id + "_text']", this.context).removeClass("files-container-readonly");
		}

		// 显示初始化
		this.setData(datas);
	}
	remove(index) {
		this.datas.splice(index, 1);
		$("[id='" + this.id + "_text']", this.context).find("div.file-container:eq(" + index + ")")
			.remove();
	}
	add(datas) {
		for (var i = 0; i < datas.length; i++) {
			var data = datas[i];
			this.addOne(data);
		}
	}
	prev(i) {
		if (i === 0) return;
		let $currObj = $("[id='" + this.id + "_text'] .file-container:eq(" + i + ")", this.context);
		$currObj.prev().before($currObj);

		this.datas.swap(i, i - 1);
	}
	addOne(data) {
		if (this.isSingle) {
			this.removeAll();
		}
		this.datas.push(data);
		var path = data.path.replace(/\+/g, "%2B").replace(/\s/g, "%20");
		path = this.contextPath + "/beta/dataService/download" + path;
		if (this.type === "file") {
			$("[id='" + this.id + "_text'] .file-group", this.context)
				.append(
					'<div class="file-container"><a target="_blank" href="' +
					path +
					'">' +
					data.name +
					"</a>" +
					'<i class="iconfont" reflag="1">&#xe6b8;</i></div>');
		} else if (this.type === "img") {
			$("[id='" + this.id + "_text'] .file-group", this.context)
				.append(
					'<div class="file-container img-container"><a target="_blank" href="' +
					path +
					'"><div><img src="' +
					path +
					'"></img></div></a>' +
					'<i class="iconfont up" reflag="1">&#xe620;</i>' +
					'<i class="iconfont" reflag="1">&#xe6fe;</i></div>');
		}
		let _this = this;
		$("[id='" + this.id + "_text'] .file-group", this.context).find("[reflag=1]").click(function() {
			let isPrevFlag = $(this).hasClass("up");
			let id = _this.id;
			let self = $(this).closest("div.file-container");
			self.parent().find("div.file-container").each(function(i, d) {
				if (self.get(0) == $(this).get(0)) {
					if (!!_this.formRun.handler[id]) {
						if (isPrevFlag) {
							_this.formRun.handler[id].prev(i);
						} else {
							_this.formRun.handler[id].remove(i);
						}
					}
				}
			});
		});
		$("[id='" + this.id + "_text'] .file-group", this.context).find("[reflag=1]").attr("reflag", 2);
	}
	removeAll() {
		this.datas.splice(0, this.datas.length);
		$("[id='" + this.id + "_text']", this.context).find("div.file-container").remove();
	}
	getData() {
		return JSON.stringify(this.datas);
	}
	/**
	 * 覆盖已有的数据
	 */
	setData(datas) {
		this.removeAll();
		if (datas.length > 0) {
			for (var i = 0; i < datas.length; i++) {
				var data = datas[i];
				this.addOne(data);
			}
		}
	}
}
