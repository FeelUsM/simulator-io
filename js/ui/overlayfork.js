function initOverlayFork()
{
	var jqOverlay = $('#uiOverlayFork');
	var jqStatus = jqOverlay.find('div.status');

	function setStatus(status)
	{
		jqStatus.hide();

		switch(status)
		{
			case 0: jqStatus.filter('.createButton').show(); break;
			case 1: jqStatus.filter('.loading').show(); break;
		}
	}

	jqOverlay.find('.createButton button').click(function() {
		setStatus(1);

		var urlId = null, snapshot = null;

		if(Config.boardServerState) // live board
		{
			urlId = Config.currentBoardMeta.urlId;
		}
		else
		{
			urlId = Config.currentBoardMeta.urlId;
			snapshot = Config.currentBoardMeta.snapshot;
		}

		var data = logicApp.system.board.storage.exportAll();
		var title = "Fork of " + Config.currentBoardMeta.title;

		Backend.createFork(title, data, function(result) {
			if(!!result)
			{
				Pages.go("/board/" + result.urlId);
				Event.send('openMessage', {title: 'Board forked', text: 'This is your copy of the board now. You can also find it in your workspace.'});
			}
			else
			{
				console.log("ERROR\tCould not create fork");
			}
		});
	});

	Event.on('overlayOpened', function(name) {
		if(name == 'Fork') setStatus(0);
	});
}

function loginComplete()
{
	if(Backend.isLoggedIn())
	{
		setTimeout(function() {
			openOverlay('Fork');
		}, 0);		
	}
}

Event.on('openForkOverlay', function() {
	if(Backend.isLoggedIn())
	{
		openOverlay('Fork');
	}
	else
	{
		openOverlay('Login');
		Event.send('setLoginOverlayCallback', loginComplete);
	}
});