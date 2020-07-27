
/**
 * 加载外部的文件
 * @param urls 要加载的文件的url地址
 */
export default function(urls) {
	let _urls = null;
	if (Array.isArray(urls)) {
		_urls = urls;
	} else {
		_urls = [urls];
	}
	let fileHref;
	for (let url of _urls) {
		fileHref = document.createElement('link');
		fileHref.setAttribute("rel", "stylesheet");
		fileHref.setAttribute("type", "text/css");
		fileHref.setAttribute("href", url);
		document.getElementsByTagName("head")[0].appendChild(fileHref);
	}
};

