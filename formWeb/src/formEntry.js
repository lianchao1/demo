import $script from 'scriptjs'
import cssLoad from 'cssLoad'
import _FormGlobalData from '_FormGlobalData'
import _FormGlobalFn from '_FormGlobalFn'
import _EntFormGlobalConf from '_EntFormGlobalConf'

import '../css/common.css';

import FormRun from 'formRun'

const entIdRegExp = /\/(?<entId>[^\/]*)\.html/;
//let entId = entIdRegExp.exec(window.location.href).groups.entId;
let outEntId = 'entid_TEST_INFO_ZBUYAODONG';
let optype = _FormGlobalFn.getQueryString('optype');

async function asyncPrint() {
	let _HtmlConfUrl = `/formWeb/beta/transformation/form/${outEntId}?optype=${optype}`;

	let HtmlConf = await fetch(_HtmlConfUrl, {
		method: 'GET'
	}).then((response) => response.json()).catch(er => console.log(er));

	let {
		viewFlag,
		ajaxFormHtml,
		entid: entId,
		hasSubEntFlag,
		appPrefix,
		appFlag,
		title,
		styleCode,
		uuid
	} = HtmlConf;
	$(document).attr("title", title);
	$('div.ajaxForm_main.main').html(ajaxFormHtml)

	cssLoad([`/formWeb/newForm${styleCode}/css/common.css`, `/formWeb/newForm${styleCode}/css/form.css`,
		`/formWeb/newForm${styleCode}/css/table.css`, `/formWeb/newForm${styleCode}/css/theme/skin.css`,
		`/formWeb/newForm${styleCode}/css/iconfont/iconfont.css`,
		`/formWeb/resources/css/branch/formdesign/default/components/zTreeStyle/zTreeStyle.css`/*ztree样式，被改过的狗带*/
	]);
	if (viewFlag) import('../css/view')

	let _EntFormGlobalConfUrl = `/formWeb/beta/formrun/${entId}/entCfg.js?ctrlPrefix=${appPrefix}AjaxF_`
	let _FileExtUrl = `/formWeb/jsCustom/${entId}/${appPrefix}AjaxF_/file.js`
	$script([_EntFormGlobalConfUrl, _FileExtUrl], function(HtmlConf) {

		_EntFormGlobalConf.FormGlobalConf2 = FormGlobalConf2
		FormGlobalConf2 = null 
		
		{

			FormGlobalConf.isMobileTemp = appFlag

			//修改页面数据是否加载完毕标识（包括子应用数据）
			var editDataHasInitFlag = false;
			window.formRun = new FormRun();
			formRun.setCfgData(_EntFormGlobalConf.FormGlobalConf2);
			formRun.inicfg(entId);
			formRun.initBtn();
			//======================afterEditDataHasInitFn子应用初始化 start======================//


			// function refreshHeight() {
			// 	var iframeobj = FormGlobalFn.getIframeByWindow(window);
			// 	FormGlobalFn.autoIframe(iframeobj);
			// 	setTimeout(refreshHeight, 1000);
			// }
			// setTimeout(refreshHeight, 1000);
		}


	})
}
asyncPrint();
