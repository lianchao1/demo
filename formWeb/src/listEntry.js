import $script from 'scriptjs'
import cssLoad from 'cssLoad'
import _FormGlobalData from '_FormGlobalData'
import _FormGlobalFn from '_FormGlobalFn'
import _FormGlobalConf from '_FormGlobalConf'
import _EntFormGlobalConf from '_EntFormGlobalConf'

import '../css/common.css';

import ListRun from 'listRun'
import FormRun from 'formRun'

const entIdRegExp = /\/(?<entId>[^\/]*)\.html/;
let outEntId = entIdRegExp.exec(window.location.href).groups.entId;
outEntId = 'entid_TEST_INFO_ZBUYAODONG';

async function asyncInit() {
	let _HtmlConfUrl = `/formWeb/beta/transformation/list/${outEntId}`;

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
	$('div.row-table').html(listHtml)

	cssLoad([`/formWeb/newForm${styleCode}/css/common.css`, `/formWeb/newForm${styleCode}/css/form.css`,
		`/formWeb/newForm${styleCode}/css/table.css`, `/formWeb/newForm${styleCode}/css/theme/skin.css`,
		`/formWeb/newForm${styleCode}/css/iconfont/iconfont.css`,
		`/formWeb/resources/css/branch/formdesign/default/components/zTreeStyle/zTreeStyle.css`/*ztree样式，被改过的狗带*/
	]);

	let jsUrls = [`/formWeb/beta/formrun/${entId}/entCfg.js?ctrlPrefix=ListR_`, `/formWeb/jsCustom/${entId}/ListR_/file.js`];
	if(searchFlag) jsUrls.push(`./search.js`);
	$script(jsUrls, function(HtmlConf) {

		_EntFormGlobalConf.FormGlobalConf2 = FormGlobalConf2
		FormGlobalConf2 = null 
		
		{
			_FormGlobalConf.isMobileTemp = appFlag

			if (searchFlag) {
				$('div.row-search').html(searchHtml);
				window.searchRun = new FormRun();
				_FormGlobalFn.search.inicfg(entId, _EntFormGlobalConf.FormGlobalConf2, function(data) {
					_FormGlobalData.searchInitData = data;
				});
			} else {
				_FormGlobalData.searchInitData = {
					entId: entId
				}
			}
			window.listRun = new ListRun();
			listRun.setCfgData(_EntFormGlobalConf.FormGlobalConf2);
			listRun.searchFlag = searchFlag;
			listRun.searchCacheData = _FormGlobalData.searchInitData; //初始查询条件
			listRun.initevent();
			listRun.initBtn();
		}


	})
}
asyncInit();
