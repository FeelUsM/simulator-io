function EditorController()
{
	this.properties = {
		scroll: false,
		showMainNav: false,
	};
}

// prototype
EditorController.prototype = Object.create(ControllerBase.prototype);

// implementations
EditorController.prototype.getView = function()
{
	return 'editor';
}

EditorController.prototype.setup = function()
{
	var that = this;

	UI.ensure();

	Event.on('joinBoardResult', function(result) {
		if(!result.error)
		{
			that.boardLoadedComplete(result, 0);
		}
		else
		{
			var error = result.error;

			switch(error)
			{
				case 1:
					Event.send('fullSizeError', {code: 301, msg: 'No free slot'});
					break;

				case 2:
					Event.send('fullSizeError', {code: 302, msg: 'No permissions'});
					break;

				case 3:
					Event.send('fullSizeError', {type: 'error403'});
					break;

				default:
					Event.send('fullSizeError', {code: 304, msg: 'General join error; Status: ' + error});
					break;
			}
		}
	});

	Event.on('loadBoardResult', function(result) {
		if(result != null)
		{
			that.boardLoadedComplete(result, 1);
		}
		else
		{
			Pages.go('error404');
		}
	});

	Event.on('updateBoardTitle', function(title) {
		Config.currentBoardMeta.title = title;

		Event.send('setBoardTitle', {
			title: title
		});
	});
}

EditorController.prototype.switch = function(args, url, virtualPost)
{
	if(args.length == 1) // join board
	{
		Backend.joinBoard(args[0]);
	}
	else if(args.length == 2) // load snapshot
	{
		Backend.loadBoard(args[0], args[1]);
	}
	else if(args.length == 0) // Create anonymous board (local)
	{
		setTimeout(function() {
			Event.send('loadBoardResult', {
				title: 'noname board',
				data: { // board data
					s: false // not initialized yet
				}
			});
		}, 0);
		
	}
	else
	{
		Pages.go('error404');
	}

	Event.send('loadState', {board: true});

	if(mobileAndTabletcheck())
	{
		setTimeout(function() {
			Event.send('openMessage', {
				title: 'Mobile/Touch',
				text: 'Hi! We haven\'t fully implemented mobile/touch support for the editor yet. Sorry :-(',
				error: true
			});
		}, 500);
	}

	if(isOldBrowser())
	{
		setTimeout(function() {
			Event.send('openMessage', {
				title: 'Old browser',
				text: 'Hi! Apparently you\'re using an old browser which is not supported by simulator.io anymore. Please update your browser or use a different one.',
				error: true
			});
		}, 500);
	}
}

EditorController.prototype.leave = function()
{
	logicApp.system.renderer.setActive(false);

	if( logicApp.system.previewMgr.isActive() )
	{
		//logicApp.system.previewMgr.forcePreviewUpload();
		logicApp.system.previewMgr.setActive(false);
	}

	Backend.leaveBoard();
}

EditorController.prototype.boardLoadedComplete = function(result, type) // 0=join 1=load
{
	var isSnapshot = (type == 1);
	var isAnonymous = !result.urlId;
	var isReadonly = false;

	// update board server state
	if(Config.boardServerState != null || Config.currentBoardMeta != null) console.error("ERROR\tThere is already a board remote state");

	if(type == 0)
	{
		Config.boardServerState = {
			token: result.tok,
			urlid: result.urlid,
			permissions: result.permissions
		}
	}

	Config.currentBoardMeta = {
		urlid: result.urlId,
		snapshot: (!!result.snapshot) ? result.snapshot : null,
		title: result.title,
		readonly: false
	};

	if(isAnonymous)
	{
		Config.currentBoardMeta.title = "noname board";
	}

	MetaData.setPageTitle(result.title);

	// set permissions
	if(type == 0) // maybe we can find write-access
	{
		for(var i = 0; i < result.permissions.length; i++)
		{
			var item = result.permissions[i];
			
			if(Config.userId == item.id)
			{
				Config.currentBoardMeta.readonly = item.readonly ? true : false;
				isReadonly = Config.currentBoardMeta.readonly;
			}
		}
	}

	// reset board
	logicApp.system.board.reset();
	logicApp.system.previewMgr.reset();
	
	Event.send('setMode', 0); // go to build mode first to import everything
	Event.send('setTool', 1); // reset tool
	
	// renew storage options (especially the token)
	var storageOpt = {
		versionLogic: Config.versionLogic,
		versionStorage: Config.versionStorage,
		token: null,
		quadSize: Config.quadSize
	}
	if(type == 0) storageOpt.token = Config.boardServerState.token;
	logicApp.system.board.storage.setOpt(storageOpt);
	
	// import and activate ui
	if(result.data.s) // initialized?
	{
		logicApp.system.board.storage.importAll(result.data,isSnapshot);
		logicApp.system.renderer.minimapShow();
		logicApp.system.renderer.minimapHide();

		// switch to simulate mode if this is a snapshot or a readonly board
		if(type == 1 || isReadonly)
		{
			Event.send('setMode', 1);
			Event.send('setTool', 4); // simulator tool
		}
	}

	{ // set title
		var snapshotValue = null;

		if(isSnapshot && !!result.time)
		{
			//var dateStr = new Date(result.time).toLocaleString();
			snapshotValue = "Snapshot from " + new Date(result.time).getRelativeDateString();
		}

		Event.send('setBoardTitle', {
			title:    Config.currentBoardMeta.title,
			snapshot: Config.currentBoardMeta.snapshot   //snapshotValue
		});
	}

	LoadingBar.done();

	// turn off loading screen
	Event.send('loadState', {board: false});

	// user list (chat)
	// Event.send('updateUserList'); // NO EVENT LISTENER

	// update editor UI (scrollbars)
	Event.send('updateEditorUI');

	// set board live type
	Event.send('setBoardLiveType', type);

	// start renderer
	logicApp.system.renderer.setActive(true);

	// send visible event (=you can measure stuff in the dom now)
	Event.send('editorVisible');

	// start preview manager
	if( !(isAnonymous) ) // isSnapshot || isAnonymous || isReadonly
	{
		logicApp.system.previewMgr.setActive(true);		
	}
}

addController('EditorController', EditorController);