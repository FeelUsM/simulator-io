var Backend = {
	_socket: null,
	_currentLoadedBoard: null,
	_ready: true, // false, //always connected
	_msgQueue: [], // push new messages here; will be null once the backend is initialized

	_activeCallbacks: {},

	isReady: function(){
		return Backend._ready;
	},

	isLoggedIn: function(){
		return true; // always logged in
	},
	
	requestView: function(viewName){
		console.error('request view',viewName)
		//Backend._queueMsg('_reqView', {name: viewName});
	},

	loginWithToken: function(){
		var request = {}

		UI.ensure();

		var token = this._getToken();
		if(token) request.token = token;
		
		Backend._sendMsg('auth', request);
	},

	login: function(login, pass){
		var request = {
			login: login,
			pass: pass
		};

		UI.ensure();
		
		var token = this._getToken();
		if(token) request.token = token;
		
		Backend._queueMsg('auth', request);
	},
	
	logout: function()
	{
		this._killToken();
		Backend._queueMsg('logout');
	},

	register: function(name, mail, pass)
	{
		var request = {
			name: name,
			mail: mail,
			pass: pass
		};

		UI.ensure();
		
		Backend._queueMsg('register', request);
	},
	
	addBoard: function(title) {
		Backend._queueMsg('addBoard', {title: title});
	},
	
	sendTransaction: function(transaction) {
		if(Config.boardServerState)
		{
			Backend._queueMsg('transaction', transaction);
		}
		else
		{
			console.error("ERROR\tCannot send transaction"); // ERROR FIX
		}
		
		return 0;
	},
	
	joinBoard: function(id) {
		Backend._queueMsg('joinBoard', {id: id});
	},
	
	leaveBoard: function() {
		//Backend._queueMsg('leaveBoard');
		Config.boardServerState = null;
		Config.currentBoardMeta = null;
	},

	sendPreviewImage: function(title,number,buffer)
	{
		Backend._queueMsg('setPreviewImage', {	buffer: buffer.buffer	});
		/*
		id = title+'/'+number
		if(localStorage.getItem(id) !== null) {
			obj = JSON.parse(localStorage.getItem(id))
			obj.preview = buffer
			localStorage.setItem(id,JSON.stringify(obj))
		}
		else
			console.error('cannot save preview')*/
	},

	_updateBoard: function(bd) {
		"если title/snapshot отсутствует - сохраняем с новым time" 
		"если title/snapshot присутствует и data совпадает - тихо пропускаем"
		"если title/snapshot присутствует и data НЕсовпадает - выдаем сообщение и НЕ сохраняем"
		console.log('try to save',bd)
		if(localStorage.getItem(bd.title+'/'+bd.snapshot) === null) {
			bd.time = Date
			console.log('local save',bd.title,bd.snapshot,bd)
			localStorage.setItem(bd.title+'/'+bd.snapshot,JSON.stringify(bd))
			var number = bd.snapshot;
			if(localStorage.getItem(bd.title) !== null) {
				number = Math.max(+localStorage.getItem(bd.title),number)
			}
			localStorage.setItem(bd.title,number)
		}
		else {
			oldData = JSON.parse(localStorage.getItem(bd.title+'/'+bd.snapshot)).data
			if(JSON.stringify(bd.data)!=JSON.stringify(oldData))
				Event.send('openMessage', {title: bd.title+'/'+bd.snapshot, text: bd.title+'/'+bd.snapshot + ' already exist and differ. Skipping.'});
			else
				console.log('silent skip saving of '+bd.title+'/'+bd.snapshot)
		}

	},
	_saveBoard: function(data, preview, title, parent) {
		"для данногог titl-а подбирает подходящий snapshot и сохраняет под title/snapshot"
		var number=1;
		if(localStorage.getItem(title) !== null) {
			number = 1+ +localStorage.getItem(title)
		}
		// создаю объект и сохраняю
		var entry = {
			title    : title,
			urlId    : title,
			snapshot : number,
			parent   : parent,
			time     : Date(),
			data     : data,
			previewImage  : preview,
		}
		console.log('local save',title,number,entry)
		localStorage.setItem(title+'/'+number,JSON.stringify(entry))
		localStorage.setItem(title,number)
		return number;
	},

	loadBoard: function(urlId, snapshot) {
		/*Backend._queueMsg('loadBoard', {
			urlId: urlId,
			snapshot: snapshot
		});*/
		Config.boardServerState = null;
		Config.currentBoardMeta = null;
		if(localStorage.getItem(urlId) === null) {
			console.error('cannot find board',urlId)
			data = null
		} else {
			data = JSON.parse(localStorage.getItem(urlId+"/"+snapshot))
			console.log('load',urlId+"/"+snapshot)
		}
		that = this
		setTimeout(function(){
			that._socket.send('loadBoardResult', data)
		},0)
	},

	createSnapshot: function(cb) {
		Backend._pushCallback('snapshot', cb);
		Backend._queueMsg('createSnapshot', {});
	},

	createFork: function(title, data, cb) {
		Backend._pushCallback('fork', cb);
		Backend._queueMsg('createFork', {title: title, data: data});
	},

	createSnapshotFromLocal: function(title, curnumber, data, preview, cb) {
		number = Backend._saveBoard(data, preview, title, title+'/'+curnumber);
		cb({
			url: window.location.origin+window.location.pathname+"?board/"+title+'/'+number,
			rel:"/board/"+title+'/'+number,
			urlId:title,
			snapshot:number
		})
		/*
		Backend._pushCallback('snapshot', cb);
		Backend._queueMsg('createSnapshotFromLocal', {
			urlId: urlId,
			data: data
		});
		*/
	},

	createAnonymousBoard: function(title, data, preview, cb) {
		number = Backend._saveBoard(data, preview, title);
		cb({
			url: window.location.origin+window.location.pathname+"?board/"+title+'/'+number,
			rel:"/board/"+title+'/'+number,
			urlId:title,
			snapshot:number
		})
		/*
		var msg = {
			data: data,
			title: title
		};
		Backend._pushCallback('snapshot', cb);
		Backend._queueMsg('createAnonymousBoard', msg);*/
	},
	
	renameBoard: function(data, preview, curtitle, curnumber, title)
	{
		// проверка 
		if(localStorage.getItem(title)!==null) {
			return 0
		}
		return Backend._saveBoard(data, preview, title, curtitle+'/'+curnumber);
		/*
		Backend._queueMsg('renameBoard', {
			boardId: boardId,
			title: title
		});
		*/
	},

	requestProfile: function(name)
	{
		Backend._queueMsg('requestProfile', {name: name});
	},
	
	changePassword: function(pwOld, pwNew)
	{
		Backend._queueMsg('changePassword', {a:pwOld, b:pwNew});
	},

	resetPassword: function(login, cb) {
		Backend._pushCallback('resetPassword', cb);
		Backend._queueMsg('resetPassword', {login: login});
	},

	resetPasswordFinal: function(mail, hash, pass, cb) {
		Backend._pushCallback('resetPasswordFinal', cb);
		Backend._queueMsg('resetPasswordFinal', {
			mail: mail,
			hash: hash,
			pass: pass
		});
	},
	
	hashResult: function(id, hash)
	{
		Backend._queueMsg('hashResult', {id: id, hash: hash});
	},
	
	postChatMessage: function(msg) {
		Backend._queueMsg('postMsg', {msg: msg});
	},

	requestUserPresence: function(user) {
		Backend._queueMsg('requestUserPresence', user);
	},

	setPermissions: function(permissions) {
		Backend._queueMsg('setPermissions', permissions);
	},

	deleteBoard: function(name,snap)
	{
		localStorage.removeItem(name+'/'+snap)
		var maxnum = 0;
		for(var i=0; i<localStorage.length; i++){
			if(localStorage.key(i).includes('/') && localStorage.key(i).split('/')[0]==name && localStorage.key(i).split('/')[1]>maxnum){
				maxnum = +(localStorage.key(i).split('/')[1])
			}
		}
		if(maxnum==0)
			localStorage.removeItem(name)
		else
			localStorage.setItem(name,maxnum)

		// Backend._queueMsg('deleteBoard', {		boardId: boardId		});
	},

	uploadBoards: function(boards){
		for(const board of boards)
			this._updateBoard(board)
	},
	
	saveProfile: function(profile, cb)
	{
		Backend._queueMsg('saveProfile', profile);
		Backend._pushCallback('saveProfile', cb);
	},

	verifyMail: function(mail, hash, cb)
	{
		Backend._queueMsg('verifyMail', {
			mail: mail,
			hash: hash,
		});	
		Backend._pushCallback('verifyMail', cb);
	},

	resendVerifyMail: function()
	{
		Backend._queueMsg('resendVerifyMail');
	},

	isPassResetHashValid: function(mail, hash, cb)
	{
		Backend._queueMsg('isPassResetHashValid', {
			mail: mail,
			hash: hash,
		});	
		Backend._pushCallback('isPassResetHashValid', cb);
	},


	initBackendSystem: function() {
		this._socket = {
			events: [],
			on: function(event,cb) {
				if(!!this.events[event]) console.error('backend event',event,'already set')
				this.events[event] = cb
			},
			send: function(event, arg) {
				return this.events[event](arg)
			}
		};

		// socket state events
		this._socket.on('connect', function() {
			// hello msg to server
			Backend._sendMsg('hello', {vl: Config.versionLogic, vs: Config.versionStorage});

			// send login or post init backend
			if(!!Backend._getToken())
			{
				setLoginCallback(function() {});
				Backend.loginWithToken();
			}
			else // no token found?
			{
				Event.send('userStatusChange');
				Backend._postInitBackend();				
			}
		});

		this._socket.on('disconnect', function() {
			Backend._ready = false;

			if(Config.boardServerState) // live board? -> full size error
			{
				Event.send('fullSizeError', "Lost connection to server.");
			}
		});

		this._socket.on('reconnect', function() {		});

		// register custom handlers
		this._socket.on('_view', function(data){	Pages.viewLoaded(data.name, data.view);		});

		this._socket.on('serverError', function(data) {
			if(Config.currentBoardMeta) // board active? just show a small error
			{
				Event.send('serverError', data);
			}
			else // change to full size error
			{
				Event.send('fullSizeError', data);
			}
		});
		
		this._socket.on('authResult', function(data) {
			Event.send('loadState', {login: false});

			if(data != null && !!data.token)
			{
				Backend._setToken(data.token);
				Config.userId = data.uid;
				Config.userName = data.name;
				Config.userMail = data.mail;
				
				Event.send('loginResult', true);
				Event.send('userStatusChange');
			}
			else
			{
				Config.userId = null;
				Config.userName = '';
				Config.userMail = '';
				Config.boards = null;
				
				Event.send('loginResult', false);
			}

			if(!Backend.isReady())
			{
				Backend._postInitBackend();
			}
		});
		
		this._socket.on('logoutResult', function(data) {
			Config.userId = null;
			Config.userName = null;
			Config.userMail = null;
			Config.profile = null;
			Event.send('logoutComplete');
			Event.send('userStatusChange');
		});
		
		this._socket.on('registerResult', function(data) {
			if(data.success)
			{
				Event.send('closeOverlay');
				Event.send('registerSuccess');
			}
			else
			{
				if(!!data.invalid)
				{
					if(!!data.invalid.name) Validation.AddUnusable('Nick', data.invalid.name);
					if(!!data.invalid.mail) Validation.AddUnusable('Mail', data.invalid.mail);
					Event.send('validationUpdated');
				}
				else
				{
					console.error("ERROR\tRegistration failed on server side"); // todo ERROR FIX
					Event.send('closeOverlay');
					
					Event.send('openMessage', {error: true, title: 'Registration', text: 'Registration failed.'});
				}
			}
		});
		
		this._socket.on('joinBoardResult', function(data) {
			if(!data.error)
			{
				Backend._currentLoadedBoard = data;
			}
			else
			{
				Backend._currentLoadedBoard = null;
			}

			Event.send('joinBoardResult', data);
		});

		this._socket.on('loadBoardResult', function(data) {
			Backend._currentLoadedBoard = data;

			Event.send('loadBoardResult', data);
		});
		
		this._socket.on('boards', function() {
			data = []
			for(var i=0; i<localStorage.length; i++){
				if(localStorage.key(i).includes('/')){
					data.push(JSON.parse(localStorage.getItem(localStorage.key(i))))
				}
			}
			Config.boards = data;
			Event.send('userBoardsChange');
			Event.send('loadState', {boardList: false});
		});
		
		this._socket.on('profile', function(data) {
			Config.lastRequestedProfile = data;
			
			Event.send('profileResult', data);

			if(data && data.uid == Config.userId)
			{
				Config.profile = data;
				Event.send('userDataOwn', data);
			}			
		});
		
		this._socket.on('changePasswordResult', function(success) {
			if(success)
			{
				Event.send('openMessage', {title: 'Password changed', text: 'Your password was successfully changed'});
			}
			else
			{
				Event.send('openMessage', {error: true, title: 'Error', text: 'Failed to change password.'});
			}
		});
		
		this._socket.on('transaction', function(data) {
			Backend._socket.emit('confirmTransaction', data.id);
			Event.send('foreignTransaction', data);
		});
		
		this._socket.on('transactionResult', function(data) {
			if(data.result == 'reject')
			{
				Event.send('rejectTransaction', data);
			}
			else if(data.result == 'confirm')
			{
				Event.send('confirmTransaction', data);
			}
			else
			{
				console.error("ERROR\tInvalid transaction result: ", data.result);  // ERROR FIX
			}
		});
		
		this._socket.on('hashRequest', function(id) {					Event.send('hashRequest', id);						});
		
		this._socket.on('userJoin', function(data) {					Event.send('userJoinBoard', data);					});
		
		this._socket.on('userLeave', function(data) {					Event.send('userLeaveBoard', data);					});	
		
		this._socket.on('foreignMsg', function(data) {					Event.send('foreignMsg', data);						});

		this._socket.on('userPresence', function(data) {				Event.send('userPresenceUpdate', data);				});

		this._socket.on('snapshotResult', function(result) {			Backend._popCallback('snapshot')(result);			});

		this._socket.on('resetPasswordResult', function(result) {		Backend._popCallback('resetPassword')(result);		});

		this._socket.on('resetPasswordFinalResult', function(result) {	Backend._popCallback('resetPasswordFinal')(result);	});

		this._socket.on('createForkResult', function(result) {			Backend._popCallback('fork')(result);				});

		this._socket.on('updatePermissions', function(permissions) {	Event.send('updatePermissions', permissions);		});

		this._socket.on('updateTitle', function(result) {				Event.send('updateBoardTitle', result);				});

		this._socket.on('saveProfileResult', function(result) {			Backend._popCallback('saveProfile')(result);		});

		this._socket.on('verifyMailResult', function(result) {			Backend._popCallback('verifyMail')(result);			});

		this._socket.on('isPassResetHashValidResult', function(result) {Backend._popCallback('isPassResetHashValid')(result);});
	},

	_pushCallback: function(name, cb) {
		if(!!Backend._activeCallbacks[name])
		{
			console.log("ERROR\tDouble push of a callback: ", name);
		}

		Backend._activeCallbacks[name] = cb;
	},

	_popCallback: function(name) {
		if(!Backend._activeCallbacks[name])
		{
			console.log("ERROR\tCannot pop callback: ", name);
			return null;
		}

		var cb = Backend._activeCallbacks[name];
		Backend._activeCallbacks[name] = null;

		return cb;
	},

	_postInitBackend: function()
	{
		Backend._ready = true;

		while(Backend._msgQueue.length > 0)
		{
			var msg = Backend._msgQueue.shift();
			Backend._sendMsg(msg.type, msg.data);
		}
		Backend._msgQueue = [];

		Event.send('backendReady');
	},

	_queueMsg: function(type, data) { // call this if you want to send the message when the backend is initialized
		if(Backend._ready)
		{
			Backend._sendMsg(type, data);
		}
		else
		{
			Backend._msgQueue.push({
				type: type,
				data: data
			});
		}
	},

	_sendMsg: function(type, data) // call this if you want to send the message now
	{
		console.error('this._socket.emit',type, data)
		//this._socket.emit(type, data);
	},

	_getToken: function(){
		var token = $.cookie('stok');
		if(!!token) return token;
		
		return null;
	},
	
	_setToken: function(token){
		$.cookie('stok', token, { expires: 365 * 5, path: '/' });
	},
	
	_killToken: function()
	{
		$.removeCookie('stok', {path: '/' });
	}
};