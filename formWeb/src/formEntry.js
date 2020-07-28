import $script from 'scriptjs'
import cssLoad from 'cssLoad'
import _FormGlobalData from '_FormGlobalData'
import _FormGlobalFn from '_FormGlobalFn'
import _FormGlobalConf from '_FormGlobalConf'
import _EntFormGlobalConf from '_EntFormGlobalConf'

import '../css/common.css';

import FormRun from 'formRun'
import ListRun from 'listRun'
import TreeRun from 'treeRun'

// const entIdRegExp = /\/(?<entId>[^\/]*)\.html/;
// let outEntId = entIdRegExp.exec(window.location.href).groups.entId;
let outEntId = _FormGlobalFn.getQueryString('entId');
let optype = _FormGlobalFn.getQueryString('optype');
let isOutMobileTemp = _FormGlobalFn.getQueryString('isOutMobileTemp');
let viewType = _FormGlobalFn.getQueryString('viewType')
let type = 'form'
if (viewType === 'true') {
	type = 'view'
}
async function asyncInit() {
	let _HtmlConfUrl =
		`/formWeb/beta/transformation/${type}/${outEntId}?optype=${optype}&isOutMobileTemp=${isOutMobileTemp}`;

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
		`/formWeb/resources/css/branch/formdesign/default/components/zTreeStyle/zTreeStyle.css` /*ztree样式，被改过的狗带*/
	]);
	if (viewFlag) import('../css/view')

	let _EntFormGlobalConfUrl = `/formWeb/beta/formrun/${entId}/entCfg.js?ctrlPrefix=${appPrefix}AjaxF_`
	let _FileExtUrl = `/formWeb/jsCustom/${entId}/${appPrefix}AjaxF_/file.js`
	$script([_EntFormGlobalConfUrl, _FileExtUrl], function(HtmlConf) {

		_EntFormGlobalConf.FormGlobalConf2 = FormGlobalConf2
		FormGlobalConf2 = null

		{

			_FormGlobalConf.isMobileTemp = appFlag

			//修改页面数据是否加载完毕标识（包括子应用数据）
			_FormGlobalData.editDataHasInitFlag = false;
			window.formRun = new FormRun();
			formRun.setCfgData(_EntFormGlobalConf.FormGlobalConf2);
			formRun.inicfg(entId);
			formRun.initBtn();

			//======================afterEditDataHasInitFn子应用初始化 start======================//

			let initSubEntFn = function() {
				let viewType = _FormGlobalFn.getQueryString("viewType");
				$("[ctrltypeid='table'],[ctrltypeid='subEntListR']").each(function() {
					let _this = this;
					let subEntid = $(_this).attr("entid");
					let subEntConf = _EntFormGlobalConf.FormGlobalConf2.subEntConfs[subEntid];
					let localFormRun = formRun; //局部变量
					/**
					 * 子应用类型
					 * 1：列表
					 * 2：树
					 * 3：树详情
					 */
					if (subEntConf.subEntType == '1') { //用不到通过主应用获取的子应用数据		
						let url = _EntFormGlobalConf.FormGlobalConf2.contextPath + "/beta/list/" + $(this).attr("entid") + ".html?vurl=sub_list";
						$(_this).load(url, function() {
							let listRun = new ListRun(); //不要污染主应用列表
							localFormRun.subListRuns.push(listRun); //主要用于获取子应用数据，会有循环引用问题
							listRun.pform = localFormRun; //会有循环引用问题
							listRun.isOutMobileTemp = _FormGlobalConf.isMobileTemp; //由主应用传入，判断外层是否为app
							listRun.$context = _this;
							listRun.setCfgData(subEntConf);
							listRun.searchFlag = false;
							listRun.initevent();
							listRun.initBtn();
						});
					}
				});

				$("[ctrltypeid='subEntTree']").each(function() {
					let _this = this;
					let subEntid = $(_this).attr("entid");
					let subEntConf = _EntFormGlobalConf.FormGlobalConf2.subEntConfs[subEntid];
					let localFormRun = formRun; //局部变量
					/**
					 * 子应用类型
					 * 1：列表
					 * 2：树
					 * 3：树详情
					 */
					if (subEntConf.subEntType == '2') { //用到通过主应用获取的子应用数据	
						let treeRun = new TreeRun(); //不要污染主应用列表
						localFormRun.subListRuns.push(treeRun); //主要用于获取子应用数据，会有循环引用问题
						treeRun.pform = localFormRun; //会有循环引用问题
						treeRun.$context = _this;
						treeRun.init(subEntConf);
					}
				});
			}

			let afterEditDataHasInitFn = function() {
				if (!_FormGlobalData.editDataHasInitFlag) {
					setTimeout(afterEditDataHasInitFn, 1000);
				} else {
					initSubEntFn();
				}
			}

			if (!formRun.cfgdata.subEntFlag && formRun.cfgdataModel.opType == "create") { //主应用为新增时，直接加载子应用初始化
				initSubEntFn();
			} else {
				afterEditDataHasInitFn();
			}

			function refreshHeight() {
				var iframeobj = _FormGlobalFn.getIframeByWindow(window);
				_FormGlobalFn.autoIframe(iframeobj);
				setTimeout(refreshHeight, 1000);
			}
			setTimeout(refreshHeight, 1000);
			//======================afterEditDataHasInitFn子应用初始化 end======================//


		}


	})
}
asyncInit();
