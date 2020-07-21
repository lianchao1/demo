//依赖全失效
let a='aaaa'
let index = 0;
var globalData = {
	a:'aaa',
	add(){
		this.a = this.a+(++index);
	},
	b(){
		return this.a+'bbb';
	},
	c:() => this.a+'ccc'
}