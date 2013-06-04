JF.M("base",(function(){
	var p ={},pub={},
		gui = require('nw.gui'),
		fs = require('fs');
	
	p.V = {
		tpl0:'No settings have been enabled!',
		$status:$("#appStatus"),
		$tip:$("#appTip"),
		$navCollapse:$("#navCollapse"),
		$secA:$("#secA"),
		refreshConfig:function(files){
			var len = files.length;
			if (len==0) {
				this.$status.html(this.tpl0);
				return;
			};
			var html = [];
			for (var i = len - 1; i >= 0; i--) {
				html.push('<span class="badge_fname">'+files[i].name+'</span>');
			};

			this.$status.html(html.join('&nbsp;+&nbsp;'));

		}
	};

	p.M={
		tipTimer:null,
		isBusy:false
	};

	p.C={
		onLoad:function(){
			$("#btnClose").on("click",function(e){

				var win = gui.Window.get();
				win.close();
				return false;

			});

			$("#btnFullscreen").on("click",function(e){
				var win = gui.Window.get();
				win.toggleFullscreen();
				
				return false;
			});

			$("#btnMinSize").on("click",function(e){
				var win = gui.Window.get();
				win.minimize();
				return false;
			});

			$("#btnNavbar").on("click",function(e){

				if (p.V.$navCollapse.hasClass('in')) {
					p.V.$secA.removeClass('sec_collapsein');
				}else{
					p.V.$secA.addClass('sec_collapsein');
				};

			});

			//minimize to tray
			this.initTray();

			$(window).on('onConfigLoaded',function(e,d){
				if (d.err) {
					JF.alert.show(d.err.toString(),{
						title:"Error on Loading HostSpirit's config File!"
					});
				}else{
					pub.refreshConfig(JF.data.configData.files);
				}
			});

			JF.data.config.load();

		},
		initTray:function(){
			// Reference to window and tray
			var win = gui.Window.get(),
				tray;

			// Get the minimize event
			win.on('minimize', function() {
				// Hide window
				this.hide();

				// Show tray
				tray = new gui.Tray({ 
					'icon': 'icon.png'
				});
				tray.tooltip = 'HostSpirit';
				// Show window and remove tray when clicked
				tray.on('click', function() {
					win.show();
					this.remove();
					tray = null;
				});
			});
		}//initTray
	};

	pub.refreshConfig = function(files){
		p.V.refreshConfig(files);
	};


	pub.reload = function(){
		var win = gui.Window.get();
		win.reload();
	};

	pub.showTip = function(txt,timeout){
		clearTimeout(p.M.tipTimer);
		p.V.$tip.html(txt).show();
		p.M.isBusy=true;
		if (!timeout) {
			return;
		};
		p.M.tipTimer = setTimeout(function(){

			pub.hideTip();

		},timeout);
	};
	pub.hideTip = function(){
		clearTimeout(p.M.tipTimer);
		p.V.$tip.hide();
		p.M.isBusy = false;
	};

	pub.isBusy = function(){
		return p.M.isBusy;
	};

	pub.onLoad = function(){JF.LoadSub(p);};
	pub.init = function(){JF.InitSub(p);};
	return pub;
})(jQuery));