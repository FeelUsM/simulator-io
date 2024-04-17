UI.init(function(system) {
	var scrollAreaObj = ScrollArea.init(ScrollArea.find('chat'));
	
	function updateUserList()
	{
		var users = system.board.users.users;
		var jqList = $('#chatbox .userList ul');
		jqList.empty();

		for(var i = 0; i < users.length; i++)
		{
			var jqItem = $('<li></li>').data('uid', users[i].userId).data('name', users[i].sessionName).appendTo(jqList);
			var jqColor = $('<div></div>').addClass('color').appendTo(jqItem);
			var jqName = $('<div></div>').addClass('name').appendTo(jqItem);
			
			var color = system.board.users.getColorById(users[i].n);
			
			jqName.text(users[i].sessionName);
			jqName.click(function() {
				var name = $(this).parent().data('name');
				Pages.go("/profile/" + name);
			});
			jqColor.css('background-color', '#' + color);
		}
		
		updateLayout();
	}
	
	function updateLayout()
	{
		var jqChat = $('#chatbox');
		var jqHistory = jqChat.find('.history');
		var jqHistoryContent = jqChat.find('.history .content');
		var jqInput = jqChat.find('.input');

		if(jqHistory.size() == 0) return;

		var historyHeight = jqChat.outerHeight(true) - jqHistory.position().top - jqInput.outerHeight(true) - 4;
		jqHistory.height(historyHeight);
		
		// update scroll
		var scrollDown = false;
		var height0 = scrollAreaObj.getHeight();
		if(height0 == scrollAreaObj.getPos()) scrollDown = true;
		scrollAreaObj.update();
	
		var height1 = scrollAreaObj.getHeight();
		if(height0 < 0 && height1 >= 0) scrollDown = true;
		
		if(scrollDown) scrollAreaObj.setPos( height1 );
		scrollAreaObj.update();
	}
	
	function initChat()
	{
		var jqTextArea = $('#chatbox .input textarea');
		jqTextArea.keydown(function(event) {
			if(event.which == 13)
			{
				var txt = jqTextArea.val().trim();
			
				// send
				if(txt != '')
				{
					addMsg(Config.boardServerState.token, txt);
					Backend.postChatMessage(txt);
				}
				
				// clear
				jqTextArea.val('');
				
				return false;
			}
		});
		
		updateLayout();
	}	
	
	function addMsg(token, msg, action)
	{
		var user = system.board.users.getUserByToken(token);
		var lines = msg.split('\n');
		
		var jqHistory = $('#chatbox .history .content');
		var jqItem = $('<div></div>').addClass('chatItem').appendTo(jqHistory);
		if(action) jqItem.addClass('action');
		
		var jqName = $('<span></span>').addClass('name').appendTo(jqItem);
		var jqMsg = $('<span></span>').addClass('msg').appendTo(jqItem);

		jqName.text(user.sessionName + (action ? ' ' : ': ') );

		for(var i = 0; i < lines.length; i++)
		{
			var jqLine = $('<span></span>').text(lines[i]);

			if(i != 0) jqMsg.append($('<br />'));
			jqMsg.append(jqLine);
		}
		
		// scroll down if already scrolled down
		var scrollDown = false;
		
		var height0 = scrollAreaObj.getHeight();
		if(height0 == scrollAreaObj.getPos()) scrollDown = true;
		
		scrollAreaObj.update();
	
		var height1 = scrollAreaObj.getHeight();
		if(height0 < 0 && height1 >= 0) scrollDown = true;
		
		if(scrollDown) scrollAreaObj.setPos( height1 );
		
		scrollAreaObj.update();
	}
	
	Event.on('userJoinChat', function(data) {
		if(data.recent && Config.boardServerState.token != data.token)
		{
			addMsg(data.token, "has joined", true);
		}
	});
	
	Event.on('userLeaveChat', function(data) {
		addMsg(data.token, "has left", true);
	});
	
	Event.on('updateUserList', function() {
		updateUserList();
	});
	
	Event.on('foreignMsg', function(data) {
		var token = data.token;
		var msg = data.msg;
		addMsg(token, msg);
	});
	
	Event.on('updateSubLayouts', function() {
		updateLayout();
	});
	
	initChat();
});