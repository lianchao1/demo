import _FormGlobalFn from '_FormGlobalFn'
import FormTree from './form/tree'
/**
 * 树子应用
 * @returns
 */
export default class TreeRun {
	constructor() {
		this.$context = document;
		this.cfgdata = {};
		this.datas = []; //树的原始值
		this.datasKeyMap = {}; //树的原始值对应的主键值
		this.submitTempData = {};
		this.pform = null; // 上层应用（主应用）
		this.fun = {};
		this.id = "";
		this.handler = {};
	}

	init(subEntConf) {
		this.cfgdata = subEntConf;
		let fieldConf = {
			ownEntId: subEntConf.mainEntId,
			fieldName: "TREE_SUB_ENT",
			uuid: _FormGlobalFn.uuid(),
			extendObj: subEntConf.treeSubEntConf.treeConf,
			ctrlTypeId: "tree" //树-直接显示
		};
		fieldConf.extendObj.checked = '1'; //0:单选,1:多选,2:单勾选
		fieldConf.extendObj.allCheckFlag = false;

		this.id = _FormGlobalFn.eleId(fieldConf);
		$(this.$context).append('<div class="treeGroup"><input type="hidden" id="' + this.id + '" entid="' + this.cfgdata.mainEntId +
			'"/><ul class="ztree" id="' + this.id + '_ztree"></ul></div>');

		let subEntValue = "";
		if (this.pform && this.pform.data && this.pform.data.subTableDatas) { //判断是否是修改		
			for (let i = 0; i < this.pform.data.subTableDatas[this.cfgdata.mainEntId].length; i++) {
				let subTableData = this.pform.data.subTableDatas[this.cfgdata.mainEntId][i];
				let subJoinField4SubValue = subTableData.columnsData[this.cfgdata.treeSubEntConf.subEntTreeField];
				if (i != 0) {
					subEntValue += ",";
				}
				subEntValue += subJoinField4SubValue;
				this.datas.push(subJoinField4SubValue + ""); //树的原始值,转字符串
				this.datasKeyMap[subJoinField4SubValue + ""] = subTableData.keyValue || subTableData.columnsData[subTableData.keyName];
			}
		}
		//初始化值
		$("[id='" + this.id + "']", this.$context).val(subEntValue);
		// 初始化树
		this.handler = new FormTree(fieldConf, subEntValue, this.cfgdata.contextPath, this.$context);

	}

	/**
	 * 获取子应用提交数据
	 */
	getSubData(trGroupId) {
		//当前值
		let currentDatas = $("[id='" + this.id + "']", this.$context).val();
		currentDatas = currentDatas.split(",");

		let subTableDatas = [];
		let addSubEntTreeFieldValue = _.difference(currentDatas, this.datas);
		for (let i = 0; i < addSubEntTreeFieldValue.length; i++) {
			let addSubEntTreeFieldData = {
				columnsData: {
					"_INNER_CREATE_OR_UPDATE": 'create',
					"I_INNER_KEYVALUE": _FormGlobalFn.uuid() //前端不判断是否是自增，提供主键值uuid
				}
			}
			addSubEntTreeFieldData.columnsData[this.cfgdata.treeSubEntConf.subEntTreeField] = addSubEntTreeFieldValue[i];

			subTableDatas.push(addSubEntTreeFieldData);
		}

		let delSubData = [];
		let delSubEntTreeFieldValue = _.difference(this.datas, currentDatas);
		for (let i = 0; i < delSubEntTreeFieldValue.length; i++) {
			let delKey = this.datasKeyMap[delSubEntTreeFieldValue[i]];
			if (delKey) delSubData.push(delKey);
		}

		this.submitTempData = {
			entId: this.cfgdata.mainEntId, // 子应用应用id
			subTableDatas: subTableDatas, // 新增修改数据
			delSubData: delSubData, // 删除主键值数组
			//subTableKeys : this.cfgdataModel.keyName// 主键名称
		};
		return this.submitTempData;
	}

	/**
	 * 保存后初始子应用提交数据
	 */
	afterSubmitSubData(subTableDatas) {
		//this.datas=[]
		//this.datasKeyMap = {};//树的原始值对应的主键值

		this.submitTempData
		//当前值
		let currentDatas = $("[id='" + this.id + "']", this.$context).val();
		currentDatas = currentDatas.split(",");

		let delSubEntTreeFieldValue = _.difference(this.datas, currentDatas);
		for (let i = 0; i < delSubEntTreeFieldValue.length; i++) {
			this.datas.delete(this.datas.indexOf(delSubEntTreeFieldValue[i]));
			delete this.datasKeyMap[delSubEntTreeFieldValue[i]];
		}

		for (let i = 0; i < subTableDatas.length; i++) {
			this.datas.push(subTableDatas[i].columnsData[this.cfgdata.treeSubEntConf.subEntTreeField]);
			this.datasKeyMap[subTableDatas[i].columnsData[this.cfgdata.treeSubEntConf.subEntTreeField]] = subTableDatas[i].keyValue ||
				subTableDatas[i].columnsData['I_INNER_KEYVALUE'];
		}

	}
}
