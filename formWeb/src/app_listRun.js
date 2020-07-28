
import ListRun from 'listRun'
import FormRun from 'formRun'
/**
 * 
 * 分页初始化链
 * 	this.initevent() -> this.setPaging()
 * 分页调用链
 * 	mui.init({pullRefresh: {up: callback -> this.loadData() -> this.queryDatas -> this.setTbody()}});
 * @returns
 */
export default class AppListRun extends ListRun{
	constructor() {
	    super();
	}
	
	setPaging () {
		let _this = this;
		this.page.current = 0; // app分页，当前页由前端自己维护，查询前+1；
		this.page.paging = {setTotal(){}, setCurrent(){}}; // app没有分页对象，凑语法用的；
		
		mui.init({
			pullRefresh: {
				container: '#pullrefresh',
				up: {
					auto:true,
					contentrefresh: '正在加载...',
					callback: function() {

						// 这儿的this指向paging对象
						_this.page.current++; // 设置当前页
						// 点击页数按钮都会调用
						_this.loadData();
			
					}
				}
			}
		});
	}
	
	//翻到第一页
	refresh (){
		this.page.current = 0;
		this.datas=[];
		this.rowsForm=[];
		$('#pullrefresh div.mui-table-view', this.$context).empty();
		mui('#pullrefresh').pullRefresh().refresh(true);

		/*重新加载数据*/
		// 这儿的this指向paging对象
		this.page.current++; // 设置当前页
		// 点击页数按钮都会调用
		this.loadData();
	}
	//翻页同refresh
	setCurrent(currentPage){
		this.refresh();
	}
	
	temphtml(){
		let templ = $("div.table-container template[templid='"+this.cfgdata.mainEntId+"']",this.$context)[0].innerHTML;
		return templ;
	}

	setTbody (list, page) {
		
		//参数为true代表没有更多数据了。
		mui('#pullrefresh').pullRefresh().endPullupToRefresh(page.total <= ((this.page.current - 1) * this.page.size + list.length)); 
		
		let $container = $('#pullrefresh div.mui-table-view', this.$context);
		
		//模板
		let templ = this.temphtml();
		for (let i = 0; i < list.length; i++) {
			let globalIndex = (this.page.current - 1) * this.page.size + i;
			let item = list[i];
			
			//item['_INNER_ROW_NUM_FLAG'] = i+1;//app行号是一直加的，先不考虑
			let trGroupId = this.cfgdata.mainEntId + "_trgroupid_" + (++this.groupidx);
			item['_INNER_TR_GROUP_ID'] = trGroupId;
			item['_INNER_CREATE_OR_UPDATE'] = 'update';
			this.datas[globalIndex]=item;
			let html = templ.format(item, true);
			let $html = $(html);
			$html.attr("trgroupid",trGroupId);
			$container.append($html);

			
			//???????????
			let rowForm = new FormRun();
			rowForm.opType = 'update';
			rowForm.data = {columnsData:item};
			rowForm.$context = $html;
            rowForm.setListCfgData(this.cfgdata);
			rowForm.setFieldRelas(this.fieldRelas);
            rowForm.inicfg(this.cfgdata.mainEntId,"list");
			this.rowsForm[globalIndex]=rowForm;

		}        
	}
	/**
	 * 针对app列表主应用
	 * 
	 */
	updateRow4App(data){
		let idx = this.datas.byAttr(data.keyName, data.keyValue);
		if(idx == -1) return;
		data.columnsData['_INNER_ROW_NUM_FLAG'] = this.datas[idx]['_INNER_ROW_NUM_FLAG']//行号
		data.columnsData['I_INNER_KEYVALUE'] = this.datas[idx]['I_INNER_KEYVALUE']//主键
		this.datas[idx]=data.columnsData;
	
		let rowForm=this.rowsForm[idx];
		rowForm.data=data;
		rowForm.inicfg(this.cfgdata.mainEntId,"list");
	}
	
}
