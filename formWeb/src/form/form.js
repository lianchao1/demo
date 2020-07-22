//=================================对外接口 start=====================================//
/**
 * @namespace FormGlobalFn.api.form
 */

/**
 * 搜索数据
 * @typedef {Object} searchParamItem
 * @property {string} compareType - 比较符
 * @property {string} fieldDataTypeId - 字段类型
 * @property {string} fieldName - 字段
 * @property {string} value - 值
 */
/**
 * 表单数据
 * @typedef {Object} formData
 * @property {Object} columnsData - 表单数据
 * @property {Object} delSubData - 需删除的子应用
 * @property {string} entId - 主应用id
 * @property {string} keyName - 主键字段
 * @property {string} keyValue - 主键值
 * @property {string} opType - 操作类型
 * @property {searchParamItem[]} searchParamItems - 搜索数据
 * @property {Object} subEntIds - 子应用ids
 * @property {Object} subTableDatas - 需要操作的子应用数据
 * @property {Object} subTableKeys - 子应用主键字段
 */

/**
 * 
 * FormGlobalFn.api.form.getData 回调函数
 * @callback formGetDataCB
 * @param {boolean|formData} data - false/表单数据
 */
/**
 * 获取表单数据
 * @function
 * @param {formGetDataCB} callback - 获取表单数据回调函数
 * @param {FormRun} [dependentFormRun] - 表单实例
 * 
 */
FormGlobalFn.api.form.getData = function (callback, dependentFormRun) {
	let _formRun = dependentFormRun||formRun;
	_formRun.validate(function (result) {
		if (result) {
			let formSubmitData = _formRun.getSubmitData();
			if(_formRun.trGroupId){
				formSubmitData.columnsData["_INNER_TR_GROUP_ID"] = _formRun.trGroupId;//设置子应用唯一标识
				formSubmitData.columnsData["_INNER_CREATE_OR_UPDATE"] = _formRun.trGroupCreateOrUpdate;//设置子应用新增修改标识
			}
			if (typeof callback == "function") {
				callback(formSubmitData);
			}
		} else {
			if (typeof callback == "function") {
				callback(false);
			}
		}
    });
}
/**
 * 表单对外赋值接口(url  optype=create)<br/>
 * 调用该接口默认为修改操作
 * @function
 * @param {formData} data - 赋值数据
 * @param {FormRun} [dependentFormRun] - 表单实例
 * @returns {boolean} 操作结果
 */
FormGlobalFn.api.form.setData = function (data, dependentFormRun) {
	try {
		let _formRun = dependentFormRun||formRun;
		for (let handlerIndex in _formRun.cfgdataModel.handler) {
			//外部3方组件可能会替换原始html,绑定事件等不可逆操作，不做重新初始化
			let flag =
				_formRun.cfgdataModel.handler[handlerIndex] instanceof FormDate ||
				_formRun.cfgdataModel.handler[handlerIndex] instanceof UE.Editor;
			if (!flag) {
				_formRun.cfgdataModel.handler[handlerIndex] = null;
			}
		}

		let opType = _formRun.cfgdataModel.opType;
		_formRun.cfgdataModel.opType = "update";
		_formRun.data = data;
		_formRun.initFormValue();
		_formRun.cfgdataModel.opType = opType;
		return true;
	} catch (e) {
		return false;
	}
}
/**
 * @ignore
 * 表单对外清空接口
 */
FormGlobalFn.api.form.reset = function (data, dependentFormRun) {
	FormGlobalFn.api.form.setData(data, dependentFormRun||formRun);
};
/**
 * FormGlobalFn.api.form.submitForm 回调函数
 * @callback formSubmitFormCB
 * @param {boolean|formData} result - 结果
 * @param {number} showIndex - 窗口标识
 */
/**
 * 表单提交
 * @function
 * @param {number} [showIndex] - 窗口标识
 * @param {formSubmitFormCB} [callback] - 表单提交回调函数
 * @param {boolean} [refresh4SubmitFlag] - 提交后是否刷新列表标识
 * @param {FormRun} [dependentFormRun] - 表单实例
 * @param {string} [ctrlPrefix] - 区分是否是通过列表编辑保存的数据
 */
FormGlobalFn.api.form.submitForm=function(showIndex, callback, refresh4SubmitFlag, dependentFormRun, ctrlPrefix){
	let _formRun = dependentFormRun||formRun;
	let oleRefresh4SubmitFlag = FormGlobalConf.refresh4SubmitFlag;
	if(!(typeof refresh4SubmitFlag == 'undefined' || refresh4SubmitFlag === null)){
		FormGlobalConf.refresh4SubmitFlag = !!refresh4SubmitFlag;
	}
	_formRun.submitForm(showIndex, callback, ctrlPrefix);
}
//=================================对外接口 end=====================================//

//=================================子应用对外接口 start=====================================//
/**
 * 子应用新增一行或多行
 * @function
 * @param {formData|formData[]} subFormDatas - 子应用赋值数据,columnsData(数据),entId(子应用ID)
 * @param {string} subEntId - 子应用ID
 * @param {FormRun} [dependentFormRun] - 表单实例
 */
FormGlobalFn.api.form.subAddRows = function(subFormDatas, subEntId, dependentFormRun){
	let _formRun = dependentFormRun||formRun;
	
	let _subFormDatas = subFormDatas;
	if(!$.isArray(subFormDatas)){
		_subFormDatas = [subFormDatas];
	}
	
	for(let k=0; k<_subFormDatas.length; k++){
		let subFormData = _subFormDatas[k];
		if(!!subEntId){
			subFormData.entId = subEntId;
		}
		for(let i=0; i<_formRun.subListRuns.length; i++){
			if(_formRun.subListRuns[i].cfgdata.mainEntId === subFormData.entId){
				subFormData.opType = "create";
				_formRun.subListRuns[i].addRow(subFormData);
				break;
			}
		}
	}
}
//=================================子应用对外接口 end=====================================//

//=================================对外回调接口 start=====================================//
/**
 * @namespace FormGlobalFn.callback.form
 */
/**
* 保存前回调接口
* @function
* @param {formData} data - 表单数据
* @returns {boolean} true(提交)/false(不提交)
*/
FormGlobalFn.callback.form.beforeSubmit = undefined;
/**
* 保存后回调接口
* @function
* @param {boolean|formData} data - 结果
*/
FormGlobalFn.callback.form.afterSubmit = undefined;
//=================================对外回调接口 end=====================================//
//=================================旧对外接口 start=================================//
function doSubmit(callback){
	let _formRun = formRun;
	_formRun.submitForm2(callback);
}
if(typeof DcxRun == 'undefined' || !DcxRun)DcxRun={};

DcxRun.SubmitFormNotAlert2 = function(async,isSave){
	let _formRun = formRun;
	//工单系统是否保存
	DcxRun.isSave = isSave;
	let isret = false
	let asyncFlag = FormGlobalConf.asyncFlag;
	//改成同步
	FormGlobalConf.asyncFlag = async;
	_formRun.isShowMsg=false;
	FormGlobalFn.api.form.submitForm(undefined,function(data){
		isret = !!data;		
	});
	FormGlobalConf.asyncFlag = asyncFlag;
	var revo={"errorMsg":"","result":isret};
	if(isret){
		revo.errorMsg="提交成功！";
	}else{
		revo.errorMsg="提交失败";
	}
	return revo;
}
DcxRun.tempSave=function(callback){
    let _formRun = formRun;
	 _formRun.isShowMsg=false;
	_formRun.submitForm2(callback);
}
function existsFieldName(entId,fieldName){
   var revalue=$("[entid='"+entId+"'],[fieldname='"+fieldName.toUpperCase()+"']").length;
   return revalue>0;

}
function setFormValue(entId,fieldName,pval,objData){
	$("[id^='"+entId+"_"+fieldName.toUpperCase()+"']").val(pval);
}
function getFormValue(entId,fieldName,li){
	var value=$("[id^='"+entId+"_"+fieldName.toUpperCase()+"']").val();
	return value;
}