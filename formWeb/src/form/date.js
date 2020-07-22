//FormGlobalFn
export default class FormDate {
	constructor(fieldConf, data, context) {
		this.context = context || document;
		this.id = FormGlobalFn.eleId(fieldConf);
		this.handler = {};

		let type = fieldConf.ctrlTypeId;

		switch (type) {
			case 'date':
				this.handler = $("[id='" + this.id + "']", this.context).fdatepicker({
					language: 'zh-CN',
					format: 'yyyy-mm-dd'
				});
				break;
			case 'dateTime':
				this.handler = $("[id='" + this.id + "']", this.context).fdatepicker({
					language: 'zh-CN',
					format: 'yyyy-mm-dd hh:ii',
					minuteStep: 1,
					pickTime: true
				});
				break;
			case 'time':
				this.handler = $("[id='" + this.id + "']", this.context).fdatepicker({
					language: 'zh-CN',
					format: 'hh:ii',
					startView: 'day',
					minuteStep: 1,
					pickTime: true
				});
				break;
		}

		if (!!data) {
			if (typeof data == 'string' && data == 'now') {
				data = new Date();
			}
			this.setData(data);
		}
	}

	setDatan(data) {
		if (!data && data !== 0) {
			$("[id='" + this.id + "']", this.context).val(null);
			data = null;
		} else if (!isNaN(data)) {
			data = new Date(data);
		}

		$("[id='" + this.id + "']", this.context).fdatepicker("update", data);
	}
	getData() {
		return $("[id='" + this.id + "']", this.context).val();
	}
	getDate() {
		if (!!$("[id='" + this.id + "']", this.context).val()) {
			return this.handler.getDate();
		}
		return null;
	}
}
