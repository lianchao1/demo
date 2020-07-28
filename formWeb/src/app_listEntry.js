import $script from 'scriptjs'
import cssLoad from 'cssLoad'

import '../css/common.css';

import ListRun from 'app_listRun'
import FormRun from 'formRun'

// const entIdRegExp = /\/(?<entId>[^\/]*)\.html/;
// let outEntId = entIdRegExp.exec(window.location.href).groups.entId;
let outEntId = FormGlobalFn.getQueryString('entId');

async function asyncInit() {
	let _HtmlConfUrl = `/formWeb/beta/transformation/app/list/${outEntId}`;

	let HtmlConf = await fetch(_HtmlConfUrl, {
		method: 'GET'
	}).then((response) => response.json()).catch(er => console.log(er));

	let {
		searchHtml,
		searchFlag,
		listEditFlag,
		entid: entId,
		listHtml,
		appFlag,
		title,
		styleCode,
		uuid
	} = HtmlConf;
	$(document).attr("title", title);
	$('#listHtml').html(listHtml)

	cssLoad([`/formWeb/newForm${styleCode}/css/common.css`, `/formWeb/newForm${styleCode}/css/form.css`,
		`/formWeb/newForm${styleCode}/css/table.css`, `/formWeb/newForm${styleCode}/css/theme/skin.css`,
		`/formWeb/newForm${styleCode}/css/iconfont/iconfont.css`,
		`/formWeb/resources/css/branch/formdesign/default/components/zTreeStyle/zTreeStyle.css`/*ztree样式，被改过的狗带*/
	]);

	let jsUrls = [`/formWeb/beta/formrun/${entId}/entCfg.js?ctrlPrefix=app_ListR_`, `/formWeb/jsCustom/${entId}/app_ListR_/file.js`];
	$script(jsUrls, function(HtmlConf) {

		FormGlobalConf.formGlobalConf  = FormGlobalConf2
		FormGlobalConf2 = null 
		
		{
			FormGlobalConf.isMobileTemp = appFlag

			if (searchFlag) {
				$("#searchFlag").removeClass("hide")
				$('#searchHtml').html(searchHtml);
				window.searchRun = new FormRun();
				FormGlobalFn.search.inicfg(entId, FormGlobalConf.formGlobalConf, function(data) {
					FormGlobalData.searchInitData = data;
				});
			} else {
				FormGlobalData.searchInitData = {
					entId: entId
				}
			}
			window.listRun = new ListRun();
			listRun.setCfgData(FormGlobalConf.formGlobalConf);
			listRun.searchFlag = searchFlag;
			listRun.searchCacheData = FormGlobalData.searchInitData; //初始查询条件
			listRun.initevent();
			listRun.initBtn();
		}


	})
}
asyncInit();
