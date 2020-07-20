import {
	Print
} from './one'
import smallImgSrc from '../images/small.png';

var smallImg = document.createElement("img");
smallImg.src = smallImgSrc;
document.body.appendChild(smallImg);

document.write('<h1>Hello World</h1>');
new Print();
$("#top").append("<span>444</span>")


let url = 'http://dev150.gszhcloud.com:8091/formWeb/beta/dataService/page';
let searchData = {
	"entId": "entid_TEST_INFO_ZBUYAODONG",
	"ctrlPrefix": "ListR_",
	"pageSize": 10,
	"currentPage": 1,
	"searchParamItems": [{
		"fieldName": "ID",
		"value": "300",
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


url = 'http://dev150.gszhcloud.com:8091/formWeb/dataService/dataBaseServiceIntf?updateOnlyDataAndNoCheckNull=true';
let updateData = {"keyName":"ID","keyValue":"248","entId":"entid_TUSER_INFO_ZBUYAODONG_JIU","opType":2,"columnsData":{
	"RADIO":"radio11",
	"INPUT":"input411",
	"TEXTAREA":"textarea11"
},"subTableDatas":{},"delSubData":{},"subEntIds":[]}
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