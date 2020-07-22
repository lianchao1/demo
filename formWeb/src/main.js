import {
	Print
} from './print'
import smallImgSrc from '../images/small.png';
import '../css/app';
import globalObj from 'globalObjSb'
import FormGlobalConf2Sb from 'FormGlobalConf2Sb'
import $script from 'scriptjs'

var smallImg = document.createElement("img");
smallImg.src = smallImgSrc;
document.body.appendChild(smallImg);

document.write('<h1>Hello World</h1>');
new Print();

if (__DEV__) {
	import('../css/leihou.css');
	import('./leihou')
		.then(({
			Leihou
		}) => {
			new Leihou();
		}).catch(error => {
			console.error(error);
		});
}


let url = '/formWeb/beta/dataService/page';
let searchData = {
	"entId": "entid_TEST_INFO_ZBUYAODONG",
	"ctrlPrefix": "ListR_",
	"pageSize": 10,
	"currentPage": 1,
	"searchParamItems": [{
		"fieldName": "ID",
		"value": "310",
		"compareType": "<=",
		"fieldDataTypeId": "1"
	}]
}
//cookie测试
fetch(url, {
		method: 'POST',
		//credentials: "include", //"same-origin"//好像没啥用
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(searchData)
	}).then((response) => response.json())
	.then((responseJsonData) => {
		console.log(responseJsonData);
	}).catch((error) => {
		console.error(error);
	});


url = '/formWeb/dataService/dataBaseServiceIntf?updateOnlyDataAndNoCheckNull=true';
let updateData = {
	"keyName": "ID",
	"keyValue": "248",
	"entId": "entid_TUSER_INFO_ZBUYAODONG_JIU",
	"opType": 2,
	"columnsData": {
		"RADIO": "radio11",
		"INPUT": "input411",
		"TEXTAREA": "textarea11"
	},
	"subTableDatas": {},
	"delSubData": {},
	"subEntIds": []
}
//跨域测试
fetch(url, {
		method: 'POST',
		//mode: "cors",//好像没啥用
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(updateData)
	}).then((response) => response.json())
	.then((responseJsonData) => {
		console.log(responseJsonData);
	}).catch((error) => {
		console.error(error);
	});

//全局引入
console.log(_.fill([4, 6, 8, 10], '*', 1, 3));

//全局变量
globalObj.add();
console.log(globalObj.index)


import('./file')
	.then(({
		fileData
	}) => {
		console.log(fileData.b())
	}).catch(error => {
		console.error(error);
	});

$script.get(
	'http://localhost:9000/formWeb/beta/formrun/entid_TEST_INFO_ZBUYAODONG/entCfg.js?v=a93895cc409448c2b61f58de1b3cdcfb&ctrlPrefix=ListR_',
	function() {
		console.log(FormGlobalConf2)
		FormGlobalConf2Sb.FormGlobalConf2 = FormGlobalConf2
	})
	
console.log(FormGlobalConf2Sb)
setTimeout(function() {
	console.log(FormGlobalConf2Sb)
}, 5000);
