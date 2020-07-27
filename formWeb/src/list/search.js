/**
 * @ignore
 * callback :初始化时，异步默认值需要全部回填完后才出发查询
 */
FormGlobalFn.search.inicfg = function (entId, formGlobalConf, callback) {
	let searchFormGlobalConf = formGlobalConf;
	searchFormGlobalConf.search.opType='create';
	/*{
		contextPath:formGlobalConf.contextPath,
		mainEntId:entId,
		form:{
			opType: 'create',
			ctrlPrefix: formGlobalConf.search.ctrlPrefix,
			mainFields: formGlobalConf.search.mainFields,
			fieldConfs: formGlobalConf.search.fieldConfs,
			handler: formGlobalConf.search.handler,
			subEntIds: [],
			keyName: "",
			fieldRelas: formGlobalConf.search.fieldRelas
		}
	}*/
	

	searchRun.setSearchCfgData(searchFormGlobalConf);
	searchRun.inicfg(entId);
    //初始化值不需要验证
    if (typeof callback == "function") {
    	let formSubmitData = searchRun.getSubmitData();
    	//变量全搞成异步的，参数只能手动补
    	for(let i=0;i<searchFormGlobalConf.search.mainFields.length;i++){
    		//补上url参数
    		if('6' == searchFormGlobalConf.search.fieldConfs[searchFormGlobalConf.search.mainFields[i]].valueType){
    			try{    				
    				let key = /\{\*(.+)\}/.exec(searchFormGlobalConf.search.fieldConfs[searchFormGlobalConf.search.mainFields[i]].defaultValue4Ctrl)[1];
    				let value = FormGlobalFn.getQueryString(key);
    				formSubmitData.columnsData[searchFormGlobalConf.search.fieldConfs[searchFormGlobalConf.search.mainFields[i]].fieldName] = value; 
    			

					let searchParamItem = {};
					formSubmitData.searchParamItems.push(searchParamItem);
					searchParamItem['fieldName'] = searchFormGlobalConf.search.fieldConfs[searchFormGlobalConf.search.mainFields[i]].fieldName;
					searchParamItem['value'] = value;
					searchParamItem['compareType'] = searchFormGlobalConf.search.fieldConfs[searchFormGlobalConf.search.mainFields[i]].compareOperator;
					searchParamItem['fieldDataTypeId'] = searchFormGlobalConf.search.fieldConfs[searchFormGlobalConf.search.mainFields[i]].fieldDataTypeId;
    			}catch(e){console.log(e)}
    		}
    	}
    	
    	
    	formSubmitData.entId = searchRun.cfgdata.mainEntId;
    	if(typeof FormGlobalFn.callback.search.init == "function"){
    		FormGlobalFn.callback.search.init(formSubmitData);
    	}
    	callback(formSubmitData);
    }
};
//=================================对外接口 start=====================================//
/**
 * @namespace FormGlobalFn.api.search
 */
/**
 * FormGlobalFn.api.search.getSearchData 回调函数
 * @callback formSubmitFormCB
 * @param {boolean|formData} result - 结果
 * @param {number} showIndex - 窗口标识
 */
/**
 * 获取搜索表单数据
 * @function
 * @param {formGetDataCB} callback - 获取搜索表单数据回调函数
 */
FormGlobalFn.api.search.getSearchData = function(callback) {
	searchRun.validate(function (result) {
      if (result) {
        let formSubmitData = searchRun.getSubmitData();
        formSubmitData.entId = searchRun.cfgdata.mainEntId;

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
 * 执行搜索
 * @function
 * @param {Object} treeData - 左边树条件
 */
FormGlobalFn.api.search.search = function(treeData) {
	FormGlobalFn.api.search.getSearchData(function(formSubmitData){
		if(!formSubmitData) return;
		
		//合并树与搜索栏条件，并设置到查询缓存，如果搜索栏中有树条件，要回填搜索栏
		listRun.searchCacheData = formSubmitData;
		if(treeData){
			listRun.searchCacheData.searchParamItems.delete(
					listRun.searchCacheData.searchParamItems.byAttr('fieldName', treeData['fieldName']));
			
			listRun.searchCacheData.searchParamItems.push(treeData);
		}
		
		//如果搜索栏中有树条件，要回填搜索栏
		if(treeData){			
			try {
				for (let handlerIndex in searchRun.cfgdataModel.handler) {
					//外部3方组件可能会替换原始html,绑定事件等不可逆操作，不做重新初始化
					let flag =
						searchRun.cfgdataModel.handler[handlerIndex] instanceof FormDate ||
						searchRun.cfgdataModel.handler[handlerIndex] instanceof UE.Editor;
					if (!flag) {
						searchRun.cfgdataModel.handler[handlerIndex] = null;
					}
				}
				
				searchRun.cfgdataModel.opType = "update";
				
				let data = {};
				data[treeData['fieldName']] =	treeData['value'];				
				searchRun.data = {columnsData:data};
				//搜索栏表单不需要重复初始化
				searchRun.initFormDynamicValueFlag = false;
				searchRun.initFormValue();
				searchRun.initFormDynamicValueFlag = true;
			} catch (e) {
				console.error(e);
			}
		}
		

		//搜索前执行
		if (typeof FormGlobalFn.callback.search.beforeSubmit == "function") {
			let execFlag = FormGlobalFn.callback.search.beforeSubmit(listRun.searchCacheData);
			if(!execFlag) return;
		}
		
		FormGlobalFn.api.list.search();
		
		//app查询时掩藏搜索框
		if(listRun.cfgdata.isMobileTemp){
			$('.filter-container').removeClass('active');
		}
	});
}
/**
 * 重置搜索框
 * @function
 */
FormGlobalFn.api.search.reset = function() {
	try {
		for (let handlerIndex in searchRun.cfgdataModel.handler) {
			//外部3方组件可能会替换原始html,绑定事件等不可逆操作，不做重新初始化
			let flag =
				searchRun.cfgdataModel.handler[handlerIndex] instanceof FormDate ||
				searchRun.cfgdataModel.handler[handlerIndex] instanceof UE.Editor;
			if (!flag) {
				searchRun.cfgdataModel.handler[handlerIndex] = null;
			}
		}

		//let opType = searchRun.cfgdataModel.opType;
		searchRun.cfgdataModel.opType = "update";
		searchRun.data = FormGlobalData.searchInitData;
		searchRun.initFormValue();
		//searchRun.cfgdataModel.opType = opType;
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
}
//=================================对外接口 end=====================================//
//=================================对外回调接口 start=====================================//
/**
 * @namespace FormGlobalFn.callback.search
 */
/**
* 搜索初始化查询前
* @function
* @param {formData} data - 表单数据
*/
FormGlobalFn.callback.search.init = undefined;
/**
* 搜索前回调接口
* @function
* @param {formData} data - 表单数据
* @returns {boolean} true(查询)/false(不查询)
*/
FormGlobalFn.callback.search.beforeSubmit = undefined;
/**
* 搜索后回调接口
* @function
* @param {page} page - 分页对象
*/
FormGlobalFn.callback.search.afterSubmit = undefined;
//=================================对外回调接口 end=====================================//