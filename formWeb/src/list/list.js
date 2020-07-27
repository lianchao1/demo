//=================================对外接口 start=====================================//
/**
 * @namespace FormGlobalFn.api.list
 */
/**
 * 列表数据
 * @typedef {Object} listData
 * @property {string} I_INNER_KEYVALUE - 主键值
 */
/**
 * 分页对象
 * @typedef {Object} page
 * @property {number} pageNum - 第几页
 * @property {number} pageSize - 页记录数
 * @property {number} total - 总记录数
 * @property {listData[]} list - 列表数据
 */
/**
 * 列表刷新
 * @function
 * @param {ListRun} [dependentFormRun] - 列表实例
 */
FormGlobalFn.api.list.refresh = function(dependentFormRun){
	let _listRun = dependentFormRun||listRun;
	_listRun.refresh();
}
/**
 * 列表查询
 * @function
 * @param {ListRun} [dependentFormRun] - 列表实例
 */
FormGlobalFn.api.list.search = function(dependentFormRun){
	let _listRun = dependentFormRun||listRun;
	_listRun.setCurrent(1);
}
/**
 * 获取列表数据
 * @function
 * @param {string|number} [keyValue] - (主应用)主键值/(子应用)列表下标,不传为勾选值
 * @param {ListRun} [dependentFormRun] - 列表实例
 * @returns {listData} 数据
 */
FormGlobalFn.api.list.getData = function(keyValue, dependentFormRun){
	let _listRun = dependentFormRun||listRun;
	return _listRun.getData(keyValue);
}
/**
 * 获取列表所有原始数据
 * @function
 * @param {ListRun} [dependentFormRun] - 列表实例
 * @returns {listData[]} 数据
 */
FormGlobalFn.api.list.getDatas=function(dependentFormRun){
	let _listRun = dependentFormRun||listRun;
	return _listRun.datas;
}
/**
 * 保存一行可编辑列表数据
 * @function
 * @param {number} [rowIndex] - 行标识(0开始)
 * @param {formSubmitFormCB} [callback] - 表单提交回调函数
 * @param {boolean} [refresh4SubmitFlag] - 提交后是否刷新列表标识
 * @param {ListRun} [dependentFormRun] - 列表实例
 */
FormGlobalFn.api.list.submitRowDatas=function(rowIndex, callback, refresh4SubmitFlag, dependentFormRun){
	let _listRun = dependentFormRun||listRun;
	FormGlobalFn.api.form.submitForm(undefined, callback, refresh4SubmitFlag, _listRun.rowsForm[rowIndex], "ListR_");
}
/**
 * 保存所有行可编辑列表数据
 * @function
 * @param {formSubmitFormCB} [callback] - 表单提交回调函数
 * @param {boolean} [refresh4SubmitFlag] - 提交后是否刷新列表标识
 * @param {ListRun} [dependentFormRun] - 列表实例
 */
FormGlobalFn.api.list.submitAllDatas=function(callback, refresh4SubmitFlag, dependentFormRun){
	let _listRun = dependentFormRun||listRun;
	let datas = FormGlobalFn.api.list.getDatas(dependentFormRun);
	for(let rowIndex=0; rowIndex<datas.length; rowIndex++){
		FormGlobalFn.api.form.submitForm(undefined, callback, refresh4SubmitFlag, _listRun.rowsForm[rowIndex], "ListR_");
	}
}
/**
 * @ignore
 * 表单对外提供接口
 * 添加一行
 */
FormGlobalFn.api.list.addRow=function(data, callback, dependentFormRun){
	let _listRun = dependentFormRun||listRun;
	_listRun.addRow(data);
	if(typeof callback == 'function'){
		callback(object);
	}
}
/**
 * @ignore
 * 表单对外提供接口
 * 修改一行
 */
FormGlobalFn.api.list.updateRow=function(index, data, callback, dependentFormRun){
	let _listRun = dependentFormRun||listRun;
	_listRun.updateRow(index, data);
	if(typeof callback == 'function'){
		callback(object);
	}
}
/**
 * 导出配置字段
 * @function
 * @param {ListRun} [dependentFormRun] - 列表实例
 * 
 */
FormGlobalFn.api.list.export=function(dependentFormRun){
	let _listRun = dependentFormRun||listRun;
	let searchParam = base64.encodeUrl(JSON.stringify(listRun.searchCacheData));
	window.open(_listRun.cfgdata.contextPath + '/beta/data4ExcelService/export/false?searchParam='+searchParam);
}
/**
 * 导出所有字段
 * @function
 * @param {ListRun} [dependentFormRun] - 列表实例
 */
FormGlobalFn.api.list.exportAll=function(dependentFormRun){
	let _listRun = dependentFormRun||listRun;
	let searchParam = base64.encodeUrl(JSON.stringify(listRun.searchCacheData));
	window.open(_listRun.cfgdata.contextPath + '/beta/data4ExcelService/export/true?searchParam='+searchParam);
}
/**
 * 导出模板
 * @function
 * @param {ListRun} [dependentFormRun] - 列表实例
 */
FormGlobalFn.api.list.exportTempl=function(dependentFormRun){
	let _listRun = dependentFormRun||listRun;
	let url = _listRun.cfgdata.contextPath + '/beta/data4ExcelService/exportTempl/#{entId}';
	url = url.format({entId:_listRun.cfgdata.mainEntId});
	window.open(url);
}
/**
 * 弹出导入数据页面
 * @function
 * @param {ListRun} [dependentFormRun] - 列表实例
 */
FormGlobalFn.api.list.openImport=function(){
	FormGlobalFn.showWindow4Content($('#excelImportDiv'), '400px', '250px', '导入数据');
}
/**
 * 导入数据
 * @function
 * @param {ListRun} [dependentFormRun] - 列表实例
 */
FormGlobalFn.api.list.importExcel=function(dependentFormRun){
	let _listRun = dependentFormRun||listRun;
	let fd = new FormData();
	let file = $("#excelImport")[0].files[0];
	fd.append("files", file);

	let url = _listRun.cfgdata.contextPath + "/beta/data4ExcelService/import/#{entId}";
	url = url.format({entId:_listRun.cfgdata.mainEntId});
	$.ajax({
		method: "POST",
		url: url,
		// 告诉jQuery不要去处理发送的数据，用于对data参数进行序列化处理 这里必须false
		processData: false,
		async: _listRun.cfgdata.asyncFlag,
		// 告诉jQuery不要去设置Content-Type请求头
		contentType: false, //必须
		data: fd,
		success: function (ret) {
			if (ret.result) {
				FormGlobalFn.showAlert("上传excel成功！");
			} else {
				window.open(_listRun.cfgdata.contextPath + "/beta/dataService/download/"+ret.obj);
				FormGlobalFn.showAlert("上传excel失败,请查看异常导出信息！");
			}
		},
		error: function (responseStr) {
			console.log("上传excel error！");
		}
	});
}