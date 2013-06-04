/**
 * @namespace JF
 * @summary 一个简单的js模块管理框架
 * @desc 实现Module Pattern，解决最基本的js代码组织问题。不包含依赖管理，动态加载等功能，如需要推荐使用SeaJS或RequireJS。注：JF假设你使用jQuery，如果您使用别的库，可以针对性改一下代码。
 * @author Levin
 * @version 1.2.2
 * @example 
	JF.M("Module1",(function($){
		var p={},
			pub={};
		
		return pub;
	})(jQuery));
 */
var JF = (function ($) {
	var p = {},
		pub = {};
	/*private area*/
	p._modules = {};
	/**
	* @private
	* @desc onLoaded方法,统一管理页面加载完毕后的回调方法
	* 说明:onLoaded方法接管所有页面上注册到$(document).ready(callback)中的callback方法;
	* 如果你要新增一个$(callback)或$(document).ready,请将你的callback方法放在onLoaded方法体内
	*/
	p.onLoaded = function () {
		var k = null;
		for (var m in p._modules) {
			k = m;
			if ((m = p._modules[m]) && m.onLoad) {
				try {
					m.onLoad(m);
					delete m.onLoad;
				} catch (e) {
					alert('Error init module [' + k + ']:' + e.message || e.description);
				}
			};
		};
	};
	/**
	* @private
	* @desc initEvents方法
	*	作用:用于为页面dom元素注册各种事件!
	*	说明:Html页面仅用于表现，任何时候应在标签里面直接注册事件。即避免如<a onclick="xx"/>
	*/
	p.initEvents = function (opts) {
		$(document).ready(p.onLoaded);
	};

	/*public area
	+++++++++++++++++++++++++++++*/
	/**
	* 初始化JF框架，页面js逻辑的唯一入口。一般至于</body>标签之前，用户向整个app传递参数用
	* @public
	* @function
	* @name JF#Init
	* @param {Object} opts 配置对象
	* @example
	*
	*	JF.Init({x:'kk',y:'zz'});
	*
	*/
	pub.Init = function (opts) {
		pub.cfg["GLOBAL"]=pub.opts = p.opts = opts = $.extend(opts || {},JF.opts||{});
		var k = null;
		for (var m in p._modules) {
			k = m;
			if ((m = p._modules[m]) && m.init) {
				try {
					m.init();
					delete m.init;

					if(m._){
						p.initSub(m._);
					}

				} catch (e) {
					alert('Error init module [' + k + ']:' + e.message || e.description);
				}
			};
		};
		p.initEvents();
	};

	/** 
		模块配置对象，用于存放模块的需要共享的配置信息 
		@public
		@function
		@name JF#cfg
		@example
			JF.cfg['moduleName']={"key":"val"};
	*/
	pub.cfg = {};

	/**
	 * 初始化子模块。如果你的一个模块里面有子模块p.sub1，p.sub1又具有init方法的时候，可以在pub.Init中调用InitSub方法让JF对子模块进行初始化。
	 * @public
	 * @function
	 * @name JF#InitSub
	 * @param {Object} sub sub module
	 * @example
		JF.M("xxx",(function($){
			var p={},pub={};
			p.sub1={
				init:function(){}
			};

			pub.Init = function(){
				JF.InitSub(p);
			};

			return pub;

		})(jQuery));
	 */
	pub.InitSub = function(sub) {
		for (var c in sub) {
			c = sub[c];
			if (!c) {
				continue;
			};

			if (c.init) {
				c.init.call(c);
				delete c.init;
			};

			for (var c1 in c) {
				c1 = c[c1];
				if (!c1) continue;

				if (c1.init) {
					c1.init.call(c1);
					delete c1.init;
				};
			};
		};
	};
	/**
	* onLoaded之后加载子模块。如果你的一个模块里面有子模块p.sub1，p.sub1又具有onLoad方法的时候，可以在pub.onLoad中调用LoadSub方法让JF在onLoaded之后加载子模块。
	* @public
	* @function
	* @name JF#LoadSub
	* @param {Object} sub sub module
	*/
	pub.LoadSub = function (sub) {
		for (var c in sub) {
			c = sub[c];
			if (!c) {
				continue;
			};

			if (c.onLoad) {
				c.onLoad.call(c);
				delete c.onLoad;
			};

			for (var c1 in c) {
				c1 = c[c1];
				if (!c1) continue;

				if (c1.onLoad) {
					c1.onLoad.call(c1);
					delete c1.onLoad;
				};
			};
		};
	};

	/**
	* 往模块工程JF注册一个功能模块.请在JF.Init方法前调用
	* @public
	* @name JF#AddModule
	* @function
	* @param {string} key 模块的id
	* @param {Object} module 模块的实例
	*/
	pub.AddModule = function (key, module) {
		if (p._modules[key]) {
			JF.log("Module with key '" + key + "' has beed registered!");
			return;
		};
		p._modules[key] = module;
		//register namespace
		pub[key] = module;
		return pub;
	};
	/**
	* 根据id获取指定注册的模块
	* @public
	* @function
	* @name JF#GetModule
	* @param {string} key 模块的id
	*/
	pub.GetModule = function (key) {
		return p._modules[key];
	};
	/**
	* AddModule 和 GetModule 的快捷方法。当没有指定module参数时想到于调用了JF.GetModule方法;当指定了module参数时，相当于调用了JF.AddModule方法
	* @public
	* @function
	* @name JF#M
	* @param {string} key 模块的id
	* @param {Object} module 模块实例
	* @returns 返回JF或者模块实例
	*/
	pub.M = function (key, module) {
		if (arguments.length == 1) {
			return pub.GetModule(key);
		};
		if (arguments.length == 2) {
			return pub.AddModule(key, module);
		};
		return null;
	};
	/**
	* 简单的html模板解析方法
	* @public
	* @function
	* @name JF#EvalTpl
	* @example
	*	var str="<a href=/u/%uid%>%username%</a>",
	*		data={uid:1,username:'levin'};
	*	alert(JF.EvalTpl(str,data));
	*	//提示信息为："<a href=/u/1>levin</a>"
	* @param {string} str html模板，字段用%包含
	* @param {Object} data json数据
	*/
	pub.EvalTpl = function (str, data) {
		var result;
		var patt = new RegExp("%([a-zA-z0-9]+)%");
		while ((result = patt.exec(str)) != null) {
			var v = data[result[1]] || '';
			str = str.replace(new RegExp(result[0], "g"), v);
		};
		return str;
	};
	/**
	* 获取指定长度的随机字符串。注意：仅仅由数字和字母组成
	* @public
	* @function
	* @name JF#RdStr
	* @param {int} size 随机字符串的长度
	* @param {Boolean} plusTimeStamp 是否加上当前时间戳
	*/
	pub.RdStr = function (size, plusTimeStamp) {
		var size0 = 8;
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		size = size || size0; size = size < 1 ? size0 : size; size = size > chars.length ? size0 : size;
		var s = '';
		for (var i = 0; i < size; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			s += chars.substring(rnum, rnum + 1);
		};
		if (plusTimeStamp) {
			s += new Date().getTime();
		};
		return s;
	};
	/**
	* 即:function(){return false;}
	* @public
	* @function
	* @name JF#NoPropagation
	*/
	pub.NoPropagation = function () { return false; };
	/**
	* NoopHandler，即e.stopPropagation();e.preventDefault();
	* @public
	* @function
	* @name JF#NoopHandler
	*/
	pub.NoopHandler = function (e) {
		e.stopPropagation();
		e.preventDefault();
	};
	/**
	* 获取字符串的长度，一个汉字的字符长度为2
	* @public
	* @function
	* @name JF#charLength
	* @param {string} str 字符串
	* @returns 整型数值
	*/
	pub.charLength = function (str) {
		var nstr = str.replace(/[^x00-xff]/g, "JJ");
		return nstr.length;
	};
	/**
	* 截断字符串
	* @public
	* @function
	* @name JF#Tail
	* @param {string} str 待截断的字符串
	* @param {int} size 截断长,注:1个中文字符长度为2
	* @param {string} tailStr 截断后加在末尾的小尾巴,默认"..."
	* @returns 截断后的字符串
	*/
	pub.Tail = function (str, size, tailStr) {
		str = $.trim(str);
		var cLen = pub.charLength(str);
		size = size <= 0 ? cLen : size;
		if (size >= cLen) return str;
		while (pub.charLength(str) > size) {
			str = str.substr(0, str.length - 1);
		};
		str += (tailStr || "...");
		return str;
	};
	/**
	* document.getElementById的快捷方法
	* @public
	* @function
	* @name JF#g
	* @param {string} id 元素id
	* @returns 返回指定id的dom对象
	*/
	pub.g = function (id) {
		return document.getElementById(id);
	};
	/**
	* window.console.log的快捷方法
	* @public
	* @function
	* @name JF#log
	* @param {Object} obj log的对象
	*/
	pub.log = function (obj) {
		if (!p.opts.debug) return;
		if (window['console'] && window['console'].log) {
			window['console'].log(obj);
		}
	};

	/**
	* 获取指定的URL查询字符串
	* @public
	* @function
	* @name JF#getUrlParam
	* @param {String} name 查询字符串的键名
	*/
	pub.getUrlParam = function (name) {
		var paramStr = location.search;
		if (paramStr.length == 0) return null;
		if (paramStr.charAt(0) != '?') return null;
		paramStr = unescape(paramStr);
		paramStr = paramStr.substring(1);
		if (paramStr.length == 0) return null;
		var params = paramStr.split('&');
		for (var i = 0; i < params.length; i++) {
			var parts = params[i].split('=', 2);
			if (parts[0] == name) {
				if (parts.length < 2 || typeof (parts[1]) == "undefined" || parts[1] == "undefined" || parts[1] == "null") return "";
				return parts[1];
			}
		}
		return null;
	};
	/**
	* 获取url的查询字符串并转换为json对象.需约定查询字符串是json字符串
	* @public
	* @function
	* @name JF#getUrlJson
	*/
	pub.getUrlJson = function () {
		var paramStr = location.search,
			retVal = {};
		if (paramStr.length == 0 || paramStr.charAt(0) != '?') return retVal;
		paramStr = unescape(paramStr);
		paramStr = paramStr.substring(1);
		if (paramStr.length == 0) return retVal;

		try {
			retVal = JSON.parse(paramStr);
		} catch (e) {

		}
		return retVal;

	};
	/**
	* 设置指定的URL查询字符串
	* @public
	* @function
	* @name JF#setUrlParam
	* @param {String} param 查询字符串的键名
	* @param {String} paramVal 查询字符串的键值
	* @param {String} url 指定的url。不若不指定则默认location.href
	*/
	pub.setUrlParam = function( param, paramVal, url) {

		url = url || location.href;

		var newAdditionalURL = "",
			tempArray = url.split("?"),
			baseURL = tempArray[0],
			additionalURL = tempArray[1],
			temp = "";
		
		if (additionalURL) {
			tempArray = additionalURL.split("&");
			for (i=0; i<tempArray.length; i++){
				if(tempArray[i].split('=')[0] != param){
					newAdditionalURL += temp + tempArray[i];
					temp = "&";
				}
			}
		}
		var rows_txt = temp + "" + param + "=" + paramVal,
			retVal = baseURL + "?" + newAdditionalURL + rows_txt;
		
		return retVal;
	};
	/**
	* ajax json post，适用于asp.net mvc ajax json post
	* @public
	* @function
	* @name JF#jsonPost
	* @param {String} url ajax url
	* @param {Object} opts options
	*/
	pub.jsonPost = function (url, opts) {

		opts = opts || {};
		if (opts.data) {
			opts.data = JSON.stringify(opts.data);
		}
		var opts0 = {
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			type: "POST"
		};
		var xhrObj = $.ajax(url, $.extend(opts0, opts));

		return xhrObj;

	};

	/**
	* ajax json get，适用于asp.net mvc ajax json get request
	* @public
	* @function
	* @name JF#jsonGet
	* @param {String} url ajax url
	* @param {Object} opts options
	*/
	pub.jsonGet = function (url, opts) {

		opts = opts || {};
		var opts0 = {
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			type: "GET"
		};
		var xhrObj = $.ajax(url, $.extend(opts0, opts));

		return xhrObj;

	};
	/**
	* 指定的文件是否是图片
	* @public
	* @function
	* @name JF#isImg
	* @param {String} file 文件路径
	*/
	pub.isImg = function(file) {
	    file = file.toLowerCase();
	    var isImg = false;
	    var arrImg = ['.jpg','.png','.gif','.jpeg'];
	    for (var i = 0; i < arrImg.length; i++) {
	        isImg = (file.substr(file.lastIndexOf(arrImg[i])) == arrImg[i]);
	        if (isImg) {
	            break;
	        }
	    }
	    return isImg;
	};

	/**
	 * 获取iframe的window对象
	 * @public
	 * @function
	 * @name JF#ifWin
	 * @param {String} id iframe的id
	 */
	pub.ifWin = function (id) {
		var el = document.getElementById(id);
		return (el.contentWindow || el.contentDocument);
	};
	/**
	 * 当前useragent是否IE6
	 */
	pub.isIE6 = function(){
		return (typeof document.body.style.maxHeight === "undefined");
	};

	/**
	 * 指定的字符串是否具有指定的后缀
	 * @public
	 * @function
	 * @name JF#endsWidth
	 * @param {String} str 指定的字符串
	 * @param {String} suffix 指定的后缀
	 */
	pub.endsWidth = function(str,suffix){
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	};

	//给外部调用（例如android的webview调用)
	pub.onLoad = p.onLoaded;

	return pub;

})(window["jQuery"]);

//常用简单的JQ插件
;(function ($) {
	/**
	* 将一个form表单序列化成json对象
	* @public
	* @function
	* @name $.fn.serializeJSON
	* @example
		$("#formxxx").serializeJSON();
	*/
	$.fn.serializeJSON = function () {
		var json = {};
		jQuery.map($(this).serializeArray(), function (n, i) {
			json[n['name']] = n['value'];
		});
		return json;
	};
	/**
	 * 绑定css3的animateend事件
	 * @public
	 * @function
	 * @name $.fn.onAnimated
	 * @param {Function} cbk 事件处理函数
	 */
	$.fn.onAnimated = function (cbk) {
	
		return this.each(function(){
		
			$(this).bind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd",cbk);
			
		});
		
	};
	/**
	 * transitionend
	 * @public
	 * @function
	 * @name $.fn.onTransitioned
	 * @param {Function} cbk 事件处理函数
	 */	
	$.fn.onTransitioned = function (cbk) {

		return this.each(function () {

			$(this).bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", cbk);

		});

	};

})(jQuery);