//FormGlobalFn
export default class FormLeft2Right {
	constructor(fieldConf, data, formRun) {

		let ownEntId = fieldConf.ownEntId;
		let fieldName = fieldConf.fieldName;
		let width = fieldConf.ctrlWidth || '350px';
		let height = fieldConf.ctrlHeight || '200px';
		this.context = formRun.$context;
		this.formRun = formRun;
		this.id = FormGlobalFn.eleId(fieldConf);
		this.leftId = "left_" + this.id;

		this.btnWidth = 50;
		this.ctrlWidth = "";
		this.ctrlHeight = "";
		try {
			if (width.endsWith("px")) {
				this.ctrlWidth = Math.floor((width.replace("px", "") - this.btnWidth - 80) / 2) + "px";
				this.btnWidth += "px";
			} else {
				this.btnWidth = "8%";
				this.ctrlWidth = "45%";
			}
		} catch (e) {}

		try {
			if (height.endsWith("px")) {
				this.ctrlHeight = (height.replace("px", "") - 20) + "px";
			} else {
				this.ctrlHeight = "98%";
			}
		} catch (e) {}


		this.$id = $("[id='" + this.id + "']", this.context);
		this.context = this.$id.closest("span.sp-ctrl");
		this.$leftId = $("[id='" + this.leftId + "']", this.context);
		this.$add = $("[id='add']", this.context);
		this.$remove = $("[id='remove']", this.context);
		this.$add_all = $("[id='add_all']", this.context);
		this.$remove_all = $("[id='remove_all']", this.context);

		this.$id.css({
			"width": this.ctrlWidth,
			"height": this.ctrlHeight
		});
		this.$leftId.css({
			"width": this.ctrlWidth,
			"height": this.ctrlHeight
		});
		this.$add.css({
			"width": this.btnWidth
		});
		this.$remove.css({
			"width": this.btnWidth
		});
		this.$add_all.css({
			"width": this.btnWidth
		});
		this.$remove_all.css({
			"width": this.btnWidth
		});

		var _this = this;

		this.$id.off("dblclick");
		this.$leftId.off("dblclick");
		this.$add.off("click");
		this.$remove.off("click");
		this.$add_all.off("click");
		this.$remove_all.off("click");

		//移到右边
		this.$add.click(function() {
			//获取选中的选项，删除并追加给对方
			$('option:selected', _this.$leftId).appendTo(_this.$id);
		});
		//移到左边
		this.$remove.click(function() {
			$('option:selected', _this.$id).appendTo(_this.$leftId);
		});
		//全部移到右边
		this.$add_all.click(function() {
			//获取全部的选项,删除并追加给对方
			$('option', _this.$leftId).appendTo(_this.$id);
		});
		//全部移到左边
		this.$remove_all.click(function() {
			$('option', _this.$id).appendTo(_this.$leftId);
		});
		//双击选项
		this.$leftId.on("dblclick", function() { //绑定双击事件
			//获取全部的选项,删除并追加给对方
			$("option:selected", this).appendTo(_this.$id); //追加给对方
		});
		//双击选项
		this.$id.on("dblclick", function() {
			$("option:selected", this).appendTo(_this.$leftId);
		});

		this.setData(data);
	}
	setData(values, html) {
		if (html) {
			this.$leftId.html(html);
		}
		values = values || '';
		var datas = values.split(",");
		//清空
		this.$id.html("");
		var selectFlag = false;
		$.each(datas, function(i, d) {
			$('option', this.$leftId).each(function() {
				if ($(this).val() == d) {
					$(this).prop("selected", true);
					selectFlag = true;
				}
			});
		});
		if (selectFlag) {
			this.$add.click();
		}
	}
	getData() {
		var values = "";
		$('option', this.$id).each(function(i, d) {
			if (i != 0) values += ",";
			values += $(this).val();
		});
		return values;
	}
}
