import _FormGlobalData from '_FormGlobalData'
import _FormGlobalFn from '_FormGlobalFn'

export default class FormMap {
	constructor(fieldConf, contextPath, context) {

		this.contextPath = contextPath;
		this.context = context || document;
		this.fieldConf = fieldConf;
		this.id = _FormGlobalFn.eleId(fieldConf);

		//是否双字段
		this.twoFieldFlag = false;
		//还没设计，有需要在做
		if (false) {
			this.twoFieldFlag = true;
			this.latId = "";
			this.lngId = "";
		}

		this.contextPath = contextPath;

		this.$id = $("[id='" + this.id + "']", this.context);
		this.$button = this.$id.parent().find("button");
		this.$button.off("click");
		let _this = this;
		this.$button.click(function(){
			_FormGlobalData.handler = _this;
			_this.openSelector();
		});
	}
	openSelector() {
		let lng = null, lat = null;
		if (this.twoFieldFlag) {
			lng = $("[id='" + this.lngId + "']", this.context).val();
			lat = $("[id='" + this.latId + "']", this.context).val();
		} else {
			let lnglat = this.$id.val();
			let lnglatArray = lnglat.split(",");
			lng = lnglatArray[0];
			lat = lnglatArray[1];
		}

		let iWidth = 600; //弹出窗口的宽度;
		let iHeight = 500; //弹出窗口的高度;
		//获得窗口的垂直位置
		let iTop = (window.screen.availHeight - 30 - iHeight) / 2;
		//获得窗口的水平位置
		let iLeft = (window.screen.availWidth - 10 - iWidth) / 2;

		window.open(this.contextPath + "/beta/formrun/mapSelector.html?id=" + this.id +
			"&lat=" + (lat || '') + "&lng=" + (lng || ''),
			'_blank',
			'width=' + iWidth + ',height=' + iHeight + ',top=' + iTop + ',left=' + iLeft +
			',menubar=no,resizable=no,toolbar=no,location=no,scrollbars=no,status=no');
	}
	//用于openSelector后回填数据到输入框
	setData(data) {
		_FormGlobalData.handler = null;

		if (!!data) {
			let lng = null,lat = null;
			lng = data.lng;
			lat = data.lat;
			if (this.twoFieldFlag) {
				$("[id='" + this.lngId + "']", this.context).val(lng);
				$("[id='" + this.latId + "']", this.context).val(lat);

				setTimeout(function() {
					//防止FormTree对象没有初始化就触发验证
					$("[id='" + this.lngId + "']", this.context).trigger("change");
					$("[id='" + this.latId + "']", this.context).trigger("change");
				}, 0);
			} else {
				this.$id.val(lng + "," + lat);
				setTimeout(() =>{
					//防止FormTree对象没有初始化就触发验证
					this.$id.trigger("change");
				}, 0);
			}
		}
	}
	////直接通过jquery获取输入框值
	//FormMap.prototype.getData = function(){}
}
