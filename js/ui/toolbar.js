UI.init(function(system) {
	console.log('UI.init toolbar.js # 1')
	var lastDoButtonState = null;
	var toolsImg = new Image();
	//toolsImg.src = 'https://simulator.io/res/sprite.svg';
	//toolsImg.src = 'https://raw.githubusercontent.com/FeelUsM/simulator-io/master/res/sprite.svg';
	//toolsImg.crossOrigin="anonymous"
	toolsImg.src = global_sprite_svg

	Event.onKey('button', 'run', function() {
		if(Config.currentBoardMeta.readonly) // is readonly?
		{
			Event.send('openMessage', {
				title: 'Read-only',
				text: "<p>You don't have write access to this board.<br/>Please contact the board owner.</p>" +
						"<p>Click <b>Fork</b> to create an editable copy of the board in your workspace.</p>",
				error: true
			});
		}
		else // is snapshot!
		{
			var mode = system.getMode();
			mode = 1 - mode; // new mode
			Event.send('setMode', mode);
		}
	});

	Event.onKey('button', 'reset', function() {
		Event.send('resetSimulation');
	});

	Event.on('setMode', function(mode) { // update RUN/EDIT button
		var button = Button.find("run");
		button.toggleClass('iconRun', mode == 0);
		button.toggleClass('iconEdit', mode == 1);
		button.find('.text').text(mode == 0 ? "RUN" : "EDIT");

		$('.tbBuild').toggle(mode == 0);
		$('.tbSimulator').toggle(mode == 1);
		
		// update do buttons
		if(mode == 0)
		{
			updateDoButtons();
		}
	});

	Event.onKey('button', 'undo', function() {
		if(system.getMode() != 0) return;
		
		Event.send('localUndo');
	});
	
	Event.onKey('button', 'redo', function() {
		if(system.getMode() != 0) return;
		
		Event.send('localRedo');
	});
	
	Event.onKey('button', 'openWorkspace', function() {
		Pages.go('/user/boards');
	});
	
	Event.onKey('button', 'openFork', function() {
		Event.send("openForkOverlay");
	});

	// chat button
	Event.onKey('button', 'toggleChat', function() {
		Config.layoutShowChat = !Config.layoutShowChat;
		var button = $('#toolbar .iconChat');
		button.toggleClass('highlight', Config.layoutShowChat);
		if(Config.layoutShowChat)
		{
			button.removeClass('unread');
			unregisterToggle(button, "unreadBlink");
		}
		Event.send('toggleChat');
		
		if(Config.layoutShowChat)
		{
			$('#chatbox div.input textarea').focus();
		}
	});
	
	Event.on('foreignMsg', function(data) {
		if(!Config.layoutShowChat)
		{
			var button = $('#toolbar .iconChat');
			if(!button.hasClass('unread'))
			{
				button.addClass('unread');
				registerToggle(button, "unreadBlink", 800);
			}
		}
	});
	
	// account dropdown
	/*Event.onKey('button', 'openAccount', function() {
		$('#toolbar .accDropdown').show();
	});
	
	$(document).mouseup(function(e) {
		$('#toolbar .accDropdown').hide();
	});
	
	$('#toolbar .accDropdown li').click(function() {
		var key = $(this).data('key');
		Event.send('buttonAccount', {key:key, n:0});
	});*/
	
	Event.on('userStatusChange', function() {
		var isLoggedIn = Backend.isLoggedIn();

		$('.tbStatic .login').toggle(!isLoggedIn);
		$('.tbStatic .register').toggle(!isLoggedIn);
		$('.tbStatic .workspace').toggle(isLoggedIn);
	});

	Event.on('setBoardLiveType', function(type) {
		var showTeamButtons = true;
		var isLoggedIn = Backend.isLoggedIn();
		
		if(!isLoggedIn) showTeamButtons = false;

		if(type == 1) // snapshot session
		{
			showTeamButtons = false;
		}

		$('.tbStatic .teamButtons').toggle(showTeamButtons);
	});

	Event.on('setBoardTitle', function(arg) {
		var val2 = '';
		if(!!arg.snapshot)
		{
			val2 = arg.snapshot;
		}
		else if( Config.currentBoardMeta.readonly )
		{
			val2 = '(readonly)';
		}

		$('#toolbar .boardTitle h2 span.val1').text(arg.title);
		$('#toolbar .boardTitle h2 span.val2').text(val2);

		$('#toolbar .boardTitle').toggleClass('titleEditable', true)// !(Config.currentBoardMeta.readonly || !Config.boardServerState));

		MetaData.setPageTitle(arg.title);
	});

	Event.on('saveText', function(txt) {
		$('div.saveText').html(txt);
	});

	Event.on('saveState', function(state) {
		if(state == 0)  Event.send('saveText', '&nbsp;');
		if(state == 1)  Event.send('saveText', 'Saving...');
		if(state == 2)  Event.send('saveText', 'All changes saved');
		if(state == 3)  Event.send('saveText', 'Unsaved changes. Click <b>Link</b> to save.'); //  or <b>Fork</b>
			 //system.previewMgr.announceChange()
	});

	$('.boardTitle .val1').click(function() {
		if(Config.currentBoardMeta.readonly) return; // not in readonly mode

		if($(this).parents('.titleEditable').size() == 0) return;

		Event.send('openRenameBoard', {
			ctx: Config.currentBoardMeta.urlid,
			title: Config.currentBoardMeta.title,
			rename: true
		});
	});
	
	Event.on('userDataOwn', function(data) {
		var img = $('#toolbar .workspace').find('img');
		img.attr('src', data.avatarSmall);
	});

	// do buttons (undo/redo) state
	Event.on('updateDoButtonsState', function(state) {
		lastDoButtonState = state;
		updateDoButtons();
	});

	function updateDoButtons()
	{
		Button.setEnabled("undo", lastDoButtonState.undo);
		Button.setEnabled("redo", lastDoButtonState.redo);
	}

	function initToolTip(key)
	{
		var jq = Button.find(key);
		Tooltip.register(jq, jq.data('title'), jq.data('desc'), function(imgSize) {
			if( !(toolsImg.width > 0) ) return null;

			var originalSize = toolsImg.height;

			// prepare rendering
			var imgId = ~~jq.data('imgid');

			// prepare canvas
			var jqCanvas = $('<canvas>');
			jqCanvas[0].width = imgSize;
			jqCanvas[0].height = imgSize;

			// render!
			var ctx = jqCanvas[0].getContext('2d');
			ctx.drawImage(toolsImg, -imgSize * imgId, 0, imgSize * (toolsImg.width / originalSize), imgSize);

			return jqCanvas[0].toDataURL();
		});
	}

	// init
	initToolTip('toolAdd');
	initToolTip('toolDelete');
	initToolTip('toolDiode');
	initToolTip('toolSelect');
	initToolTip('toolText');

	Event.send('userStatusChange');
});

