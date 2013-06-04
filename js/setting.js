JF.M("setting",(function(){
	var p ={},pub={},
		fs = require('fs'),
		path = require('path');
	
	p.host = {
		V:{
			$btnSave:$("#btnSave"),
			$cfgList:$("#cfgList"),
			tpl:'<li id="file_%name%" data-name="%name%" data-path="%path%">'+
					'<h3>%name%</h3>'+
					'<div class="f_size">%size%</div>'+
					'<div class="f_mtime">%mtime%</div>'+
					'<div class="f_acts">'+
						'<a class="mod_nodrag btn_edit" href="#" rel="%name%" data-path="%path%"><i class="icon-edit"></i></a>'+
						'<a class="mod_nodrag btn_del" href="#" rel="%name%" data-path="%path%"><i class="icon-remove"></i></a>'+
					'</div>'+
				'</li>',
			show:function(){
				var data = JF.data.validFiles.slice(0),
					tempFile = "";

				this.showFileDetail(data,function(){
					data.shift();
				});

			},//show
			showFileDetail:function(data,onOk){

				if(!data.length){
					$(window).trigger('onSettingsShowed');
					return;
				};

				var fileObj = data[0];

				fs.lstat(fileObj.path,function(err,stats){

					if(err){
						JF.alert(err.toString());
						return;
					}

					stats.ctime = new Date(stats.ctime.getTime());
					stats.mtime = new Date(stats.mtime.getTime());

					var fdata = {
						"name":fileObj.name,
						"path":fileObj.path,
						"size":(stats.size/1000).toFixed(3)+'kb',
						"ctime":stats.ctime.toString("yyyy-MM-dd HH:mm:ss"),
						"mtime":stats.mtime.toString("yyyy-MM-dd HH:mm:ss")
					};

					p.host.V.$cfgList.append(JF.EvalTpl(p.host.V.tpl,fdata));

					onOk();

					p.host.V.showFileDetail(data,onOk);

				});
			}//showFileDetail
		},
		M:{
			selectedFiles:[]
		},
		C:{
			clActive:'active',
			onLoad:function(){

				$(window).on("onConfigLoaded",function(e){

					JF.data.files.load();

					p.host.M.selectedFiles = JF.data.configData.files;

				}).on('onSettingsShowed',function(e){

					p.host.C.updateSelectedFiles();

				}).on('onFilesLoaded',function(e){

					p.host.V.show();

				});

				p.host.V.$cfgList.on("click.select","li",function(e){
					
					var $me = $(this),
						clActive = p.host.C.clActive;
					if ($me.hasClass(clActive)) {
						$me.removeClass(clActive);
						p.host.C.updateStatus();
						return false;
					};
					$me.addClass(clActive);
					p.host.C.updateStatus();
					return false;

				}).on("click.del",".btn_del",function(e){
					JF.data.files.remove({
						name:this.rel,
						path:this.getAttribute('data-path')
					});
					return false;
				}).on("click.edit",".btn_edit",function(e){

					JF.editor.show(JF.data.fileData[this.rel],{
						name:this.rel,
						title:'Edit - '+this.rel,
						path:this.getAttribute('data-path'),
						isNew:false
					});

					return false;
				});

				//save button
				p.host.V.$btnSave.on("click",function(e){
					
					JF.data.config.save(p.host.M.selectedFiles,function(){
						p.host.V.$btnSave.addClass('hide');
					});

				});

				// New button
				$("#btnNew").on("click",function(e){
					JF.editor.show("",{isNew:true});
				});

			},
			updateSelectedFiles:function(){
				var files = p.host.M.selectedFiles,
					len = files.length;

				for (var i = len - 1; i >= 0; i--) {
					$('#file_'+files[i].name).addClass(p.host.C.clActive);
				};
			},
			updateStatus:function(){
				var $files = p.host.V.$cfgList.find("."+this.clActive),
					files = [];

				$files.each(function(i,o){
					files.push({
						'name':o.getAttribute('data-name'),
						'path':o.getAttribute('data-path')
					});
				});

				JF.base.refreshConfig(files);
				p.host.M.selectedFiles = files;

				if (JF.data.config.isChange(files)) {
					p.host.V.$btnSave.removeClass('hide');
				}else{
					p.host.V.$btnSave.addClass('hide');
				};

			}
		}
	};
	
	pub.onLoad = function(){JF.LoadSub(p);};
	pub.init = function(){JF.InitSub(p);};
	return pub;
})(jQuery));