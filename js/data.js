JF.M("data",(function(){
	var p ={},pub={},
		fs = require('fs'),
		path = require('path');

	//host files module
	pub.files={
		load:function(){
			fs.readdir(pub.hostFolder,function(err,files){

				if(err) {
					JF.alert.show(err.toString(),{
						title:'Error on Loading Host Setting Files!'
					});
					return;
				}

				pub.files._validate(files);
				pub.files._setFileData();

				delete pub.files._validate;
				delete pub.files._setFileData;

				$(window).trigger("onFilesLoaded");

			});
		},
		remove:function(fileObj){

			//whether the file is in use?
			var isInUse = false,
				files = JF.data.configData.files,
				len = files.length;

			for (var i = len - 1; i >= 0; i--) {
				if (files[i].name==fileObj.name) {
					isInUse = true;
					break;
				};
			};

			if (isInUse) {
				JF.alert.show('File is in use!\n"'+fileObj.path+'"!',{title:'Error when deleting file!'});
				return;
			};


			if (!window.confirm('Are you sure to delete the file "'+fileObj.path+'"?')) {
				return;
			};

			fs.unlink(fileObj.path, function(err){

				if (err) {
					JF.alert.show(err.toString()+'\n"'+fileObj.path+'"!',{title:'Error when deleting file!'});
					return;
				};

				JF.base.reload();

			});

		},
		_validate:function(files){
			if (!(files&&files.length)) {
				return;
			};

			var len = files.length,
				tempFile = null,
				tempFiles = [];

			for(var i = 0 ;i <len;i++){
				tempFile = files[i];
				if (tempFile.indexOf("hosts.")!==0) {
					continue;
				};
				if (JF.endsWidth(tempFile,".ini")) {
					continue;
				};
				tempFiles.push(tempFile);
			}

			tempFiles.sort();

			len = tempFiles.length;

			for (var i = 0; i < len; i++) {
				tempFile = tempFiles[i];
				JF.data.validFiles.push({
					'name':tempFile.replace('hosts.',''),
					'fname':tempFile,
					'path':path.join(pub.hostFolder,tempFile)
				});
			};

		},
		_setFileData:function(){
			var files= JF.data.validFiles,
				len = files.length,
				file = null;

			for (var i = len - 1; i >= 0; i--) {
				file = files[i];
				JF.data.fileData[file.name] = fs.readFileSync(file.path).toString();
			};
		}
	};

	//config module
	pub.config={
		load:function(){
			fs.exists(pub.configFile,function(exists){

				if (!exists) {
					fs.writeFile(pub.configFile,JSON.stringify(JF.data.configData),function(err){
						$(window).trigger("onConfigLoaded",[{
							isOk:true
						}]);
					});

					return;
				};

				JF.base.showTip('Load Config data...');

				fs.readFile(pub.configFile,function(err,data){

					JF.base.hideTip();

					if(err) {
						$(window).trigger("onConfigLoaded",[{
							'err':err
						}])
						return;
					}

					data = JSON.parse(data.toString());

					data.version = JF.data.configData.version;

					JF.data.configData = data;

					$(window).trigger("onConfigLoaded",[{isOk:true}]);

				});

			});

			//创建备份文件
			fs.exists(pub.hostFileBackup,function(exists){
				if (exists) {
					return;
				};
				var txt = fs.readFileSync(pub.hostFile);
				fs.writeFile(pub.hostFileBackup,txt,function(err){
					
				});
			});

		},//load
		save:function(files,cbk){
			if(JF.base.isBusy()){
				return;
			}
			var len = files.length;
			if (!len) {
				return;
			};
			JF.base.showTip('Merging data...');

			var txt = [];
			for (var i = 0; i < len; i++) {
				txt.push(JF.data.fileData[files[i].name]);
			};

			txt = txt.join('\n');

			JF.base.showTip('Writing hosts data...');
			fs.writeFile(pub.hostFile,txt,function(err){
				if (err) {
					JF.alert.show(err.toString(),{
						title:'Error when writing hosts data!'
					});
					JF.base.hideTip();
					return;
				};
				JF.base.showTip('Saving config data...');
				JF.data.configData.files = files;
				fs.writeFile(pub.configFile,JSON.stringify(JF.data.configData),function(err){
					JF.base.hideTip();
					JF.alert.show('Successfully Saved!',{duration:1500});
					if (cbk) {
						cbk();
					};
				});

			});
		},//save
		isChange:function(files){
			var files0 = JF.data.configData.files,
				len = files.length;

			if (len==0) {
				return false;
			};
			if (files0.length!=len) {
				return true;
			};

			var isChange = false;

			for (var i = len - 1; i >= 0; i--) {
				if (files[i].name!==files0[i].name) {
					isChange=true;
					break;
				};
			};

			return isChange;

		}//isChange
	};
	
	pub.hostFolder = 'C:/Windows/System32/drivers/etc/';
	pub.hostFile = 'C:/Windows/System32/drivers/etc/hosts';
	pub.configFile = 'C:/Windows/System32/drivers/etc/hosts.spirit.ini';
	pub.hostFileBackup = 'C:/Windows/System32/drivers/etc/hosts.hsbackup';

	pub.configData = {
		version:'1.0.1',
		files:[]
	};
	//host file data
	pub.fileData = {};
	pub.validFiles = [];

	pub.onLoad = function(){JF.LoadSub(p);};
	pub.init = function(){JF.InitSub(p);};
	return pub;
})(jQuery));