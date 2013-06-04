JF.M("editor",(function(){
	var p ={},pub={},
		fs = require('fs');
	
	p= {
		V:{
			$main:$("#hostEditor"),
			$body:$("#iptBody"),
			$title:$("#editorTitle"),
			$name:$("#iptName")
		},
		M:{
			regexName:/^[a-zA-Z0-9_\u4e00-\u9fa5-\-]+$/,//alpha,number,underline,dashline,chinese
			defaultTitle:'Add Host Settings',
			duration:0,
			timer:null
		},
		C:{
			onLoad:function(){
				p.V.$main.modal({
					backdrop:'static',
					show:false
				}).on("hide",function(){
					clearTimeout(p.M.timer);
					p.C.reset();
				});

				$("#btnSaveHost").on('click',function(e){
					p.C.save();
				});

			},
			save:function(){
				//get data 
				var data = {
					name:p.V.$name.val(),
					body:p.V.$body.val()
				},
				$cgName = $("#cgName").removeClass('error');
				//validate data
				var isNameValid = p.M.regexName.test(data.name);
				if (!isNameValid) {
					JF.alert.show('Host Setting Name must be "Alpha,number,underline,dashline or chinese!',{title:'Invalid Host Setting Name!'});
					$cgName.addClass('error');
					return;
				};

				//whether file name has been used
				var udf;
				if (p.M.isNew && typeof(JF.data.fileData[data.name])!=='undefined') {
					JF.alert.show('A file with name "'+data.name+'" exists!',{title:'Invalid Host Setting Name!'});
					$cgName.addClass('error');
					return;
				};

				data.path = JF.data.hostFolder+'hosts.'+data.name;

				JF.base.showTip('Saving File :'+data.path);

				fs.writeFile(data.path, data.body,function(err){
					JF.base.hideTip();
					if (err) {
						JF.alert.show(err.toString()+'\n'+data.path,{title:'Error when writing file!'});
						return;
					};

					//update the file data
					JF.data.fileData[data.name] = data.body;

					//update the config
					JF.data.config.save(JF.data.configData.files);

					//hide the modal
					pub.hide();

					//refresh the page
					if (p.M.isNew) {
						JF.base.reload();
					};


				});

			},
			show:function(txt,opts){
				
				txt = txt||'';

				opts = $.extend({},p.M,opts||{});
				opts.title = opts.title || p.M.defaultTitle;

				clearTimeout(p.M.timer);
				p.V.$body.val(txt);
				p.V.$title.html(opts.title);
				p.V.$name.val(opts.name);

				p.M.isNew = opts.isNew;

				if (!opts.isNew) {
					p.V.$name[0].setAttribute("readonly","readonly");
				}else{
					p.V.$name[0].removeAttribute("readonly");
				};

				p.V.$main.modal("show");

				if (opts.duration) {
					p.M.timer = setTimeout(function(){
						p.C.close();
					},opts.duration);
				};

			},//show
			reset:function(){
				p.V.$body.val("");
				p.V.$title.html(p.M.defaultTitle);
				p.V.$name.val("");
			},
			close:function(){
				p.V.$main.modal("hide");
			}
		}
	};
	
	pub.show = function(txt,opts){
		p.C.show(txt,opts);
	};

	pub.hide = function(){
		p.C.close();
	};

	pub.onLoad = function(){JF.LoadSub(p);};
	pub.init = function(){JF.InitSub(p);};
	return pub;
})(jQuery));