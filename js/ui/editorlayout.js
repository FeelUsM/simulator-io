UI.init(function(system) {
	console.log('UI.init editorlayout.js # 1')
	var handler = function() {
		// toggle chatbox
		$('#chatbox').toggle(Config.layoutShowChat);
	
		// calculate sizes
		var toolBarWidth = window.innerWidth;
		var toolBarHeight = $('#toolbar').outerHeight(true);
		
		var toolBoxWidth = $('#toolbox').outerWidth(true);
		var toolBoxHeight = window.innerHeight - toolBarHeight;

		var boardX = toolBoxWidth;
		var boardY = toolBarHeight;
		
		var chatWidth = $('#chatbox').outerWidth(true);
		if(!Config.layoutShowChat) chatWidth = 0;
		
		var boardWidth = window.innerWidth - toolBoxWidth - chatWidth;
		var boardHeight = toolBoxHeight;

		
		// fix all sizes
		//var space = $('#toolbox').outerHeight(true) - $('#toolbox').height(); // ERROR FIX
		$('#toolbox').height(toolBoxHeight);
		$('#chatbox').height(toolBoxHeight);
		$('#tooltipBar').width(boardWidth);
		$('#tooltipBar').css('left', boardX + 'px');

		// send update to renderer
		system.renderer.resizeRenderPanel([boardX, boardY], [boardWidth, boardHeight]);

		// update sub layouts
		// Event.send('updateSubLayouts'); // NO EVENT LISTENER
	}

	Event.on('windowResize', handler);
	
	Event.on('triggerLayoutUpdate', handler);

	Event.on('toggleChat', function() {
		handler();
	});
	
	handler();
});