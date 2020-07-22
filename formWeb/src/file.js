let a='啦啦啦啦'
let index = 0;
var fileData = {
	a:'啦啦啦',
	add(){
		this.a = this.a+(++index);
	},
	b(){
		return this.a+'叭叭叭';
	},
	c:() => this.a+'呲呲呲'
}
export {fileData}