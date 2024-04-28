function initOverlayBoardRename()
{
	var jqOverlay = $('#uiOverlayBoardName');
	var jqSaveButton = jqOverlay.find('.footerButton button');
	var jqInput = jqOverlay.find('input');

	function save()
	{
		closeOverlay();	

		var ctx = jqOverlay.data('ctx');
		var title = jqInput.val();
		console.log("save",ctx,title)

		if(title == '') title = 'Untitled';
		if(encodeURI(title)!=encodeURIComponent(title)){
			Event.send('openMessage', {title: 'Wrong title', text: 'Title cannot contain ; / ? : @ & = + $ , #'});
			return
		}
		/*
		if(ctx == null) // add
		{
			console.error('not implemented')
			Backend.addBoard(title);
		}
		else // rename
		{
			*/
			var data = logicApp.system.board.storage.exportAll();
			var buffer = logicApp.system.renderer.getPreviewBuffer(Config.maxPreviewEdge,true);
			var number = Backend.renameBoard(data, buffer, Config.currentBoardMeta.urlid, Config.currentBoardMeta.snapshot, title)
			if(number)
				Pages.go("/board/"+title+'/'+number)
			else {
				var q = title+' already exist'
				Event.send('openMessage', {title: q, text: 'please take another name'});
			}


		//}
	}

	jqSaveButton.click(save);
	jqInput.keypress(function(e) {
		if(e.which == 13) save();
	});

	Event.on('overlayOpened', function(name) {
		if(name == 'BoardName')
		{
			jqInput.select();
		}
	});
}

Event.on('openRenameBoard', function(data) {
	var jqOverlay = $('#uiOverlayBoardName');

	jqOverlay.data('ctx', data.ctx);
	jqOverlay.find('input').val(data.title);
	jqOverlay.find('button').text(data.rename ? 'Save' : 'Create');

	openOverlay('BoardName');
});