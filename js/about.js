JF.M("about",(function(){
	var p ={},pub={},
		gui = require('nw.gui');
	
	p.C= {
		onLoad:function(){

			$(window).on("onConfigLoaded",function(e){
				setTimeout(function(){
					JF.base.showTip('HostSpirit V'+JF.data.configData.version);
					$("#txtVersion").html(JF.data.configData.version);
				},200);
				
			});

			$("#aboutBody").on("click","a",function(e){

				gui.Shell.openExternal(this.href);

				return false;

			});
		}
	};
	
	pub.onLoad = function(){JF.LoadSub(p);};
	pub.init = function(){JF.InitSub(p);};
	return pub;
})(jQuery));