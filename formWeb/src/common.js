/**
 * @ignore
 * 说明：
 * 表量替换支持{!ADDR,2}，{!ADDR}统一使用!
 *
 * 列表html中{{!KeyValue,6}}替换主键
 *
 * 控件html
 * id 规则 ownEntId_fieldName[_rowIndex]
 * 掩藏提交数据id 规则 ownEntId_fieldName_hid[_rowIndex]
 * 展示数据id 规则 ownEntId_fieldName_text[_rowIndex]
 */
/////////////表单全局属性
FormGlobalConf = {
	asyncFlag: true, //异步提交标识
	refresh4SubmitFlag: true, //提交后刷新页面标识
	isMobileTemp: false, //是否app标识
	contextPath: "/formWeb",
	formGlobalConf: {} //应用配置
};

/////////////表单全局方法
FormGlobalFn = {
	validate() {},
	ajaxRequestJson(url, data, callback) {},
	getFieldConfByEntIdAndFieldName(ownEntId, fieldName, map) { //通过应用id+字段名获取 字段配置（适用于相同配置module下不会出现相同的fieldName的情况）
		let fieldConf = null;
		for (let key in map) {
			if (key.startsWith(ownEntId + '_' + fieldName)) {
				fieldConf = map[key];
				break;
			}
		}
		return fieldConf;
	},
	getQueryParam() {},
	getQueryString(name) {},
	getAllUrlParams() {},
	getIframeByWindow() {},
	autoIframe() {},
	d2sClick() {},
	hasParams(str) {},
	hasFormParams(str) {},
	form: {},
	search: {},
	list: {},
	api: {
		form: {},
		search: {},
		list: {}
	},
	callback: {
		form: {},
		search: {},
		list: {}
	}
};

//////////////后端返回数据
FormGlobalData = {
	handler: null, //全局操作对象，跨页面回填源页面的某个对象，一个操作段操作的对象是不变的
	searchInitData: {}, // 搜索框原始值，用于清空搜索框
	dict: {} //字全局字典
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @namespace FormGlobalFn
 */
/**
 * @namespace FormGlobalFn.api
 */
/**
 * @namespace FormGlobalFn.callback
 */

/**
 * 初始化
 * @ignore
 */
FormGlobalFn.init = function() {
	$(function() {
		// 页签切换
		$(document).on("click", ".form-container .tab-container .tab-header .tab", function(e) {
			var $ts = $(this);
			if ($ts.hasClass("active")) return;
			var $c = $ts.parents(".tab-container");
			var $tabs = $c.find(".tab-header .tab");
			$tabs.removeClass("active");
			$ts.addClass("active");
			var idx = $tabs.index($ts);
			$c.find(".tab-body").removeClass("active").eq(idx).addClass("active");
		});

		$('.mui-bar-nav .mui-icon-search').click(function() {
			$('.filter-container').toggleClass('active');
		})
	});
}

/**
 * 控件不可编辑
 * @function
 * @param {DOM} $obj - jqueryDom
 */
FormGlobalFn.disabled = function($obj) {
	//.form-container .ctrl-container.disabled::before,td.disabled::before
	let $container = $obj.closest("td.td-ctrl");
	if ($container.length < 1) {
		$container = $obj.closest("div.ctrl-container");
	}
	$container.addClass("disabled");
}
/**
 * 控件可编辑
 * @function
 * @param {DOM} $obj - jqueryDom
 */
FormGlobalFn.enabled = function($obj) {
	//.form-container .ctrl-container.disabled::before,td.disabled::before
	let $container = $obj.closest("td.td-ctrl");
	if ($container.length < 1) {
		$container = $obj.closest("div.ctrl-container");
	}
	$container.removeClass("disabled");
}
/**
 * 表达式中是否有变量 ：1，表单变量{!@xxx}；2，系统变量{$xxx}；3，url变量{*xxx}
 * @function
 * @param {string} str - 字符串
 * @returns {boolean} 是否包含
 */
FormGlobalFn.hasParams = function(str) {
	if (!str) return false;
	let regex = /\{[@!\*\$][_a-zA-Z0-9\u4e00-\u9fa5]+?\}/;
	return regex.test(str);
}

/**
 * 表达式中是否有表单变量 ：1，系统变量{！$xxx}；2，url变量{@xxx}
 * @function
 * @param {string} str - 字符串
 * @returns {boolean} 是否包含
 */
FormGlobalFn.hasFormParams = function(str) {
	if (!str) return false;
	let regex = /\{[@!][_a-zA-Z0-9\u4e00-\u9fa5]+?\}/;
	return regex.test(str);
}
/**
 * 生成uuid
 * @function
 * @returns {string} uuid
 */
FormGlobalFn.uuid = function() {
	let s = [];
	let hexDigits = "0123456789abcdef";
	for (let i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = ""; //"-";/*卫星说加了横线旧的表字段长度不足*/

	let uuid = s.join("");
	return uuid;
}
FormGlobalFn.formatFloat = function(f) {
	let v = parseFloat(f);
	if (isNaN(v)) {
		v = 0.0;
	}
	return parseFloat(v.toFixed(2));
}
FormGlobalFn.strToFloat = function(f) {
	return parseFloat(FormGlobalFn.formatFloat(f));
}
FormGlobalFn.strToInt = function(i) {
	let v = parseInt(i);
	if (isNaN(v)) {
		v = 0;
	}
	return v;
}

/**
 * FormGlobalFn.ajaxRequestJson 回调函数
 * @callback ajaxRequestJsonCB
 * @param {*} msg - 结果
 */
/**
 * ajax请求
 * @function
 * @param {string} url - 地址.
 * @param {Object} data - 参数.
 * @param {ajaxRequestJsonCB} callback - 回调函数.
 */
FormGlobalFn.ajaxRequestJson = function(url, data, callback) {
	$.ajax({
		type: "POST",
		contentType: "application/json",
		url: url,
		async: FormGlobalConf.asyncFlag,
		data: JSON.stringify(data),
		beforeSend: function(XMLHttpRequest) {
			// showWaiting();
		},
		complete: function(XMLHttpRequest, textStatus) {
			// hideWaiting();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			// hideWaiting();
		},
		success: function(msg) {
			if (typeof callback == "function") {
				callback(msg);
			}
		},
	});
};
/**
 * @ignore
 *当前页面参数
 */
FormGlobalFn.getQueryParam = function() {
	var selfUrl = window.location.search;
	var exp = new RegExp("[&?][@.,'_a-zA-Z0-9]*", "i");
	var param = "";
	var restr = "";
	while ((restr = exp.exec(selfUrl)) != null) {
		param =
			param +
			new String(restr).substr(1) +
			"=" +
			FormGlobalFn.getQueryString(new String(restr).substr(1)) +
			"&";
		selfUrl = selfUrl.replace(restr, "");
	}
	return param;
};
FormGlobalFn.getIframeByWindow = function(windowObj) {
	var iframe = null;
	if (window.parent) {
		$("iframe", window.parent.document).each(function() {
			if (windowObj === this.contentWindow) {
				iframe = this;
			}
		});
	}
	return iframe;
};
FormGlobalFn.autoIframe = function(iframeObj) {

	console.log("autoIframe");
	var ifm = iframeObj;
	var subWeb = document.frames ? iframeObj.document : iframeObj.contentDocument;
	if (ifm != null && subWeb != null) {
		ifm.height = subWeb.body.scrollHeight;
		//ifm.width =subWeb.body.scrollWidth;
	}
}
/**
 * 获取url参数
 * @function
 * @param {string} name - 参数名.
 * @returns {string} 参数值.
 */
FormGlobalFn.getQueryString = function(name) {
	var wind = window.location;
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = wind.search.substr(1).match(reg);
	if (r != null) return unescape(r[2]);
	return "";
};
FormGlobalFn.getAllUrlParams = function() {
	// 用JS拿到URL，如果函数接收了URL，那就用函数的参数。如果没传参，就使用当前页面的URL
	var queryString = window.location.search.slice(1);
	// 用来存储我们所有的参数
	var obj = {};
	// 如果没有传参，返回一个空对象
	if (!queryString) {
		return obj;
	}
	// stuff after # is not part of query string, so get rid of it
	queryString = queryString.split("#")[0];
	// 将参数分成数组
	var arr = queryString.split("&");
	for (var i = 0; i < arr.length; i++) {
		// 分离成key:value的形式
		var a = arr[i].split("=");
		// 将undefined标记为true
		var paramName = a[0];
		var paramValue = typeof a[1] === "undefined" ? true : a[1];
		// 如果调用对象时要求大小写区分，可删除这两行代码
		paramName = paramName.toLowerCase();
		if (typeof paramValue === "string") paramValue = paramValue.toLowerCase();
		// 如果paramName以方括号结束, e.g. colors[] or colors[2]
		if (paramName.match(/\[(\d+)?\]$/)) {
			// 如果paramName不存在，则创建key
			var key = paramName.replace(/\[(\d+)?\]/, "");
			if (!obj[key]) obj[key] = [];
			// 如果是索引数组 e.g. colors[2]
			if (paramName.match(/\[\d+\]$/)) {
				// 获取索引值并在对应的位置添加值
				var index = /\[(\d+)\]/.exec(paramName)[1];
				obj[key][index] = paramValue;
			} else {
				// 如果是其它的类型，也放到数组中
				obj[key].push(paramValue);
			}
		} else {
			// 处理字符串类型
			if (!obj[paramName]) {
				// 如果如果paramName不存在，则创建对象的属性
				obj[paramName] = paramValue;
			} else if (obj[paramName] && typeof obj[paramName] === "string") {
				// 如果属性存在，并且是个字符串，那么就转换为数组
				obj[paramName] = [obj[paramName]];
				obj[paramName].push(paramValue);
			} else {
				// 如果是其它的类型，还是往数组里丢
				obj[paramName].push(paramValue);
			}
		}
	}
	return obj;
};
var oldTime = 0;
FormGlobalFn.d2sClick = function() {
	if (new Date().getTime() - oldTime > 500) {
		oldTime = new Date().getTime();
		return true;
	} else {
		return false;
	}
};
/**
 * @ignore
 *控件ID
 */
FormGlobalFn.eleId = function(fieldConf) {
	let id = fieldConf.ownEntId + "_" + fieldConf.fieldName + "_" + fieldConf.uuid
	return id;
}
/**
 * 提示框<br/>
 * icon：<br/>
 *	s 或 success	成功<br/>
 *	e 或 error	失败<br/>
 *	w 或 warning	警告<br/>
 *	a 或 ask	询问<br/>
 *	h 或 hello	微笑<br/>
 * @function
 * @param {string} msg - 信息
 * @param {string} icon - 图标
 * @param {string} [title = 提示] - 标题
 */
FormGlobalFn.showAlert = function(msg, icon, title) {
	// xtip.alert(msg, icon, {
	//   title: title || "提示",
	// });

	layer.alert(msg, {
		icon: icon,
		title: title || "提示"
	});
};

/**
 * FormGlobalFn.showConfirm 回调函数
 * @callback showConfirmCB
 * @param {number} index - 窗口标识
 */
/**
 * 确认框
 * @function
 * @param {string} msg - 信息
 * @param {showConfirmCB} callback - 确认回调函数
 * @param {string} icon - 图标
 * @param {string} title - 标题
 */
FormGlobalFn.showConfirm = function(msg, callback, icon, title) {
	// xtip.confirm(msg, callback || "", {
	//   icon: icon,
	//   title: title || "提示",
	// });

	layer.confirm(msg, {
		icon: icon,
		title: title
	}, callback);
};
/**
 * FormGlobalFn.showWindow4Url 回调函数
 * @callback showWindow4UrlCB
 * @param {number} index - 窗口标识
 * @param {DOM} layero - 弹出窗口
 */
/**
 * 弹出iframe层
 * @function 
 * @param {string} url - url
 * @param {string} [width] - 宽度(px,%)
 * @param {string} [height] - 高度(px,%)
 * @param {string} [title] - 标题
 * @param {showWindow4UrlCB} [yesCallback] - 确认回调函数
 * @param {boolean} [noYes] - 掩藏保存按钮
 * 
 */
FormGlobalFn.showWindow4Url = function(url, width, height, title, yesCallback, noYes) {
	if (noYes) {
		return layer.open({
			title: title,
			type: 2,
			content: url,
			area: [width || (FormGlobalConf.isMobileTemp ? "100%" : "95%"), height || (FormGlobalConf.isMobileTemp ? "100%" :
				"95%")],
			btn: ["关闭"]
		});
	}
	return layer.open({
		title: title,
		type: 2,
		content: url,
		area: [width || (FormGlobalConf.isMobileTemp ? "100%" : "95%"), height || (FormGlobalConf.isMobileTemp ? "100%" :
			"95%")],
		btn: ["保存", "关闭"],
		yes: function(index, layero) {
			if (typeof yesCallback == 'function') {
				yesCallback(index, layero);
			}
		}
	});
};
/**
 * 弹出页面层
 * @function 
 * @param {string|DOM} content - 内容
 * @param {string} [width] - 宽度(px,%)
 * @param {string} [height] - 高度(px,%)
 * @param {string} [title] - 标题
 * 
 */
FormGlobalFn.showWindow4Content = function(content, width, height, title) {
	return layer.open({
		title: title,
		type: 1,
		content: content,
		area: [width || "70%", height || "85%"]
	});
};
/**
 * 加载中
 * @function
 * @returns {number} 窗口标识
 */
FormGlobalFn.showLoad = function() {
	let loadId = layer.load(1, {
		shade: [0.3, "#ddd"], //0.1透明度的白色背景
	});
	// var loadId = xtip.load(title || "", { lock: true });
	return loadId;
};
/**
 * 关闭弹出框
 * @function
 * @param {number|number[]} index - 窗口标识
 */
FormGlobalFn.showClose = function(index) {
	if (!!index) {
		if (index instanceof Array) {
			for (let i = 0; i < index.length; i++) {
				layer.close(index[i]);
			}
		} else {
			layer.close(index);
		}
	} else {
		layer.closeAll();
	}
};
/**
 * @ignore
 * 按钮扩展
 * btnConfs
 * type:form/list
 */
FormGlobalFn.initBtn = function(btnConfs, type) {
	if (!FormGlobalConf.isMobileTemp || typeof mui === 'undefined') { //普通界面，或子应用按钮绑定
		for (let btnId in btnConfs) {
			let btnObj = btnConfs[btnId];

			$("[id='" + btnObj.id + "']").off("click dblclick");
			if (btnObj.scriptOnClick) {
				$("[id='" + btnObj.id + "']").click(function() {
					eval(btnObj.scriptOnClick);
				});
			}
			if (btnObj.scriptOnDbClick) {
				$("[id='" + btnObj.id + "']").dblclick(function() {
					eval(btnObj.scriptOnDbClick);
				});
			}
			$("[id='" + btnObj.id + "']").click(function() {
				switch (btnObj.type || 'other') {
					case 'ajax':
						if ('list' == type) {
							var datas = FormGlobalFn.api.list.getData();
							if (datas.length < 1) {
								FormGlobalFn.showAlert('请勾选需要修改的数据！', 'w');
								return false;
							}
							FormGlobalFn.ajaxRequestJson(btnObj.url, datas);
						} else if ('form' == type) {
							FormGlobalFn.api.form.getData(function(data) {
								FormGlobalFn.ajaxRequestJson(btnObj.url, data);
							});
						}
						break;
					case 'modal':
						FormGlobalFn.showWindow4Url(btnObj.url);
						break;
					case 'window':
						window.open(btnObj.url);
						break;
				}
			});
		}
	} else { //app界面按钮绑定
		for (let btnId in btnConfs) {
			let btnObj = btnConfs[btnId];

			mui(document).off("tap", "[id='" + btnObj.id + "']");
			if (btnObj.scriptOnClick) {
				mui(document).on('tap', "[id='" + btnObj.id + "']", function() {
					eval(btnObj.scriptOnClick);
				});
			}

			mui(document).on('tap', "[id='" + btnObj.id + "']", function() {
				switch (btnObj.type || 'other') {
					case 'ajax':
						if ('list' == type) {
							var datas = FormGlobalFn.api.list.getData();
							if (datas.length < 1) {
								FormGlobalFn.showAlert('请勾选需要修改的数据！', 'w');
								return false;
							}
							FormGlobalFn.ajaxRequestJson(btnObj.url, datas);
						} else if ('form' == type) {
							FormGlobalFn.api.form.getData(function(data) {
								FormGlobalFn.ajaxRequestJson(btnObj.url, data);
							});
						}
						break;
					case 'modal':
						FormGlobalFn.showWindow4Url(btnObj.url);
						break;
					case 'window':
						window.open(btnObj.url);
						break;
				}
			});
		}
	}

}
/**
 * @ignore
 * 列表按钮扩展
 * btnConfs
 */
FormGlobalFn.initListBtn = function(btnConfs) {
	if (!FormGlobalConf.isMobileTemp || typeof mui === 'undefined') { //普通界面，或子应用按钮绑定
		for (let btnId in btnConfs) {
			let btnObj = btnConfs[btnId];
			$("div:not([ctrltypeid]).table-container").off("click dblclick", "[id='" + btnObj.id + "']");
			if (btnObj.scriptOnClick) {
				$("div:not([ctrltypeid]).table-container").on("click", "[id='" + btnObj.id + "']", function() {
					let listRun = undefined;
					//判断是否子应用
					let $container = $(this).closest("div[ctrltypeid].table-container");
					if (!!$container.attr("ctrltypeid")) {
						let subEntId = $container.attr("entid");
						for (let i = 0; i < formRun.subListRuns.length; i++) {
							if (formRun.subListRuns[i].cfgdata.mainEntId === subEntId) {
								listRun = formRun.subListRuns[i];
								break;
							}
						}
					}

					let rowIndex = 0;
					let $row = $(this).closest("tr.row")
					$row.parent().find("tr.row").each(function(i, d) {
						if ($row.get(0) == $(this).get(0)) {
							rowIndex = i;
							return false;
						}
					});
					let rowData = {
						rowIndex: rowIndex,
						data: FormGlobalFn.api.list.getDatas(listRun)[rowIndex]
					};
					eval(btnObj.scriptOnClick);
				});
			}
			if (btnObj.scriptOnDbClick) {
				$("div:not([ctrltypeid]).table-container").on("dblclick", "[id='" + btnObj.id + "']", function() {
					let listRun = undefined;
					//判断是否子应用
					let $container = $(this).closest("div.table-container");
					if (!!$container.attr("ctrltypeid")) {
						let subEntId = $container.attr("entid");
						for (let i = 0; i < formRun.subListRuns.length; i++) {
							if (formRun.subListRuns[i].cfgdata.mainEntId === subEntId) {
								listRun = formRun.subListRuns[i];
								break;
							}
						}
					}

					let rowIndex = 0;
					let $row = $(this).closest("tr.row")
					$row.parent().find("tr.row").each(function(i, d) {
						if ($row.get(0) == $(this).get(0)) {
							rowIndex = i;
							return false;
						}
					});
					let rowData = {
						rowIndex: rowIndex,
						data: FormGlobalFn.api.list.getDatas(listRun)[rowIndex]
					};
					eval(btnObj.scriptOnDbClick);
				});
			}
			$("div:not([ctrltypeid]).table-container").on("click", "[id='" + btnObj.id + "']", function() {
				switch (btnObj.type || 'other') {
					case 'ajax':
						var datas = FormGlobalFn.api.list.getData();
						if (datas.length < 1) {
							FormGlobalFn.showAlert('请勾选需要修改的数据！', 'w');
							return false;
						}
						FormGlobalFn.ajaxRequestJson(btnObj.url, datas);
						break;
					case 'modal':
						FormGlobalFn.showWindow4Url(btnObj.url);
						break;
					case 'window':
						window.open(btnObj.url);
						break;
				}
			});
		}
	} else { //app界面按钮绑定
		for (let btnId in btnConfs) {
			let btnObj = btnConfs[btnId];
			mui("div:not([ctrltypeid]).table-container").off("tap", "[id='" + btnObj.id + "']");
			if (btnObj.scriptOnClick) {
				mui("div:not([ctrltypeid]).table-container").on("tap", "[id='" + btnObj.id + "']", function() {
					let listRun = undefined;
					//判断是否子应用
					let $container = $(this).closest("div.table-container");
					if (!!$container.attr("ctrltypeid")) {
						let subEntId = $container.attr("entid");
						for (let i = 0; i < formRun.subListRuns.length; i++) {
							if (formRun.subListRuns[i].cfgdata.mainEntId === subEntId) {
								listRun = formRun.subListRuns[i];
								break;
							}
						}
					}

					let rowIndex = 0;
					let $row = $(this).closest(".row")
					$row.parent().find(".row").each(function(i, d) {
						if ($row.get(0) == $(this).get(0)) {
							rowIndex = i;
							return false;
						}
					});
					let rowData = {
						rowIndex: rowIndex,
						data: FormGlobalFn.api.list.getDatas(listRun)[rowIndex]
					};
					eval(btnObj.scriptOnClick);
				});
			}

			mui("div:not([ctrltypeid]).table-container").on("tap", "[id='" + btnObj.id + "']", function() {
				switch (btnObj.type || 'other') {
					case 'ajax':
						var datas = FormGlobalFn.api.list.getData();
						if (datas.length < 1) {
							FormGlobalFn.showAlert('请勾选需要修改的数据！', 'w');
							return false;
						}
						FormGlobalFn.ajaxRequestJson(btnObj.url, datas);
						break;
					case 'modal':
						FormGlobalFn.showWindow4Url(btnObj.url);
						break;
					case 'window':
						window.open(btnObj.url);
						break;
				}
			});

		}
	}
}

/*required	必填
valueOnly	无重复
letter	英文字母
integer	数字
email	邮件
zip	邮编
idcard	身份证
regexp	正则表达式
custom	自定义表达式*/
FormGlobalFn.check = {};
FormGlobalFn.check["letter"] = function(str) {
	let result = true;
	if (str.length != 0) {
		reg = /^[a-zA-Z]+$/;
		if (!reg.test(str)) {
			result = false;
			//alert("对不起，您输入的英文字母类型格式不正确!");//请将“英文字母类型”改成你需要验证的属性名称!
		}
	}
	return {
		state: result,
		msg: "只能输入英文字母！"
	};
};
FormGlobalFn.check["required"] = function(str) {
	let result = true;
	if (str == null) {
		str = "";
	}
	str = str.trim();
	if (str.length == 0) {
		result = false;
		//alert('对不起，文本框不能为空或者为空格!');//请将“文本框”改成你需要验证的属性名称!
	}
	return {
		state: result,
		msg: "不能为空"
	};
};
FormGlobalFn.check["integer"] = function(str) {
	let result = true;
	if (str == null) {
		str = "";
	}
	if (str.length != 0) {
		reg = /^[-+]?\d*$/;
		if (!reg.test(str)) {
			result = false;
			// alert("对不起，您输入的整数类型格式不正确!");//请将“整数类型”要换成你要验证的那个属性名称！
		}
	}
	return {
		state: result,
		msg: "只能输入数字"
	};
};
FormGlobalFn.check["email"] = function(str) {
	let result = true;
	if (str == null) {
		str = "";
	}
	if (str.length != 0) {
		reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
		if (!reg.test(str)) {
			result = false;
			//alert("对不起，您输入的字符串类型格式不正确!");//请将“字符串类型”要换成你要验证的那个属性名称！
		}
	}
	return {
		state: result,
		msg: "邮件格式不正确！如：xxx@163.com"
	};
};
FormGlobalFn.check["idcard"] = function(str) {
	let result = true;
	if (str == null) {
		str = "";
	}
	if (str.length != 0) {
		reg = /^\d{6}$/;
		if (!reg.test(str)) {
			result = false;
			//alert("对不起，您输入的字符串类型格式不正确!");//请将“字符串类型”要换成你要验证的那个属性名称！
		}
	}
	return {
		state: result,
		msg: "邮编格式不正确！"
	};
};
FormGlobalFn.check["mobile"] = function(str) {
	let result = true;
	if (str == null) {
		str = "";
	}
	if (str.length != 0) {
		reg = /^1[3456789]\d{9}$/;
		if (!reg.test(str)) {
			result = false;
		}
	}
	return {
		state: result,
		msg: "手机号码有误，请重新输入！"
	};
};
FormGlobalFn.check["phone"] = function(str) {
	let result = true;
	if (str == null) {
		str = "";
	}
	if (str.length != 0) {
		reg = /^(\d{4}-|\d{3}-)?(\d{8}|\d{7})$/;
		if (!reg.test(str)) {
			result = false;
		}
	}
	return {
		state: result,
		msg: "电话格式不正确，请重新输入 如：0591-88768888！",
	};
};

FormGlobalFn.check["zip"] = function(code) {
	//身份证号合法性验证
	//支持15位和18位身份证号
	//支持地址编码、出生日期、校验位验证
	var city = {
		11: "北京",
		12: "天津",
		13: "河北",
		14: "山西",
		15: "内蒙古",
		21: "辽宁",
		22: "吉林",
		23: "黑龙江 ",
		31: "上海",
		32: "江苏",
		33: "浙江",
		34: "安徽",
		35: "福建",
		36: "江西",
		37: "山东",
		41: "河南",
		42: "湖北 ",
		43: "湖南",
		44: "广东",
		45: "广西",
		46: "海南",
		50: "重庆",
		51: "四川",
		52: "贵州",
		53: "云南",
		54: "西藏 ",
		61: "陕西",
		62: "甘肃",
		63: "青海",
		64: "宁夏",
		65: "新疆",
		71: "台湾",
		81: "香港",
		82: "澳门",
		91: "国外 ",
	};
	var row = {
		pass: true,
		msg: "验证成功",
	};
	if (
		!code ||
		!/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|[xX])$/.test(
			code
		)
	) {
		row = {
			pass: false,
			msg: "身份证号格式错误",
		};
	} else if (!city[code.substr(0, 2)]) {
		row = {
			pass: false,
			msg: "身份证号地址编码错误",
		};
	} else {
		//18位身份证需要验证最后一位校验位
		if (code.length == 18) {
			code = code.split("");
			//∑(ai×Wi)(mod 11)
			//加权因子
			var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
			//校验位
			var parity = [1, 0, "X", 9, 8, 7, 6, 5, 4, 3, 2];
			var sum = 0;
			var ai = 0;
			var wi = 0;
			for (var i = 0; i < 17; i++) {
				ai = code[i];
				wi = factor[i];
				sum += ai * wi;
			}
			if (parity[sum % 11] != code[17].toUpperCase()) {
				row = {
					pass: false,
					msg: "身份证号校验位错误",
				};
			}
		}
	}
	return {
		state: row.pass,
		msg: row.msg
	};
};

//============================//
String.prototype.format = function(obj, clean) {
	if (arguments.length === 0) return this;

	let s = this;
	for (let key in obj) {
		s = s.replace(
			new RegExp("\\#\\{" + key + "\\}", "g"),
			!obj[key] && typeof obj[key] != "undefined" && obj[key] != 0 ?
			"" :
			obj[key]
		);
	}
	if (clean) {
		//清空#{xxx}
		s = s.replace(new RegExp("#{[_a-zA-Z0-9\u4e00-\u9fa5]*}", "ig"), "");
	}
	return s;
};
if (typeof String.prototype.startsWith != "function") {
	String.prototype.startsWith = function(prefix) {
		return this.slice(0, prefix.length) === prefix;
	};
}
if (typeof String.prototype.endsWith != "function") {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}
String.prototype.replaceAll = function(s1, s2) {
	return this.replace(new RegExp(s1, "gm"), s2);
};
//删除数组成员
Array.prototype.delete = function(index) {
	if (index instanceof Array) {
		index.sort(function(a, b) {
			return a > b ? -1 : 1;
		}); //倒序
		for (let i = 0; i < index.length; i++) {
			if (index[i] > -1) {
				this.splice(index[i], 1);
			}
		}
	} else if (index > -1) {
		this.splice(index, 1);
	}
};
Array.prototype.swap = function(index1, index2) {
	this[index1] = this.splice(index2, 1, this[index1])[0];
}
//查询数组成员
Array.prototype.byAttr = function(attrName, value) {
	let idx = -1;

	for (let i = 0; i < this.length; i++) {
		if (this[i][attrName] == value) {
			idx = i;
			break;
		}
	}
	return idx;
}
/** 
 * @ignore
 * 对Date的扩展，将 Date 转化为指定格式的String       
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符       
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)       
 * eg:       
 * (new Date()).pattern("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423       
 * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04       
 * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04       
 * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04       
 * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18       
 */
Date.prototype.format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份           
		"d+": this.getDate(), //日           
		"h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时           
		"H+": this.getHours(), //小时           
		"m+": this.getMinutes(), //分           
		"s+": this.getSeconds(), //秒           
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度           
		"S": this.getMilliseconds() //毫秒           
	};
	var week = {
		"0": "/u65e5",
		"1": "/u4e00",
		"2": "/u4e8c",
		"3": "/u4e09",
		"4": "/u56db",
		"5": "/u4e94",
		"6": "/u516d"
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	if (/(E+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") +
			week[this.getDay() + ""]);
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}

//=========================================================================//

setRadio = function(name, value, context) {
	$("input[name='" + name + "']", context).each(function() {
		if ($(this).val() == value) {
			this.checked = true;
			$(this).trigger("change");
		}
	});
}
getRadio = function(name, context) {
	let value = "";
	$("input[name='" + name + "']", context).each(function() {
		if ($(this).is(':checked')) {
			value = this.value;
		}
	});
	return value;
}
getCheckBoxs = function(name, context) {
	let value = "";
	$("input[name='" + name + "']", context).each(function() {
		if ($(this).is(':checked')) {
			if (value == "") {
				value = this.value;
			} else {
				value = value + "," + this.value;
			}
		}
	});
	return value;
}
/**
 * @ignore
 * values=1,2,3,4
 */
setCheckBoxs = function(name, values, context) {
	if (values == null) {
		values = "";
	}
	let vals = values.split(",");
	$("input[name='" + name + "']", context).each(function() {
		let dis = $(this).is(":disabled");
		for (let i = 0; i < vals.length; i++) {
			if ($(this).val() == vals[i] && !dis) {
				this.checked = true;
				break;
			} else {
				this.checked = false;
			}
		}
	});

	//???????$(this).trigger("change");
}

//////初始化//////
$(function() {
	// 页签切换
	$(document).on("click", ".form-container .tab-container .tab-header .tab", function(e) {
		var $ts = $(this);
		if ($ts.hasClass("active")) return;
		var $c = $ts.parents(".tab-container");
		var $tabs = $c.find(".tab-header .tab");
		$tabs.removeClass("active");
		$ts.addClass("active");
		var idx = $tabs.index($ts);
		$c.find(".tab-body").removeClass("active").eq(idx).addClass("active");
	});

	$(document).on("click", '.mui-bar-nav .mui-icon-search', function() {
		$('.filter-container').toggleClass('active');
	})
});
