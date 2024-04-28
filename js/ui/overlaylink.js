function initOverlayLink()
{
	var jqOverlay = $("#uiOverlayLink");
	var jqStatus = jqOverlay.find('div.status');
	var jqPermalink = jqStatus.filter('.link').find('input');

	function setStatus(status)
	{
		jqStatus.hide();

		switch(status)
		{
			case 0: jqStatus.filter('.createButton').show(); break;
			case 1: jqStatus.filter('.loading').show(); break;
			case 2: jqStatus.filter('.link').show(); break;
		}
	}

	function onResult(result)
	{
		if(!!result.url)
		{
			jqPermalink.val(result.url);
		}

		if(!!result.urlId) // new board created!
		{
			Config.currentBoardMeta.urlid = result.urlId;
			Config.currentBoardMeta.snapshot = result.snapshot;
		}

		if(!!Config.currentBoardMeta.snapshot)
		{
			// switch to page (virtually)
			//Pages.simulateNativeSwitch(Pages.redirectUrl(result.rel), null, null);
			Pages.go(result.rel);
		}

		setStatus(2);
	}

	// transitions and logic
	jqOverlay.find('.createButton button').click(function() {
		setStatus(1);

		if(!!Config.boardServerState) // is live board?
		{
			console.error("not implemented")
			Backend.createSnapshot(onResult);
		}
		else // nope, it's just a local change
		{
			var data = logicApp.system.board.storage.exportAll();
			var buffer = logicApp.system.renderer.getPreviewBuffer(Config.maxPreviewEdge,true);

			if(Config.currentBoardMeta.snapshot != null) // create a new snapshot by local changes of an existing board
			{
				Backend.createSnapshotFromLocal(Config.currentBoardMeta.urlid, Config.currentBoardMeta.snapshot, data, buffer, onResult);
			}
			else // create an anonymous board and the first snapshot for it
			{
				Backend.createAnonymousBoard(Config.currentBoardMeta.title, data, buffer, onResult);
			}
		}
	});

	Event.on('overlayOpened', function(name) {
		if(name == 'Link') setStatus(0);
	});

	// helper on input click
	jqPermalink.click(function() {
		$(this).select();
	});
}


Event.onKey('button', 'openLink', function() {
	openOverlay('Link');
});